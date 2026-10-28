import { Download } from 'lucide-react'

export function SettingsPage({ exportExcel }) {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 md:p-8">
      <h2 className="text-lg font-extrabold">Cài đặt cá nhân</h2>
      <p className="mt-1 text-sm text-slate-400">Quản lý dữ liệu trên trình duyệt này</p>
      <div className="mt-6 divide-y divide-slate-100">
        <div className="flex items-center justify-between gap-4 py-4">
          <div>
            <div className="font-bold">Sao lưu giao dịch</div>
            <div className="mt-1 text-xs text-slate-400">Tải các giao dịch đang lọc về dạng Excel.</div>
          </div>
          <button onClick={exportExcel} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
            <Download size={15} className="mr-1 inline" /> Xuất Excel
          </button>
        </div>
      </div>
    </section>
  )
}