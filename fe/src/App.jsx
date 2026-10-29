import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import API_BASE_URL from './config/api';

import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'

import { Layout } from './components/Layout'
import { TransactionModal } from './components/TransactionModal'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { ReportsPage } from './pages/ReportsPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ConnectPage } from './pages/ConnectPage'
import { SettingsPage } from './pages/SettingsPage'

import { CATEGORIES, MONTHS, monthKey, initialMonth } from './constants/categories'
import {
  loadTransactionsFromApi,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
} from './api/transactionApi'
import { logoutUser } from './utils/auth'

import { useBudgets } from './hooks/useBudgets'

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vi-nho-user')) || null
    } catch {
      return null
    }
  })  

  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const { budgets, updateBudget } = useBudgets(user?.id)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState('')
  const [sheetStatus, setSheetStatus] = useState('Chưa kết nối')
  const [syncing, setSyncing] = useState(false)
  const [serverStatus, setServerStatus] = useState('')

  const handleLogout = () => {
    logoutUser(() => {
      localStorage.removeItem('vi-nho-user')
      setUser(null)
    })
  }

  useEffect(() => localStorage.setItem('vi-nho-budgets', JSON.stringify(budgets)), [budgets])

  useEffect(() => {
    let cancelled = false
    async function fetchTransactions() {
      if (!user?.id) {
        setTransactions([])
        setLoadingTransactions(false)
        return
      }

      setLoadingTransactions(true)
      setServerStatus('Đang đồng bộ giao dịch từ máy chủ...')
      setSheetStatus('Đang tải dữ liệu từ Backend...')
      
      try {
        setTransactions([])
        const rows = await loadTransactionsFromApi()
        if (cancelled) return
        
        setTransactions(rows)
        setSheetStatus('Đã tải dữ liệu từ Backend')
      } catch (error) {
        if (cancelled) return
        setSheetStatus('Không tải được dữ liệu')
        flash(error.message || 'Không tải được dữ liệu từ Backend.')
      } finally {
        if (!cancelled) {
          setLoadingTransactions(false)
          setServerStatus('')
        }
      }
    }

    fetchTransactions()
    return () => { cancelled = true }
  }, [user?.id])

  const monthTransactions = useMemo(() => transactions.filter((t) => monthKey(t.date) === selectedMonth), [transactions, selectedMonth])
  const income = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  const filtered = useMemo(() => [...monthTransactions]
    .filter((t) => (filterType === 'all' || t.type === filterType) && (filterCategory === 'all' || t.category === filterCategory))
    .filter((t) => `${t.title} ${t.category} ${t.note || ''}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [monthTransactions, filterType, filterCategory, search])

  const categoryData = CATEGORIES.filter((c) => c.kind === 'expense').map((c) => ({
    name: c.name, value: monthTransactions.filter((t) => t.type === 'expense' && t.category === c.name).reduce((s, t) => s + Number(t.amount), 0), color: c.color,
  })).filter((c) => c.value > 0)

  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(`${selectedMonth}-01T00:00:00`)
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const ts = transactions.filter((t) => monthKey(t.date) === key)
    return {
      month: MONTHS[d.getMonth()].replace('Tháng ', 'T'),
      Thu: ts.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      Chi: ts.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    }
  })

  const recent = [...monthTransactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  function flash(message) {
    setNotice(message)
    setTimeout(() => setNotice(''), 2800)
  }

  function openAdd() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(t) {
    setEditing(t)
    setShowForm(true)
  }

  async function saveTransaction(form) {
    if (!form.title.trim() || !form.date || !form.type || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      flash('Vui lòng nhập tên, ngày và số tiền hợp lệ.')
      return
    }

    const item = { ...form, title: form.title.trim(), amount: Number(form.amount) }

    try {
      setSyncing(true)
      setServerStatus(editing ? 'Máy chủ đang cập nhật giao dịch...' : 'Máy chủ đang lưu giao dịch mới...')
      if (editing) {
        await updateTransactionApi(editing.id, item)
      } else {
        await createTransactionApi(item)
      }
      setServerStatus('Đang làm mới danh sách...')
      const rows = await loadTransactionsFromApi()
      setTransactions(rows)
      setShowForm(false)
      setSheetStatus('Đã đồng bộ dữ liệu từ Backend')
      flash(editing ? 'Đã cập nhật giao dịch thành công.' : 'Đã thêm giao dịch thành công.')
    } catch (error) {
      setSheetStatus('Không lưu được giao dịch')
      flash(error.message || 'Không lưu được giao dịch.')
    } finally {
      setSyncing(false)
      setServerStatus('')
    }
  }

  async function deleteTransaction(id) {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return

    try {
      setSyncing(true)
      setServerStatus('Máy chủ đang xóa giao dịch...')
      await deleteTransactionApi(id)
      setServerStatus('Đang cập nhật danh sách...')
      const rows = await loadTransactionsFromApi()
      setTransactions(rows)
      setSheetStatus('Đã đồng bộ dữ liệu từ Backend')
      flash('Đã xóa giao dịch thành công.')
    } catch (error) {
      setSheetStatus('Không xóa được giao dịch')
      flash(error.message || 'Không xóa được giao dịch.')
    } finally {
      setSyncing(false)
      setServerStatus('')
    }
  }

  async function connectSheet() {
    setLoadingTransactions(true)
    setServerStatus('Đang kiểm tra phản hồi từ Backend...')
    setSheetStatus('Đang kiểm tra Backend...')
    try {
      const rows = await loadTransactionsFromApi()
      setTransactions(rows)
      setSheetStatus('Backend đã kết nối')
      flash(`Kết nối thành công. Đã tải ${rows.length} giao dịch.`)
    } catch (error) {
      setSheetStatus('Không kết nối được Backend')
      flash(error.message || 'Hãy kiểm tra Backend và cấu hình Google Apps Script.')
    } finally {
      setLoadingTransactions(false)
      setServerStatus('')
    }
  }

  async function syncSheet() {
    setSyncing(true)
    setServerStatus('Máy chủ đang tải lại toàn bộ giao dịch...')
    try {
      const rows = await loadTransactionsFromApi()
      setTransactions(rows)
      setSheetStatus('Đã đồng bộ dữ liệu từ Backend')
      flash(`Đã tải ${rows.length} giao dịch từ Backend.`)
    } catch (error) {
      setSheetStatus('Đồng bộ thất bại')
      flash(error.message || 'Không đồng bộ được dữ liệu.')
    } finally {
      setSyncing(false)
      setServerStatus('')
    }
  }

  function exportExcel() {
    const rows = [
      ['Ngày giao dịch', 'Tên giao dịch', 'Loại giao dịch', 'Danh mục', 'Số tiền (VND)', 'Phương thức thanh toán', 'Ghi chú'],
      ...filtered.map((t) => [
        t.date, t.title, t.type === 'income' ? 'Thu' : 'Chi', t.category, Number(t.amount) || 0, t.method || '', t.note || ''
      ]),
    ]
    const worksheet = XLSX.utils.aoa_to_sheet(rows)
    worksheet['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 25 }, { wch: 40 }]
    for (let row = 1; row < rows.length; row++) {
      const cell = XLSX.utils.encode_cell({ r: row, c: 4 })
      if (worksheet[cell]) worksheet[cell].z = '#,##0'
    }
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Giao dịch')
    XLSX.writeFile(workbook, `giao-dich-${selectedMonth}.xlsx`)
  }

  // Hàm xử lý gọi API đổi mật khẩu gửi tới Spring Boot
  const handleUpdatePassword = async ({ currentPassword, newPassword }) => {
    try {
      const userId = user?.id || user?.email;

      if (!userId) {
        alert("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại!");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && (data.success !== false)) {
        alert(data.message || "Cập nhật mật khẩu thành công!");
      } else {
        alert(data.message || "Có lỗi xảy ra khi cập nhật mật khẩu.");
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={<AuthPage onAuthSuccess={(u) => {
            setUser(u);
            localStorage.setItem('vi-nho-user', JSON.stringify(u));
          }} />} 
        />

        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Layout
                user={user}
                onLogout={handleLogout}
                sheetStatus={sheetStatus}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                openAdd={openAdd}
                flash={flash}
                notice={notice}
                serverStatus={serverStatus}
              />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <DashboardPage
                selectedMonth={selectedMonth}
                balance={balance}
                income={income}
                expense={expense}
                monthTransactions={monthTransactions}
                trendData={trendData}
                categoryData={categoryData}
                recent={recent}
                loadingTransactions={loadingTransactions}
                exportExcel={exportExcel}
                openEdit={openEdit}
                deleteTransaction={deleteTransaction}
              />
            }
          />
          <Route
            path="transactions"
            element={
              <TransactionsPage
                filtered={filtered}
                search={search}
                setSearch={setSearch}
                filterType={filterType}
                setFilterType={setFilterType}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                loadingTransactions={loadingTransactions}
                openAdd={openAdd}
                openEdit={openEdit}
                deleteTransaction={deleteTransaction}
                exportExcel={exportExcel}
              />
            }
          />
          <Route
            path="reports"
            element={
              <ReportsPage
                income={income}
                expense={expense}
                balance={balance}
                trendData={trendData}
                categoryData={categoryData}
                loadingTransactions={loadingTransactions}
              />
            }
          />
          <Route
            path="budgets"
            element={
              <BudgetsPage
                budgets={budgets}
                updateBudget={updateBudget}
                monthTransactions={monthTransactions}
              />
            }
          />
          <Route
            path="categories"
            element={<CategoriesPage transactions={transactions} />}
          />
          <Route
            path="connect"
            element={
              <ConnectPage
                sheetStatus={sheetStatus}
                loadingTransactions={loadingTransactions}
                syncing={syncing}
                connectSheet={connectSheet}
                syncSheet={syncSheet}
              />
            }
          />
          <Route
            path="settings"
            element={
              <SettingsPage 
                user={user} 
                onUpdatePassword={handleUpdatePassword} 
                exportExcel={exportExcel} 
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <TransactionModal
        show={showForm}
        editing={editing}
        syncing={syncing}
        onClose={() => setShowForm(false)}
        onSave={saveTransaction}
      />
    </BrowserRouter>
  )
}