import { useEffect, useState } from 'react'
import {
  Sheet,
  CircleHelp,
  Link2,
  RefreshCw,
  CheckCircle2,
  Loader2,
  WifiOff,
  ServerOff
} from 'lucide-react'

import { API_BASE_URL } from '../api/transactionApi'

export function ConnectPage({
  sheetStatus,
  loadingTransactions,
  syncing,
  connectSheet,
  syncSheet
}) {
  // Kiểm tra trạng thái Internet của thiết bị
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Khi không có Internet
  const isOffline = !isOnline

  // Kiểm tra các trạng thái lỗi từ Backend
  const isConnectionError =
    !isOffline &&
    (
      sheetStatus?.toLowerCase().includes('lỗi') ||
      sheetStatus?.toLowerCase().includes('không thể kết nối') ||
      sheetStatus?.toLowerCase().includes('thất bại')
    )

  // Xác định nội dung trạng thái hiển thị
  let statusText = sheetStatus || 'Chưa kiểm tra kết nối'

  if (loadingTransactions) {
    statusText = 'Đang tải dữ liệu...'
  } else if (syncing) {
    statusText = 'Đang đồng bộ dữ liệu...'
  } else if (isOffline) {
    statusText = 'Thiết bị chưa có kết nối Internet. Vui lòng kiểm tra Wi-Fi hoặc dữ liệu di động.'
  } else if (isConnectionError) {
    statusText = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
  }

  const handleCheckConnection = () => {
    // Không gọi API khi thiết bị không có Internet
    if (isOffline) {
      return
    }

    connectSheet()
  }

  const handleSync = () => {
    // Không gọi API khi thiết bị không có Internet
    if (isOffline) {
      return
    }

    syncSheet()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white">

        {/* Phần tiêu đề */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-4 text-emerald-600 shadow-sm">
              <Sheet size={30} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold">
                Kết nối Backend
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Kiểm tra kết nối và đồng bộ dữ liệu giao dịch.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6 md:p-8">

          {/* Thông báo khi không có Internet */}
          {isOffline ? (
            <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              <WifiOff size={20} className="mt-0.5 shrink-0" />

              <div>
                <strong>Không có kết nối Internet</strong>

                <p className="mt-1 leading-6">
                  Thiết bị hiện không có kết nối Wi-Fi hoặc dữ liệu di động.
                  Vui lòng kết nối Internet để sử dụng dữ liệu từ máy chủ.
                </p>
              </div>
            </div>
          ) : isConnectionError ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              <ServerOff size={20} className="mt-0.5 shrink-0" />

              <div>
                <strong>Không thể kết nối đến máy chủ</strong>

                <p className="mt-1 leading-6">
                  Internet của thiết bị vẫn hoạt động, nhưng ứng dụng chưa thể
                  kết nối đến Backend. Vui lòng thử lại sau.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
              <CircleHelp size={19} className="mt-0.5 shrink-0" />

              <div>
                <strong>Kiểm tra kết nối</strong>

                <p className="mt-1 leading-6">
                  Ứng dụng cần có kết nối Internet để lấy và đồng bộ dữ liệu
                  với máy chủ.
                </p>
              </div>
            </div>
          )}

          {/* Địa chỉ API */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Địa chỉ API
            </div>

            <div className="mt-1 break-all font-mono text-sm font-semibold text-slate-700">
              {API_BASE_URL}
            </div>

            <div className="mt-2 text-xs text-slate-400">
              Địa chỉ máy chủ mà ứng dụng đang sử dụng.
            </div>
          </div>

          {/* Các nút thao tác */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCheckConnection}
              disabled={loadingTransactions || syncing || isOffline}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingTransactions ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Link2 size={17} />
              )}

              Kiểm tra kết nối
            </button>

            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || loadingTransactions || isOffline}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={syncing ? 'animate-spin' : ''}
              />

              {syncing ? 'Đang tải...' : 'Tải lại giao dịch'}
            </button>
          </div>

          {/* Trạng thái kết nối */}
          <div
            className={`flex items-start gap-2 rounded-xl p-4 text-sm ${
              isOffline
                ? 'bg-rose-50 text-rose-700'
                : isConnectionError
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-slate-50 text-slate-700'
            }`}
          >
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                isOffline
                  ? 'bg-rose-500'
                  : isConnectionError
                    ? 'bg-amber-500'
                    : sheetStatus?.includes('kết nối') ||
                        sheetStatus?.includes('đồng bộ') ||
                        sheetStatus?.includes('Đã tải') ||
                        sheetStatus?.includes('Đã lưu')
                      ? 'bg-emerald-500'
                      : 'bg-amber-400'
              }`}
            />

            <div>
              <span className="font-semibold">
                Trạng thái:{' '}
              </span>

              <span className="text-slate-500">
                {statusText}
              </span>
            </div>
          </div>

          {/* Dữ liệu giao dịch */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="font-bold">
              Dữ liệu giao dịch
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                'Ngày giao dịch',
                'Tên giao dịch',
                'Thu hay chi',
                'Danh mục',
                'Số tiền VND',
                'Phương thức thanh toán',
                'Ghi chú',
                'Mã giao dịch'
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500"
                  />

                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Giải thích luồng dữ liệu */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <h3 className="font-extrabold">
          Luồng dữ liệu
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ứng dụng kết nối đến Backend để lấy và lưu dữ liệu giao dịch.
          Khi thiết bị không có Internet hoặc máy chủ không hoạt động,
          ứng dụng sẽ thông báo trạng thái kết nối và không tạo dữ liệu mẫu.
        </p>
      </div>
    </div>
  )
}