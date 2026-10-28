import {
  Coffee, Car, ShoppingBag, House, HeartPulse, GraduationCap,
  Clapperboard, CircleDollarSign, Wallet
} from 'lucide-react'

export const CATEGORIES = [
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

export const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

export const money = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0)

export const dateText = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const monthKey = (s) => s.slice(0, 7)
export const defaultDate = new Date().toISOString().slice(0, 10)
export const initialMonth = new Date().toISOString().slice(0, 7)