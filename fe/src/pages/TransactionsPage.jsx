import { Plus, Search, Download } from 'lucide-react'
import { CATEGORIES } from '../constants/categories'
import { SkeletonTable } from '../components/SkeletonLoaders'
import { TransactionTable } from '../components/TransactionTable'
import { EmptyState } from '../components/EmptyState'

export function TransactionsPage({
  filtered, search, setSearch, filterType, setFilterType, filterCategory, setFilterCategory,
  loadingTransactions, openAdd, openEdit, deleteTransaction, exportExcel
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-extrabold">Tất cả giao dịch</h2><p className="mt-1 text-sm text-slate-400">Quản lý các khoản thu và chi của bạn</p></div>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Thêm giao dịch</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_170px_190px_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
            <Search size={17} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm giao dịch..." className="w-full text-sm outline-none" />
          </label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">
            <option value="all">Tất cả loại</option><option value="income">Khoản thu</option><option value="expense">Khoản chi</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
          </select>
          <button onClick={exportExcel} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600">
            <Download size={16} /> Excel
          </button>
        </div>
      </div>
      {loadingTransactions ? <SkeletonTable rows={8} /> : (
        <>
          <TransactionTable rows={filtered} onEdit={openEdit} onDelete={deleteTransaction} />
          {!filtered.length && <EmptyState text="Không tìm thấy giao dịch phù hợp." />}
        </>
      )}
    </section>
  )
}