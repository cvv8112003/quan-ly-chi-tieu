import { Sheet, CircleHelp, Link2, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react'
import { API_BASE_URL } from '../api/transactionApi'

export function ConnectPage({ sheetStatus, loadingTransactions, syncing, connectSheet, syncSheet }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-4 text-emerald-600 shadow-sm"><Sheet size={30} /></div>
            <div>
              <h2 className="text-xl font-extrabold">Kết nối Backend Spring Boot</h2>
              <p className="mt-1 text-sm text-slate-500">Frontend lấy dữ liệu từ API Backend; Backend chịu trách nhiệm đọc và ghi Google Sheets.</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-6 md:p-8">
          <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
            <CircleHelp size={19} className="mt-0.5 shrink-0" />
            <div>
              <strong>Kiểm tra cấu hình Backend</strong>
              <p className="mt-1 leading-6">Đảm bảo Spring Boot đang chạy ở cổng 8080 và đã thiết lập biến môi trường <code>GOOGLE_SCRIPT_URL</code> trỏ đến URL Web App của Apps Script.</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Địa chỉ API</div>
            <div className="mt-1 break-all font-mono text-sm font-semibold text-slate-700">{API_BASE_URL}</div>
            <div className="mt-2 text-xs text-slate-400">Cấu hình trong biến VITE_API_BASE_URL ở file .env của FE.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={connectSheet} disabled={loadingTransactions || syncing} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
              {loadingTransactions ? <Loader2 size={17} className="animate-spin" /> : <Link2 size={17} />} Kiểm tra kết nối
            </button>
            <button type="button" onClick={syncSheet} disabled={syncing || loadingTransactions} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Đang tải...' : 'Tải lại giao dịch'}
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${sheetStatus.includes('kết nối') || sheetStatus.includes('đồng bộ') || sheetStatus.includes('Đã tải') || sheetStatus.includes('Đã lưu') ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className="font-semibold">Trạng thái:</span>
            <span className="text-slate-500">{loadingTransactions ? 'Đang tải...' : syncing ? 'Đang đồng bộ...' : sheetStatus}</span>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <h3 className="font-bold">Dữ liệu giao dịch</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {['Ngày giao dịch', 'Tên giao dịch', 'Thu hay chi', 'Danh mục', 'Số tiền VND', 'Phương thức thanh toán', 'Ghi chú', 'Mã giao dịch'].map((x) => (
                <div key={x} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 size={16} className="text-emerald-500" />{x}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <h3 className="font-extrabold">Luồng dữ liệu</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">React gọi API Spring Boot tại địa chỉ trên. Backend đọc và ghi Google Sheets. Nếu không kết nối được, ứng dụng hiển thị lỗi thay vì tạo giao dịch mẫu.</p>
      </div>
    </div>
  )
}