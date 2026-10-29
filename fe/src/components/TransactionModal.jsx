import { useState, useEffect } from 'react'
import { X, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react'
import { CATEGORIES, defaultDate } from '../constants/categories'

import { CurrencyInput } from '../components/CurrencyInput'

export function TransactionModal({ show, editing, syncing, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', amount: '', type: 'expense', category: 'Ăn uống', date: defaultDate, method: 'Chuyển khoản', note: ''
  })

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, amount: String(editing.amount) })
    } else {
      setForm({ title: '', amount: '', type: 'expense', category: 'Ăn uống', date: defaultDate, method: 'Chuyển khoản', note: '' })
    }
  }, [editing, show])

  if (!show) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !syncing) onClose() }}>
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold">{editing ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}</h2>
            <p className="mt-1 text-sm text-slate-400">Ghi lại để kiểm soát dòng tiền của bạn.</p>
          </div>
          <button type="button" disabled={syncing} onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button type="button" disabled={syncing} onClick={() => setForm((f) => ({ ...f, type: 'expense', category: 'Ăn uống' }))} className={`rounded-lg py-2.5 text-sm font-bold ${form.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>
            <ArrowUpRight size={16} className="mr-1 inline" /> Khoản chi
          </button>
          <button type="button" disabled={syncing} onClick={() => setForm((f) => ({ ...f, type: 'income', category: 'Lương' }))} className={`rounded-lg py-2.5 text-sm font-bold ${form.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
            <ArrowDownLeft size={16} className="mr-1 inline" /> Khoản thu
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Tên giao dịch *</span>
            <input required disabled={syncing} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="VD: Ăn trưa, tiền điện..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 disabled:bg-slate-50" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Số tiền (VND) *</span>
            <CurrencyInput
              required
              disabled={syncing}
              value={form.amount}
              onChange={(val) => setForm((f) => ({ ...f, amount: val }))}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-emerald-400 disabled:bg-slate-50 bg-white"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">Danh mục</span>
              <select disabled={syncing} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none disabled:bg-slate-50">
                {CATEGORIES.filter((c) => c.kind === form.type).map((c) => (<option key={c.name}>{c.name}</option>))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">Ngày giao dịch</span>
              <input disabled={syncing} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none disabled:bg-slate-50" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Phương thức thanh toán</span>
            <select disabled={syncing} value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none disabled:bg-slate-50">
              {['Tiền mặt', 'Chuyển khoản', 'Thẻ ngân hàng', 'Ví điện tử'].map((x) => (<option key={x}>{x}</option>))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Ghi chú</span>
            <textarea disabled={syncing} rows="2" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Ghi chú thêm (không bắt buộc)" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 disabled:bg-slate-50" />
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" disabled={syncing} onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 disabled:opacity-50">Hủy</button>
          <button type="submit" disabled={syncing} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
            {syncing ? <Loader2 size={18} className="animate-spin" /> : null}
            {editing ? 'Lưu thay đổi' : 'Thêm giao dịch'}
          </button>
        </div>
      </form>
    </div>
  )
}