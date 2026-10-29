import { useState, useEffect } from 'react'
import { Download, User, Camera, Mail, Lock, ShieldCheck, KeyRound, Eye, EyeOff, ChevronDown, LogOut } from 'lucide-react'

export function SettingsPage({ user, onUpdatePassword, exportExcel, onLogout  }) {
  const [storedUser, setStoredUser] = useState({})
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    try {
      // Đọc đúng key 'vi-nho-user' khớp với App.jsx
      const data = JSON.parse(localStorage.getItem('vi-nho-user') || '{}')
      setStoredUser(data)
    } catch (e) {
      console.error("Lỗi đọc localStorage:", e)
    }
  }, [user])

  const activeUser = user || storedUser
  const displayEmail = activeUser?.email || 'Chưa cập nhật email'
  const displayName = activeUser?.name || 'Chưa cập nhật tên'
  const displayAvatar = activeUser?.avatar || ''

  // Điều kiện nhận diện tài khoản Google hoặc tài khoản chưa có mật khẩu
  const isGoogleAccount = 
    activeUser?.authProvider === 'google' || 
    activeUser?.id?.startsWith('GUSR_') || 
    activeUser?.password === 'GOOGLE_AUTH' ||
    !activeUser?.password

  const getInitials = (name) => {
    if (!name) return 'U'
    const trimmed = name.trim()
    const parts = trimmed.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return trimmed.substring(0, 2).toUpperCase()
  }

  const handleAvatarClick = () => {
    alert('Tính năng tải lên hình ảnh đang phát triển!')
  }

  const handleSavePassword = (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('Xác nhận mật khẩu mới không khớp.')
      return
    }

    if (onUpdatePassword) {
      onUpdatePassword({
        currentPassword: isGoogleAccount ? "" : currentPassword,
        newPassword
      })
      
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsPasswordSectionOpen(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 px-4 sm:px-6">
      {/* 1. HỒ SƠ CÁ NHÂN */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 md:px-8">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <User size={18} className="text-emerald-500" /> Hồ Sơ Của Tôi
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Thông tin tài khoản cá nhân của bạn</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
            <div className="w-full space-y-5 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email đăng nhập
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{displayEmail}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                    <ShieldCheck size={12} /> Đã liên kết
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tên hiển thị
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 select-none">
                  {displayName}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-l border-slate-100 pb-6 md:pb-0 md:pl-8 w-full md:w-auto">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Ảnh đại diện">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-emerald-50 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md text-white text-3xl font-black select-none">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{getInitials(displayName)}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera size={22} />
                  <span className="text-[11px] mt-1 font-medium">Xem</span>
                </div>
              </div>

              <span className="mt-4 text-xs font-bold text-slate-700">
                {displayName}
              </span>
              <p className="mt-1 text-[11px] text-slate-400 text-center max-w-[160px]">
                Tài khoản thành viên
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ĐỔI / TẠO MẬT KHẨU */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div 
          onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
          className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 md:px-8 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
        >
          <div>
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Lock size={18} className="text-emerald-500" /> 
              {isGoogleAccount ? "Tạo Mật Khẩu Đăng Nhập" : "Đổi Mật Khẩu"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isGoogleAccount 
                ? "Tài khoản Google có thể tạo mật khẩu riêng để đăng nhập bằng Email."
                : "Bảo vệ tài khoản của bạn bằng mật khẩu mạnh"}
            </p>
          </div>
          <button type="button" className="text-slate-400 p-1 rounded-lg hover:bg-slate-200/50 transition-colors">
            <ChevronDown size={20} className={`transform transition-transform duration-300 ${isPasswordSectionOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isPasswordSectionOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSavePassword} className="p-6 md:p-8 space-y-5 max-w-xl">
            {!isGoogleAccount && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </span>
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Nhập mật khẩu hiện tại..."
                    required={isPasswordSectionOpen && !isGoogleAccount}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Mật khẩu mới
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={16} />
                </span>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="Ít nhất 6 ký tự..."
                  required={isPasswordSectionOpen}
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={16} />
                </span>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="Nhập lại mật khẩu mới..."
                  required={isPasswordSectionOpen}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button 
                type="submit" 
                className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 active:scale-[0.98] transition-all"
              >
                {isGoogleAccount ? "Tạo mật khẩu" : "Xác nhận đổi mật khẩu"}
              </button>
              <button 
                type="button"
                onClick={() => setIsPasswordSectionOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. CÀI ĐẶT DỮ LIỆU */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 md:px-8">
          <h2 className="text-base font-extrabold text-slate-800">Cài đặt dữ liệu</h2>
          <p className="mt-0.5 text-xs text-slate-500">Quản lý và sao lưu dữ liệu cá nhân của bạn</p>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-800">Sao lưu giao dịch</div>
              <div className="mt-0.5 text-xs text-slate-400">Tải toàn bộ giao dịch hiện tại về dạng file Excel.</div>
            </div>
            <button 
              onClick={exportExcel} 
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors shrink-0"
            >
              <Download size={15} /> Xuất Excel
            </button>
          </div>
        </div>
      </section>
      {/* 4. ĐĂNG XUẤT */}
      <section className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div>
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-800">
              <LogOut size={18} className="text-red-500" />
              Đăng xuất tài khoản
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Đăng xuất khỏi tài khoản hiện tại trên thiết bị này.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 active:scale-[0.98]"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </section>
    </div>
  )
}