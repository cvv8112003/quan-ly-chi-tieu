import { Filter } from 'lucide-react'

export function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-3 rounded-2xl bg-slate-50 p-4 text-slate-300">
        <Filter size={25} />
      </div>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  )
}