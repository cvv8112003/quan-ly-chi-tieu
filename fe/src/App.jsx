import * as XLSX from 'xlsx'
import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, ChartNoAxesCombined, Tags, Settings, Search,
  Plus, Bell, Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight,
  ArrowDownLeft, Coffee, Car, ShoppingBag, House, HeartPulse, GraduationCap,
  Clapperboard, CircleHelp, CalendarDays, Download, Link2, CheckCircle2, X,
  Pencil, Trash2, Menu, Sheet, RefreshCw, CircleDollarSign, Filter, MoreHorizontal,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'

const CATEGORIES = [
  { name: 'Ăn uống', icon: Coffee, color: '#f59e0b', kind: 'expense' },
  { name: 'Di chuyển', icon: Car, color: '#3b82f6', kind: 'expense' },
  { name: 'Mua sắm', icon: ShoppingBag, color: '#a78bfa', kind: 'expense' },
  { name: 'Nhà cửa', icon: House, color: '#14b8a6', kind: 'expense' },
  { name: 'Sức khỏe', icon: HeartPulse, color: '#f472b6', kind: 'expense' },
  { name: 'Giáo dục', icon: GraduationCap, color: '#6366f1', kind: 'expense' },
  { name: 'Giải trí', icon: Clapperboard, color: '#fb7185', kind: 'expense' },
  { name: 'Lương', icon: CircleDollarSign, color: '#10b981', kind: 'income' },
  { name: 'Thu nhập khác', icon: Wallet, color: '#22c55e', kind: 'income' },
]
const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
const money = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0)
const dateText = (s) => new Date(`${s}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const monthKey = (s) => s.slice(0, 7)
const defaultDate = new Date().toISOString().slice(0, 10)
const initialMonth = new Date().toISOString().slice(0, 7)

// Gọi Backend Spring Boot. Backend sẽ đọc/ghi Google Sheets ở phía máy chủ.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '')

async function readApiResponse(response) {
  const text = await response.text()
  let result
  try {
    result = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Backend trả về dữ liệu không hợp lệ. Hãy kiểm tra log Spring Boot.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Yêu cầu thất bại (HTTP ${response.status}).`)
  }
  return result
}

async function loadTransactionsFromApi() {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions`)
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy tại http://localhost:8080.')
  }

  const result = await readApiResponse(response)
  if (!Array.isArray(result.data)) {
    throw new Error('API giao dịch không trả về danh sách dữ liệu hợp lệ.')
  }
  return result.data.map(normalizeTransaction)
}

async function createTransactionApi(transaction) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...transaction,
        id: null,
        amount: Number(transaction.amount),
      }),
    })
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy.')
  }
  const result = await readApiResponse(response)
  return result.data ? normalizeTransaction(result.data) : null
}

async function updateTransactionApi(id, transaction) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...transaction,
        id,
        amount: Number(transaction.amount),
      }),
    })
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy.')
  }
  const result = await readApiResponse(response)
  return result.data ? normalizeTransaction(result.data) : null
}

async function deleteTransactionApi(id) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy.')
  }
  await readApiResponse(response)
}

function normalizeTransaction(row) {
  return {
    id: String(row.id ?? ''),
    date: String(row.date ?? '').slice(0, 10),
    title: String(row.title ?? row.transactionName ?? ''),
    type: String(row.type ?? 'expense').toLowerCase(),
    category: String(row.category ?? ''),
    amount: Number(row.amount ?? 0),
    method: String(row.method ?? row.paymentMethod ?? ''),
    note: String(row.note ?? ''),
  }
}


function App() {
  const [page, setPage] = useState('Tổng quan')
  const [mobileNav, setMobileNav] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [budgets, setBudgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vi-nho-budgets')) || { 'Ăn uống': 2000000, 'Di chuyển': 800000, 'Mua sắm': 1500000, 'Nhà cửa': 2500000, 'Giải trí': 500000 } } catch { return {} }
  })
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState('')
  const [sheetStatus, setSheetStatus] = useState('Chưa kết nối')
  const [syncing, setSyncing] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'Ăn uống', date: defaultDate, method: 'Chuyển khoản', note: '' })

  useEffect(() => localStorage.setItem('vi-nho-budgets', JSON.stringify(budgets)), [budgets])

  useEffect(() => {
    let cancelled = false

    async function fetchTransactions() {
      setLoadingTransactions(true)
      setSheetStatus('Đang tải dữ liệu từ Backend...')
      try {
        const rows = await loadTransactionsFromApi()
        if (cancelled) return
        setTransactions(rows)
        setSheetStatus('Đã tải dữ liệu từ Backend')
      } catch (error) {
        if (cancelled) return
        setSheetStatus('Không tải được dữ liệu')
        flash(error.message || 'Không tải được dữ liệu từ Backend.')
      } finally {
        if (!cancelled) setLoadingTransactions(false)
      }
    }

    fetchTransactions()
    return () => { cancelled = true }
  }, [])
  const monthTransactions = useMemo(() => transactions.filter(t => monthKey(t.date) === selectedMonth), [transactions, selectedMonth])
  const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense
  const filtered = useMemo(() => [...monthTransactions]
    .filter(t => (filterType === 'all' || t.type === filterType) && (filterCategory === 'all' || t.category === filterCategory))
    .filter(t => `${t.title} ${t.category} ${t.note || ''}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [monthTransactions, filterType, filterCategory, search])
  const categoryData = CATEGORIES.filter(c => c.kind === 'expense').map(c => ({
    name: c.name, value: monthTransactions.filter(t => t.type === 'expense' && t.category === c.name).reduce((s, t) => s + Number(t.amount), 0), color: c.color,
  })).filter(c => c.value > 0)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(`${selectedMonth}-01T00:00:00`)
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const ts = transactions.filter(t => monthKey(t.date) === key)
    return { month: MONTHS[d.getMonth()].replace('Tháng ', 'T'), Thu: ts.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0), Chi: ts.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0) }
  })
  const recent = [...monthTransactions].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5)

  function flash(message) { setNotice(message); setTimeout(() => setNotice(''), 2800) }
  function openAdd() {
    setEditing(null)
    setForm({ title: '', amount: '', type: 'expense', category: 'Ăn uống', date: defaultDate, method: 'Chuyển khoản', note: '' })
    setShowForm(true)
  }
  function openEdit(t) { setEditing(t); setForm({ ...t, amount: String(t.amount) }); setShowForm(true) }
  async function saveTransaction(e) {
    e.preventDefault()
    if (
      !form.title.trim() ||
      !form.date ||
      !form.type ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      flash('Vui lòng nhập tên, ngày và số tiền hợp lệ.')
      return
    }

    const item = {
      ...form,
      title: form.title.trim(),
      amount: Number(form.amount),
    }

    try {
      setSyncing(true)
      if (editing) {
        await updateTransactionApi(editing.id, item)
      } else {
        await createTransactionApi(item)
      }

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
    }
  }

  async function deleteTransaction(id) {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return

    try {
      setSyncing(true)
      await deleteTransactionApi(id)
      const rows = await loadTransactionsFromApi()
      setTransactions(rows)
      setSheetStatus('Đã đồng bộ dữ liệu từ Backend')
      flash('Đã xóa giao dịch thành công.')
    } catch (error) {
      setSheetStatus('Không xóa được giao dịch')
      flash(error.message || 'Không xóa được giao dịch.')
    } finally {
      setSyncing(false)
    }
  }

  async function connectSheet() {
    setLoadingTransactions(true)
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
    }
  }

  async function syncSheet() {
    setSyncing(true)
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
    }
  }

  function exportExcel() {
    // Các cột trong file Excel
    const rows = [
      [
        'Ngày giao dịch',
        'Tên giao dịch',
        'Loại giao dịch',
        'Danh mục',
        'Số tiền (VND)',
        'Phương thức thanh toán',
        'Ghi chú',
      ],
      ...filtered.map((t) => [
        t.date,
        t.title,
        t.type === 'income' ? 'Thu' : 'Chi',
        t.category,
        Number(t.amount) || 0,
        t.method || '',
        t.note || '',
      ]),
    ]

    // Tạo trang tính Excel
    const worksheet = XLSX.utils.aoa_to_sheet(rows)

    // Điều chỉnh độ rộng các cột
    worksheet['!cols'] = [
      { wch: 16 },
      { wch: 30 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
      { wch: 25 },
      { wch: 40 },
    ]

    // Định dạng cột số tiền
    for (let row = 1; row < rows.length; row++) {
      const cell = XLSX.utils.encode_cell({ r: row, c: 4 })
      if (worksheet[cell]) {
        worksheet[cell].z = '#,##0'
      }
    }

    // Tạo file Excel
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Giao dịch')

    // Tải file về máy
    XLSX.writeFile(workbook, `giao-dich-${selectedMonth}.xlsx`)
  }

  function updateBudget(name, value) { setBudgets(old => ({ ...old, [name]: Math.max(0, Number(value) || 0) })) }

  const nav = [
    { label: 'Tổng quan', icon: LayoutDashboard },
    { label: 'Giao dịch', icon: ArrowLeftRight },
    { label: 'Báo cáo', icon: ChartNoAxesCombined },
    { label: 'Ngân sách', icon: PiggyBank },
    { label: 'Danh mục', icon: Tags },
    { label: 'Kết nối Backend', icon: Sheet },
  ]
  const heading = page === 'Tổng quan' ? 'Tổng quan tài chính' : page
  const activePage = (p) => { setPage(p); setMobileNav(false) }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      {mobileNav && <button className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={() => setMobileNav(false)} aria-label="Đóng menu" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-slate-100 bg-white px-5 py-6 transition-transform md:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200"><Wallet size={23} /></div>
          <div><div className="text-xl font-extrabold tracking-tight">ví nhỏ<span className="text-emerald-500">.</span></div><div className="text-xs text-slate-400">Quản lý tiền thông minh</div></div>
        </div>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Không gian của bạn</div>
        <nav className="space-y-1">
          {nav.map(({ label, icon: Icon }) => <button key={label} onClick={() => activePage(label)} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${page === label ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Icon size={19} strokeWidth={1.9} />{label}{label === 'Kết nối Backend' && <span className={`ml-auto h-2 w-2 rounded-full ${sheetStatus.includes('kết nối') || sheetStatus.includes('đồng bộ') || sheetStatus.includes('Đã tải') ? 'bg-emerald-500' : 'bg-amber-400'}`} />}</button>)}
        </nav>
        <div className="mt-auto">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold"><PiggyBank size={18} /> Mẹo tiết kiệm</div>
            <p className="text-xs leading-5 text-emerald-50">Theo dõi chi tiêu mỗi ngày để hiểu rõ tiền của bạn đang đi đâu.</p>
            <button onClick={() => activePage('Báo cáo')} className="mt-3 flex items-center gap-1 text-xs font-bold">Xem báo cáo <ArrowUpRight size={14} /></button>
          </div>
          <button onClick={() => activePage('Cài đặt')} className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"><Settings size={18} /> Cài đặt</button>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">V</div>
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">Ví cá nhân</div><div className="text-xs text-slate-400">Gói miễn phí</div></div><MoreHorizontal size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <main className="min-h-screen md:ml-[250px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div><div className="text-xs text-slate-400">Xin chào, chúc bạn một ngày tốt lành 👋</div><h1 className="mt-0.5 text-lg font-extrabold tracking-tight md:text-xl">{heading}</h1></div></div>
          <div className="flex items-center gap-2 md:gap-4">
            <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:flex"><CalendarDays size={16}/><select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="max-w-[120px] bg-transparent text-sm font-semibold text-slate-700 outline-none">{Array.from({length: 18}, (_, i) => { const d = new Date('2026-10-01T00:00:00'); d.setMonth(d.getMonth() - i); const v = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; return <option key={v} value={v}>{MONTHS[d.getMonth()]} {d.getFullYear()}</option> })}</select></label>
            <button onClick={() => flash('Bạn đang xem thông báo mới nhất.')} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"><Bell size={19}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500"/></button>
            <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-600 md:px-4"><Plus size={17}/><span className="hidden sm:inline">Thêm giao dịch</span><span className="sm:hidden">Thêm</span></button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-8">
          {page === 'Tổng quan' && <>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-500">Đây là tình hình tài chính của bạn trong</p><h2 className="mt-1 text-2xl font-extrabold">{MONTHS[Number(selectedMonth.slice(5))-1]} <span className="text-emerald-600">{selectedMonth.slice(0,4)}</span></h2></div><button onClick={exportExcel} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-emerald-300"><Download size={16}/> Xuất báo cáo</button></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Số dư tháng" amount={money(balance)} icon={Wallet} tone="green" caption="Thu nhập − Chi tiêu" />
              <StatCard title="Tổng thu nhập" amount={money(income)} icon={TrendingUp} tone="blue" caption={`${monthTransactions.filter(t=>t.type==='income').length} giao dịch thu`} />
              <StatCard title="Tổng chi tiêu" amount={money(expense)} icon={TrendingDown} tone="rose" caption={`${monthTransactions.filter(t=>t.type==='expense').length} giao dịch chi`} />
              <StatCard title="Tỷ lệ tiết kiệm" amount={`${income ? Math.round((balance / income) * 100) : 0}%`} icon={PiggyBank} tone="violet" caption="Số dư / Tổng thu nhập" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/70 md:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-extrabold">Dòng tiền của bạn</h3><p className="mt-1 text-xs text-slate-400">Theo dõi thu nhập và chi tiêu 6 tháng gần nhất</p></div><span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">VND</span></div>
                <div className="h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{top:10,right:5,left:0,bottom:0}}><defs><linearGradient id="thuColor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient><linearGradient id="chiColor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb7185" stopOpacity={0.15}/><stop offset="95%" stopColor="#fb7185" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#eef1f6" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}} tickFormatter={v=>v>=1000000?`${(v/1000000).toFixed(0)}tr`:`${Math.round(v/1000)}k`} width={42}/><Tooltip formatter={v=>money(v)} contentStyle={{borderRadius:12,border:'1px solid #eef1f6',fontSize:12}}/><Area type="monotone" dataKey="Thu" stroke="#10b981" strokeWidth={2.5} fill="url(#thuColor)"/><Area type="monotone" dataKey="Chi" stroke="#fb7185" strokeWidth={2.5} fill="url(#chiColor)"/></AreaChart></ResponsiveContainer></div>
                <div className="mt-3 flex justify-center gap-5 text-xs font-semibold text-slate-500"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500"/>Thu nhập</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-rose-400"/>Chi tiêu</span></div>
              </section>
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/70 md:p-6">
                <div className="mb-2"><h3 className="font-extrabold">Chi tiêu theo danh mục</h3><p className="mt-1 text-xs text-slate-400">Phân bổ chi tiêu trong tháng</p></div>
                {categoryData.length ? <><div className="relative h-[200px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none">{categoryData.map(c=><Cell key={c.name} fill={c.color}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-xs text-slate-400">Tổng chi</span><strong className="mt-1 text-lg font-extrabold">{money(expense)}</strong></div></div><div className="mt-1 space-y-3">{categoryData.sort((a,b)=>b.value-a.value).slice(0,4).map(c=><div key={c.name} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full" style={{background:c.color}}/><span className="flex-1 text-slate-500">{c.name}</span><span className="font-bold">{Math.round(c.value/(expense||1)*100)}%</span><span className="w-24 text-right text-xs text-slate-400">{money(c.value)}</span></div>)}</div></> : <EmptyState text="Chưa có chi tiêu trong tháng này."/>}
              </section>
            </div>
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100/70">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 md:px-6"><div><h3 className="font-extrabold">Giao dịch gần đây</h3><p className="mt-1 text-xs text-slate-400">Những khoản thu chi mới nhất của bạn</p></div><button onClick={()=>activePage('Giao dịch')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Xem tất cả <ArrowUpRight size={15} className="ml-1 inline"/></button></div>
              {loadingTransactions ? <p className="p-6 text-sm text-slate-500">Đang tải giao dịch từ Backend...</p> : <TransactionTable rows={recent} onEdit={openEdit} onDelete={deleteTransaction}/>}
            </section>
          </>}

          {page === 'Giao dịch' && <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold">Tất cả giao dịch</h2><p className="mt-1 text-sm text-slate-400">Quản lý các khoản thu và chi của bạn</p></div><button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white"><Plus size={16}/> Thêm giao dịch</button></div>
              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_170px_190px_auto]"><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5"><Search size={17} className="text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm giao dịch..." className="w-full text-sm outline-none"/></label><select value={filterType} onChange={e=>setFilterType(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"><option value="all">Tất cả loại</option><option value="income">Khoản thu</option><option value="expense">Khoản chi</option></select><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"><option value="all">Tất cả danh mục</option>{CATEGORIES.map(c=><option key={c.name}>{c.name}</option>)}</select><button onClick={exportExcel} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600"><Download size={16}/> Excel</button></div>
            </div><TransactionTable rows={filtered} onEdit={openEdit} onDelete={deleteTransaction}/>
            {!filtered.length && <EmptyState text="Không tìm thấy giao dịch phù hợp."/>}
          </section>}

          {page === 'Báo cáo' && <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><StatCard title="Tổng thu nhập" amount={money(income)} icon={TrendingUp} tone="green" caption="Trong tháng đang chọn"/><StatCard title="Tổng chi tiêu" amount={money(expense)} icon={TrendingDown} tone="rose" caption="Trong tháng đang chọn"/><StatCard title="Chênh lệch thu chi" amount={money(balance)} icon={CircleDollarSign} tone="blue" caption={balance>=0?'Bạn đang chi tiêu trong khả năng':'Chi tiêu vượt thu nhập'}/></div><div className="grid gap-6 xl:grid-cols-2"><section className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6"><h3 className="font-extrabold">Thu nhập và chi tiêu</h3><p className="mt-1 text-xs text-slate-400">So sánh 6 tháng gần đây</p><div className="mt-5 h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><CartesianGrid stroke="#eef1f6" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} tickFormatter={v=>`${Math.round(v/1000)}k`}/><Tooltip formatter={v=>money(v)}/><Area dataKey="Thu" stroke="#10b981" fill="#a7f3d0" fillOpacity={0.5}/><Area dataKey="Chi" stroke="#fb7185" fill="#fecdd3" fillOpacity={0.45}/></AreaChart></ResponsiveContainer></div></section><section className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6"><h3 className="font-extrabold">Chi tiết theo danh mục</h3><p className="mt-1 text-xs text-slate-400">Danh mục chi tiêu trong tháng</p><div className="mt-6 space-y-5">{CATEGORIES.filter(c=>c.kind==='expense').map(c=>{const v=categoryData.find(x=>x.name===c.name)?.value||0;return <div key={c.name}><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{c.name}</span><span className="font-bold">{money(v)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{width:`${expense?Math.min(100,v/expense*100):0}%`,background:c.color}}/></div></div>})}</div></section></div></div>}

          {page === 'Ngân sách' && <div className="space-y-5"><div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-emerald-50">Ngân sách chi tiêu tháng</p><h2 className="mt-2 text-3xl font-extrabold">{money(Object.values(budgets).reduce((s,v)=>s+Number(v),0))}</h2><p className="mt-2 text-sm text-emerald-50">Đặt giới hạn để chủ động kiểm soát tiền của bạn.</p></div><div className="rounded-2xl bg-white/15 p-3"><PiggyBank size={30}/></div></div></div><div className="grid gap-4 lg:grid-cols-2">{CATEGORIES.filter(c=>c.kind==='expense').map(c=>{const spent=monthTransactions.filter(t=>t.type==='expense'&&t.category===c.name).reduce((s,t)=>s+Number(t.amount),0);const limit=Number(budgets[c.name]||0);const pct=limit?spent/limit*100:0;const Icon=c.icon;return <div key={c.name} className="rounded-2xl border border-slate-100 bg-white p-5"><div className="flex items-center gap-3"><div className="rounded-xl p-3" style={{background:`${c.color}18`,color:c.color}}><Icon size={20}/></div><div className="flex-1"><h3 className="font-bold">{c.name}</h3><p className="text-xs text-slate-400">Đã sử dụng {Math.min(999,Math.round(pct))}% ngân sách</p></div><span className={`rounded-lg px-2 py-1 text-xs font-bold ${pct>100?'bg-rose-50 text-rose-600':'bg-emerald-50 text-emerald-600'}`}>{pct>100?'Vượt mức':limit? 'Đang theo dõi':'Chưa đặt'}</span></div><div className="mt-5 flex items-baseline justify-between gap-3"><strong className="text-lg">{money(spent)}</strong><span className="text-xs text-slate-400">Ngân sách: {money(limit)}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{width:`${limit?Math.min(100,pct):0}%`,background:pct>100?'#f43f5e':c.color}}/></div><label className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">Giới hạn tháng <input type="number" min="0" value={limit} onChange={e=>updateBudget(c.name,e.target.value)} className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-right text-sm text-slate-800 outline-none focus:border-emerald-400"/></label></div>})}</div></div>}

          {page === 'Danh mục' && <section className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6"><h2 className="text-lg font-extrabold">Danh mục thu chi</h2><p className="mt-1 text-sm text-slate-400">Các danh mục đang dùng trong sổ chi tiêu</p><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{CATEGORIES.map(c=>{const Icon=c.icon;return <div key={c.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"><div className="rounded-xl p-3" style={{background:`${c.color}18`,color:c.color}}><Icon size={20}/></div><div className="flex-1"><div className="font-bold">{c.name}</div><div className="mt-1 text-xs text-slate-400">{c.kind==='income'?'Danh mục thu nhập':'Danh mục chi tiêu'}</div></div><span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">{transactions.filter(t=>t.category===c.name).length} GD</span></div>})}</div><p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Danh mục hiện là danh mục cấu hình sẵn trong giao diện. Có thể bổ sung chức năng tạo/sửa/xóa danh mục ở bước phát triển tiếp theo.</p></section>}

          {page === 'Kết nối Backend' && <div className="mx-auto max-w-3xl space-y-6"><section className="overflow-hidden rounded-2xl border border-slate-100 bg-white"><div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 md:p-8"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white p-4 text-emerald-600 shadow-sm"><Sheet size={30}/></div><div><h2 className="text-xl font-extrabold">Kết nối Backend Spring Boot</h2><p className="mt-1 text-sm text-slate-500">Frontend lấy dữ liệu từ API Backend; Backend chịu trách nhiệm đọc và ghi Google Sheets.</p></div></div></div><div className="space-y-5 p-6 md:p-8"><div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900"><CircleHelp size={19} className="mt-0.5 shrink-0"/><div><strong>Kiểm tra cấu hình Backend</strong><p className="mt-1 leading-6">Đảm bảo Spring Boot đang chạy ở cổng 8080 và đã thiết lập biến môi trường <code>GOOGLE_SCRIPT_URL</code> trỏ đến URL Web App của Apps Script.</p></div></div><div className="rounded-xl border border-slate-200 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Địa chỉ API</div><div className="mt-1 break-all font-mono text-sm font-semibold text-slate-700">{API_BASE_URL}</div><div className="mt-2 text-xs text-slate-400">Cấu hình trong biến VITE_API_BASE_URL ở file .env của FE.</div></div><div className="flex flex-wrap gap-3"><button type="button" onClick={connectSheet} disabled={loadingTransactions} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50"><Link2 size={17}/> Kiểm tra kết nối</button><button type="button" onClick={syncSheet} disabled={syncing} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} className={syncing?'animate-spin':''}/> {syncing?'Đang tải...':'Tải lại giao dịch'}</button></div><div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${sheetStatus.includes('kết nối') || sheetStatus.includes('đồng bộ') || sheetStatus.includes('Đã tải') || sheetStatus.includes('Đã lưu') ? 'bg-emerald-500' : 'bg-amber-400'}`}/><span className="font-semibold">Trạng thái:</span><span className="text-slate-500">{loadingTransactions ? 'Đang tải...' : syncing ? 'Đang đồng bộ...' : sheetStatus}</span></div><div className="border-t border-slate-100 pt-5"><h3 className="font-bold">Dữ liệu giao dịch</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{['Ngày giao dịch','Tên giao dịch','Thu hay chi','Danh mục','Số tiền VND','Phương thức thanh toán','Ghi chú','Mã giao dịch'].map(x=><div key={x} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 size={16} className="text-emerald-500"/>{x}</div>)}</div></div></div></section><div className="rounded-2xl border border-slate-100 bg-white p-5"><h3 className="font-extrabold">Luồng dữ liệu</h3><p className="mt-2 text-sm leading-6 text-slate-500">React gọi API Spring Boot tại địa chỉ trên. Backend đọc và ghi Google Sheets. Nếu không kết nối được, ứng dụng hiển thị lỗi thay vì tạo giao dịch mẫu.</p></div></div>}

          {page === 'Cài đặt' && <section className="mx-auto max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 md:p-8"><h2 className="text-lg font-extrabold">Cài đặt cá nhân</h2><p className="mt-1 text-sm text-slate-400">Quản lý dữ liệu trên trình duyệt này</p><div className="mt-6 divide-y divide-slate-100"><div className="flex items-center justify-between gap-4 py-4"><div><div className="font-bold">Sao lưu giao dịch</div><div className="mt-1 text-xs text-slate-400">Tải các giao dịch đang lọc về dạng Excel.</div></div><button onClick={exportExcel} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><Download size={15} className="mr-1 inline"/> Xuất Excel</button></div></div></section>}
        </div>
        <footer className="px-4 pb-7 text-center text-xs text-slate-400 md:px-8">© 2026 Ví Nhỏ · Chi tiêu rõ ràng, tương lai vững vàng.</footer>
      </main>

      {showForm && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false)}}><form onSubmit={saveTransaction} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-xl font-extrabold">{editing?'Chỉnh sửa giao dịch':'Thêm giao dịch mới'}</h2><p className="mt-1 text-sm text-slate-400">Ghi lại để kiểm soát dòng tiền của bạn.</p></div><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={20}/></button></div><div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={()=>setForm(f=>({...f,type:'expense',category:'Ăn uống'}))} className={`rounded-lg py-2.5 text-sm font-bold ${form.type==='expense'?'bg-white text-rose-600 shadow-sm':'text-slate-500'}`}><ArrowUpRight size={16} className="mr-1 inline"/> Khoản chi</button><button type="button" onClick={()=>setForm(f=>({...f,type:'income',category:'Lương'}))} className={`rounded-lg py-2.5 text-sm font-bold ${form.type==='income'?'bg-white text-emerald-600 shadow-sm':'text-slate-500'}`}><ArrowDownLeft size={16} className="mr-1 inline"/> Khoản thu</button></div><div className="space-y-4"><label className="block"><span className="mb-1.5 block text-sm font-bold">Tên giao dịch *</span><input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="VD: Ăn trưa, tiền điện..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"/></label><label className="block"><span className="mb-1.5 block text-sm font-bold">Số tiền (VND) *</span><input required min="1" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-emerald-400"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-bold">Danh mục</span><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none">{CATEGORIES.filter(c=>c.kind===form.type).map(c=><option key={c.name}>{c.name}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-sm font-bold">Ngày giao dịch</span><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none"/></label></div><label className="block"><span className="mb-1.5 block text-sm font-bold">Phương thức thanh toán</span><select value={form.method} onChange={e=>setForm(f=>({...f,method:e.target.value}))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none">{['Tiền mặt','Chuyển khoản','Thẻ ngân hàng','Ví điện tử'].map(x=><option key={x}>{x}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-sm font-bold">Ghi chú</span><textarea rows="2" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Ghi chú thêm (không bắt buộc)" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"/></label></div><div className="mt-6 flex gap-3"><button type="button" onClick={()=>setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600">Hủy</button><button type="submit" className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600">{editing?'Lưu thay đổi':'Thêm giao dịch'}</button></div></form></div>}
      {notice && <div role="status" className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-40px)] items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl"><CheckCircle2 size={17} className="text-emerald-400"/>{notice}</div>}
    </div>
  )
}

function StatCard({ title, amount, icon: Icon, tone, caption }) {
  const styles = { green: 'bg-emerald-50 text-emerald-600', blue: 'bg-blue-50 text-blue-600', rose: 'bg-rose-50 text-rose-500', violet: 'bg-violet-50 text-violet-600' }
  return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/60"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">{title}</span><span className={`rounded-xl p-2.5 ${styles[tone]}`}><Icon size={19}/></span></div><div className="mt-4 break-words text-xl font-extrabold tracking-tight md:text-2xl">{amount}</div><div className="mt-2 text-xs text-slate-400">{caption}</div></div>
}
function TransactionTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return <EmptyState text="Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!" />
  return <div className="custom-scrollbar overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-3.5">Giao dịch</th><th className="px-4 py-3.5">Danh mục</th><th className="px-4 py-3.5">Ngày</th><th className="px-4 py-3.5 text-right">Số tiền</th><th className="px-6 py-3.5 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-50">{rows.map(t=>{const c=CATEGORIES.find(x=>x.name===t.category)||CATEGORIES[0];const Icon=c.icon;return <tr key={t.id} className="transition hover:bg-slate-50/70"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="rounded-xl p-2.5" style={{background:`${c.color}18`,color:c.color}}><Icon size={18}/></div><div><div className="text-sm font-bold text-slate-700">{t.title}</div><div className="mt-0.5 text-xs text-slate-400">{t.method||'—'}</div></div></div></td><td className="px-4 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">{t.category}</span></td><td className="px-4 py-4 text-sm text-slate-500">{dateText(t.date)}</td><td className={`px-4 py-4 text-right text-sm font-extrabold ${t.type==='income'?'text-emerald-600':'text-slate-700'}`}>{t.type==='income'?'+':'−'}{money(t.amount)}</td><td className="px-6 py-4"><div className="flex justify-end gap-1"><button onClick={()=>onEdit(t)} title="Sửa" className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Pencil size={16}/></button><button onClick={()=>onDelete(t.id)} title="Xóa" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={16}/></button></div></td></tr>})}</tbody></table></div>
}
function EmptyState({ text }) { return <div className="flex flex-col items-center justify-center px-5 py-12 text-center"><div className="mb-3 rounded-2xl bg-slate-50 p-4 text-slate-300"><Filter size={25}/></div><p className="text-sm text-slate-500">{text}</p></div> }

export default App
