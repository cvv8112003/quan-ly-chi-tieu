import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, ChartNoAxesCombined, Tags, Settings,
  Wallet, PiggyBank, ArrowUpRight, Bell, Plus, CalendarDays, Menu, Sheet,
  MoreHorizontal, Loader2, CheckCircle2
} from 'lucide-react'
import { MONTHS } from '../constants/categories'

export function Layout({
  sheetStatus, selectedMonth, setSelectedMonth, openAdd, flash, notice, serverStatus
}) {
  const [mobileNav, setMobileNav] = useState(false)

  const nav = [
    { label: 'Tổng quan', path: '/', icon: LayoutDashboard },
    { label: 'Giao dịch', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Báo cáo', path: '/reports', icon: ChartNoAxesCombined },
    { label: 'Ngân sách', path: '/budgets', icon: PiggyBank },
    { label: 'Danh mục', path: '/categories', icon: Tags },
    { label: 'Kết nối Backend', path: '/connect', icon: Sheet },
  ]

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      {mobileNav && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
          onClick={() => setMobileNav(false)}
          aria-label="Đóng menu"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-slate-100 bg-white px-5 py-6 transition-transform md:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <Wallet size={23} />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">ví nhỏ<span className="text-emerald-500">.</span></div>
            <div className="text-xs text-slate-400">Quản lý tiền thông minh</div>
          </div>
        </div>

        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Không gian của bạn</div>
        
        <nav className="space-y-1">
          {nav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <Icon size={19} strokeWidth={1.9} />
              {label}
              {path === '/connect' && (
                <span className={`ml-auto h-2 w-2 rounded-full ${
                  sheetStatus.includes('kết nối') || sheetStatus.includes('đồng bộ') || sheetStatus.includes('Đã tải') ? 'bg-emerald-500' : 'bg-amber-400'
                }`} />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold"><PiggyBank size={18} /> Mẹo tiết kiệm</div>
            <p className="text-xs leading-5 text-emerald-50">Theo dõi chi tiêu mỗi ngày để hiểu rõ tiền của bạn đang đi đâu.</p>
            <NavLink to="/reports" className="mt-3 flex items-center gap-1 text-xs font-bold">Xem báo cáo <ArrowUpRight size={14} /></NavLink>
          </div>
          <NavLink to="/settings" className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">
            <Settings size={18} /> Cài đặt
          </NavLink>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">V</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">Ví cá nhân</div>
              <div className="text-xs text-slate-400">Gói miễn phí</div>
            </div>
            <MoreHorizontal size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="min-h-screen md:ml-[250px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setMobileNav(true)}>
              <Menu size={21} />
            </button>
            <div>
              <div className="text-xs text-slate-400">Xin chào, chúc bạn một ngày tốt lành 👋</div>
              <h1 className="mt-0.5 text-lg font-extrabold tracking-tight md:text-xl">Ví Nhỏ Finance</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:flex">
              <CalendarDays size={16} />
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="max-w-[120px] bg-transparent text-sm font-semibold text-slate-700 outline-none">
                {Array.from({ length: 18 }, (_, i) => {
                  const d = new Date('2026-10-01T00:00:00')
                  d.setMonth(d.getMonth() - i)
                  const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                  return <option key={v} value={v}>{MONTHS[d.getMonth()]} {d.getFullYear()}</option>
                })}
              </select>
            </label>
            <button onClick={() => flash('Bạn đang xem thông báo mới nhất.')} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell size={19} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-600 md:px-4">
              <Plus size={17} /><span className="hidden sm:inline">Thêm giao dịch</span><span className="sm:hidden">Thêm</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-8">
          <Outlet />
        </div>

        <footer className="px-4 pb-7 text-center text-xs text-slate-400 md:px-8">
          © 2026 Quản lý chi tiêu cá nhân · Cao Văn Vượng.
        </footer>
      </main>

      {/* Floating Server Processing Status */}
      {serverStatus && (
        <div role="status" className="fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md animate-bounce">
          <Loader2 size={18} className="animate-spin text-emerald-400" />
          <span>{serverStatus}</span>
        </div>
      )}

      {/* Flash Notice */}
      {notice && (
        <div role="status" className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-40px)] items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={17} className="text-emerald-400" />{notice}
        </div>
      )}
    </div>
  )
}