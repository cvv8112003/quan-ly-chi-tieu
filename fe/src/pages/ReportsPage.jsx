import { TrendingUp, TrendingDown, CircleDollarSign } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { StatCard } from '../components/StatCard'
import { SkeletonChart } from '../components/SkeletonLoaders'
import { CATEGORIES, money } from '../constants/categories'

export function ReportsPage({ income, expense, balance, trendData, categoryData, loadingTransactions }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Tổng thu nhập" amount={money(income)} icon={TrendingUp} tone="green" caption="Trong tháng đang chọn" loading={loadingTransactions} />
        <StatCard title="Tổng chi tiêu" amount={money(expense)} icon={TrendingDown} tone="rose" caption="Trong tháng đang chọn" loading={loadingTransactions} />
        <StatCard title="Chênh lệch thu chi" amount={money(balance)} icon={CircleDollarSign} tone="blue" caption={balance >= 0 ? 'Bạn đang chi tiêu trong khả năng' : 'Chi tiêu vượt thu nhập'} loading={loadingTransactions} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6">
          <h3 className="font-extrabold">Thu nhập và chi tiêu</h3><p className="mt-1 text-xs text-slate-400">So sánh 6 tháng gần đây</p>
          <div className="mt-5 h-[300px]">
            {loadingTransactions ? <SkeletonChart /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid stroke="#eef1f6" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Area dataKey="Thu" stroke="#10b981" fill="#a7f3d0" fillOpacity={0.5} />
                  <Area dataKey="Chi" stroke="#fb7185" fill="#fecdd3" fillOpacity={0.45} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6">
          <h3 className="font-extrabold">Chi tiết theo danh mục</h3><p className="mt-1 text-xs text-slate-400">Danh mục chi tiêu trong tháng</p>
          <div className="mt-6 space-y-5">
            {CATEGORIES.filter((c) => c.kind === 'expense').map((c) => {
              const v = categoryData.find((x) => x.name === c.name)?.value || 0
              return (
                <div key={c.name}>
                  <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{c.name}</span><span className="font-bold">{money(v)}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${expense ? Math.min(100, (v / expense) * 100) : 0}%`, background: c.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}