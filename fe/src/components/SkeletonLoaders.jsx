export function SkeletonChart() {
  return (
    <div className="flex h-full w-full flex-col justify-end gap-3 rounded-xl bg-slate-50/50 p-4 animate-pulse">
      <div className="flex h-full items-end gap-3">
        <div className="h-[40%] flex-1 rounded-t-lg bg-slate-200/60" />
        <div className="h-[75%] flex-1 rounded-t-lg bg-slate-200/60" />
        <div className="h-[55%] flex-1 rounded-t-lg bg-slate-200/60" />
        <div className="h-[90%] flex-1 rounded-t-lg bg-slate-200/60" />
        <div className="h-[65%] flex-1 rounded-t-lg bg-slate-200/60" />
        <div className="h-[80%] flex-1 rounded-t-lg bg-slate-200/60" />
      </div>
    </div>
  )
}

export function SkeletonPieChart() {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 animate-pulse">
      <div className="h-36 w-36 rounded-full border-8 border-slate-200/60" />
      <div className="h-4 w-32 rounded bg-slate-200/60" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="divide-y divide-slate-100 p-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200/70" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-slate-200/70" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-4 w-20 rounded bg-slate-200/70" />
        </div>
      ))}
    </div>
  )
}