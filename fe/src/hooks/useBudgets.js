import { useState, useEffect } from 'react'

// Mức ngân sách mặc định ban đầu cho người dùng mới
export const DEFAULT_BUDGETS = {
  'Ăn uống': 2000000,
  'Di chuyển': 800000,
  'Mua sắm': 1500000,
  'Nhà cửa': 2500000,
  'Giải trí': 500000,
}

export function useBudgets(userId) {
  // 1. Khởi tạo State ngân sách
  const [budgets, setBudgets] = useState(() => {
    if (!userId) return DEFAULT_BUDGETS
    try {
      const saved = localStorage.getItem(`vi-nho-budgets_${userId}`)
      return saved ? JSON.parse(saved) : DEFAULT_BUDGETS
    } catch {
      return DEFAULT_BUDGETS
    }
  })

  // 2. Lắng nghe khi userId thay đổi (khi đăng nhập / đổi tài khoản) -> Nạp lại ngân sách đúng người dùng
  useEffect(() => {
    if (!userId) {
      setBudgets(DEFAULT_BUDGETS)
      return
    }

    try {
      const saved = localStorage.getItem(`vi-nho-budgets_${userId}`)
      if (saved) {
        setBudgets(JSON.parse(saved))
      } else {
        // Lần đầu người dùng này đăng nhập: Tạo mặc định & lưu lại vào localStorage riêng
        setBudgets(DEFAULT_BUDGETS)
        localStorage.setItem(`vi-nho-budgets_${userId}`, JSON.stringify(DEFAULT_BUDGETS))
      }
    } catch {
      setBudgets(DEFAULT_BUDGETS)
    }
  }, [userId])

  // 3. Hàm cập nhật ngân sách cho từng danh mục
  const updateBudget = (categoryName, value) => {
    const newValue = Math.max(0, Number(value) || 0)
    setBudgets((prevBudgets) => {
      const updated = { ...prevBudgets, [categoryName]: newValue }
      
      // Lưu ngay lập tức vào localStorage của user này
      if (userId) {
        localStorage.setItem(`vi-nho-budgets_${userId}`, JSON.stringify(updated))
      }
      return updated
    })
  }

  // 4. Trả về state ngân sách và hàm cập nhật
  return { budgets, updateBudget, setBudgets }
}