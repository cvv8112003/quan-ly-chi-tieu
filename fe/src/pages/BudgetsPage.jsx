import { PiggyBank } from 'lucide-react'
import { CATEGORIES, money } from '../constants/categories'
import { CurrencyInput } from '../components/CurrencyInput'

export function BudgetsPage({ budgets, updateBudget, monthTransactions }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-50">Ngân sách chi tiêu tháng</p>
            <h2 className="mt-2 text-3xl font-extrabold">{money(Object.values(budgets).reduce((s, v) => s + Number(v), 0))}</h2>
            <p className="mt-2 text-sm text-emerald-50">Đặt giới hạn để chủ động kiểm soát tiền của bạn.</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3"><PiggyBank size={30} /></div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {CATEGORIES.filter((c) => c.kind === 'expense').map((c) => {
          const spent = monthTransactions.filter((t) => t.type === 'expense' && t.category === c.name).reduce((s, t) => s + Number(t.amount), 0)
          const limit = Number(budgets[c.name] || 0)
          const pct = limit ? (spent / limit) * 100 : 0
          const Icon = c.icon
          return (
            <div key={c.name} className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3" style={{ background: `${c.color}18`, color: c.color }}><Icon size={20} /></div>
                <div className="flex-1">
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-xs text-slate-400">Đã sử dụng {Math.min(999, Math.round(pct))}% ngân sách</p>
                </div>
                <span className={`rounded-lg px-2 py-1 text-xs font-bold ${pct > 100 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {pct > 100 ? 'Vượt mức' : limit ? 'Đang theo dõi' : 'Chưa đặt'}
                </span>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3"><strong className="text-lg">{money(spent)}</strong><span className="text-xs text-slate-400">Ngân sách: {money(limit)}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${limit ? Math.min(100, pct) : 0}%`, background: pct > 100 ? '#f43f5e' : c.color }} />
              </div>
              <label className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                Giới hạn tháng 
                <CurrencyInput
                  value={limit}
                  onChange={(val) => updateBudget(c.name, val)}
                  className="w-44 rounded-lg border border-slate-200 px-3 py-2 text-right text-sm text-slate-800 outline-none focus:border-emerald-400 bg-white"
                />
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}