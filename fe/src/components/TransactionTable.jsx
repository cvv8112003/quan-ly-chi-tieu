import { Pencil, Trash2 } from 'lucide-react'
import { CATEGORIES, money, dateText } from '../constants/categories'
import { EmptyState } from './EmptyState'

export function TransactionTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return <EmptyState text="Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!" />

  return (
    <div className="custom-scrollbar overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-6 py-3.5">Giao dịch</th>
            <th className="px-4 py-3.5">Danh mục</th>
            <th className="px-4 py-3.5">Ngày</th>
            <th className="px-4 py-3.5 text-right">Số tiền</th>
            <th className="px-6 py-3.5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((t) => {
            const c = CATEGORIES.find((x) => x.name === t.category) || CATEGORIES[0]
            const Icon = c.icon
            return (
              <tr key={t.id} className="transition hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-2.5" style={{ background: `${c.color}18`, color: c.color }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">{t.title}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{t.method || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                    {t.category}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-500">{dateText(t.date)}</td>
                <td className={`px-4 py-4 text-right text-sm font-extrabold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {t.type === 'income' ? '+' : '−'}{money(t.amount)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(t)} title="Sửa" className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(t.id)} title="Xóa" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}