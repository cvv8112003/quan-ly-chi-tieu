export function StatCard({ title, amount, icon: Icon, tone, caption, loading }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-500',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/60">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <span className={`rounded-xl p-2.5 ${styles[tone]}`}><Icon size={19} /></span>
      </div>
      {loading ? (
        <div className="mt-4 space-y-2">
          <div className="h-7 w-2/3 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      ) : (
        <>
          <div className="mt-4 break-words text-xl font-extrabold tracking-tight md:text-2xl">{amount}</div>
          <div className="mt-2 text-xs text-slate-400">{caption}</div>
        </>
      )}
    </div>
  )
}