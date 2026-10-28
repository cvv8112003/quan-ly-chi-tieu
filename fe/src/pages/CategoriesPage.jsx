import { CATEGORIES } from '../constants/categories'

export function CategoriesPage({ transactions }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6">
      <h2 className="text-lg font-extrabold">Danh mục thu chi</h2>
      <p className="mt-1 text-sm text-slate-400">Các danh mục đang dùng trong sổ chi tiêu</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
              <div className="rounded-xl p-3" style={{ background: `${c.color}18`, color: c.color }}><Icon size={20} /></div>
              <div className="flex-1">
                <div className="font-bold">{c.name}</div>
                <div className="mt-1 text-xs text-slate-400">{c.kind === 'income' ? 'Danh mục thu nhập' : 'Danh mục chi tiêu'}</div>
              </div>
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {transactions.filter((t) => t.category === c.name).length} GD
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
        Danh mục hiện là danh mục cấu hình sẵn trong giao diện. Có thể bổ sung chức năng tạo/sửa/xóa danh mục ở bước phát triển tiếp theo.
      </p>
    </section>
  )
}