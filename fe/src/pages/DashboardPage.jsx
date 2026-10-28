import { Download, Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { StatCard } from '../components/StatCard'
import { SkeletonChart, SkeletonPieChart, SkeletonTable } from '../components/SkeletonLoaders'
import { TransactionTable } from '../components/TransactionTable'
import { EmptyState } from '../components/EmptyState'
import { CATEGORIES, MONTHS, money } from '../constants/categories'

export function DashboardPage({
  selectedMonth, balance, income, expense, monthTransactions, trendData, categoryData, recent, loadingTransactions, exportExcel, openEdit, deleteTransaction
}) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Đây là tình hình tài chính của bạn trong</p>
          <h2 className="mt-1 text-2xl font-extrabold">{MONTHS[Number(selectedMonth.slice(5)) - 1]} <span className="text-emerald-600">{selectedMonth.slice(0, 4)}</span></h2>
        </div>
        <button onClick={exportExcel} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-emerald-300">
          <Download size={16} /> Xuất báo cáo
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Số dư tháng" amount={money(balance)} icon={Wallet} tone="green" caption="Thu nhập − Chi tiêu" loading={loadingTransactions} />
        <StatCard title="Tổng thu nhập" amount={money(income)} icon={TrendingUp} tone="blue" caption={`${monthTransactions.filter(t => t.type === 'income').length} giao dịch thu`} loading={loadingTransactions} />
        <StatCard title="Tổng chi tiêu" amount={money(expense)} icon={TrendingDown} tone="rose" caption={`${monthTransactions.filter(t => t.type === 'expense').length} giao dịch chi`} loading={loadingTransactions} />
        <StatCard title="Tỷ lệ tiết kiệm" amount={`${income ? Math.round((balance / income) * 100) : 0}%`} icon={PiggyBank} tone="violet" caption="Số dư / Tổng thu nhập" loading={loadingTransactions} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/70 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-extrabold">Dòng tiền của bạn</h3><p className="mt-1 text-xs text-slate-400">Theo dõi thu nhập và chi tiêu 6 tháng gần nhất</p></div>
            <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">VND</span>
          </div>
          <div className="h-[260px] w-full">
            {loadingTransactions ? <SkeletonChart /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="thuColor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="chiColor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb7185" stopOpacity={0.15} /><stop offset="95%" stopColor="#fb7185" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef1f6" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}tr` : `${Math.round(v / 1000)}k`} width={42} />
                  <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 12, border: '1px solid #eef1f6', fontSize: 12 }} />
                  <Area type="monotone" dataKey="Thu" stroke="#10b981" strokeWidth={2.5} fill="url(#thuColor)" />
                  <Area type="monotone" dataKey="Chi" stroke="#fb7185" strokeWidth={2.5} fill="url(#chiColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 flex justify-center gap-5 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500" />Thu nhập</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-rose-400" />Chi tiêu</span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/70 md:p-6">
          <div className="mb-2"><h3 className="font-extrabold">Chi tiêu theo danh mục</h3><p className="mt-1 text-xs text-slate-400">Phân bổ chi tiêu trong tháng</p></div>
          {loadingTransactions ? <SkeletonPieChart /> : categoryData.length ? (
            <>
              <div className="relative h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none">{categoryData.map((c) => <Cell key={c.name} fill={c.color} />)}</Pie><Tooltip formatter={(v) => money(v)} /></PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400">Tổng chi</span>
                  <strong className="mt-1 text-lg font-extrabold">{money(expense)}</strong>
                </div>
              </div>
              <div className="mt-1 space-y-3">
                {categoryData.sort((a, b) => b.value - a.value).slice(0, 4).map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1 text-slate-500">{c.name}</span>
                    <span className="font-bold">{Math.round(c.value / (expense || 1) * 100)}%</span>
                    <span className="w-24 text-right text-xs text-slate-400">{money(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyState text="Chưa có chi tiêu trong tháng này." />}
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100/70">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 md:px-6">
          <div><h3 className="font-extrabold">Giao dịch gần đây</h3><p className="mt-1 text-xs text-slate-400">Những khoản thu chi mới nhất của bạn</p></div>
        </div>
        {loadingTransactions ? <SkeletonTable rows={5} /> : <TransactionTable rows={recent} onEdit={openEdit} onDelete={deleteTransaction} />}
      </section>
    </>
  )
}