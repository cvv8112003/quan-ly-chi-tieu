import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../api/transactionApi'

export const DEFAULT_BUDGETS = {
  'Ăn uống': 2000000,
  'Di chuyển': 800000,
  'Mua sắm': 1500000,
  'Nhà cửa': 2500000,
  'Giải trí': 500000,
}

export function useBudgets(userId) {
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS)
  const [loading, setLoading] = useState(false)

  // 1. Tải ngân sách từ Backend / Google Sheets khi userId thay đổi
  useEffect(() => {
    if (!userId) {
      setBudgets(DEFAULT_BUDGETS)
      return
    }

    async function fetchBudgets() {
      setLoading(true)
      try {
        const token = localStorage.getItem('vi-nho-token')
        const response = await fetch(`${API_BASE_URL}/api/budgets?userId=${encodeURIComponent(userId)}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        })
        const result = await response.json()

        if (result.success && result.data && Object.keys(result.data).length > 0) {
          setBudgets(result.data)
          // Lưu cache lại ở LocalStorage
          localStorage.setItem(`vi-nho-budgets_${userId}`, JSON.stringify(result.data))
        } else {
          // Nếu user mới chưa thiết lập ngân sách trên Sheet -> Dùng mặc định
          setBudgets(DEFAULT_BUDGETS)
        }
      } catch (error) {
        console.error('Lỗi tải ngân sách từ Google Sheets:', error)
        // Nếu lỗi mạng, đọc tạm từ cache LocalStorage
        const saved = localStorage.getItem(`vi-nho-budgets_${userId}`)
        if (saved) setBudgets(JSON.parse(saved))
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [userId])

  // 2. Hàm cập nhật ngân sách & đồng bộ lên Google Sheets
  const updateBudget = async (categoryName, value) => {
    const numericValue = Math.max(0, Number(value) || 0)
    const newBudgets = { ...budgets, [categoryName]: numericValue }

    // Cập nhật State giao diện ngay lập tức cho mượt
    setBudgets(newBudgets)

    if (!userId) return

    // Lưu cache LocalStorage ngay lập tức
    localStorage.setItem(`vi-nho-budgets_${userId}`, JSON.stringify(newBudgets))

    // Gọi API lưu lên Google Sheets
    try {
      const token = localStorage.getItem('vi-nho-token')
      await fetch(`${API_BASE_URL}/api/budgets`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          budgets: newBudgets
        }),
      })
    } catch (error) {
      console.error('Lỗi lưu ngân sách lên Google Sheets:', error)
    }
  }

  return { budgets, updateBudget, loading }
}