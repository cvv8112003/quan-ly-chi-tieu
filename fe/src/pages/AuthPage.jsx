import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, LogIn, UserPlus, Loader2 } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'

export function AuthPage({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await response.json()

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Xác thực thất bại.')
      }

      // Lưu Token và Thông tin User (bao gồm id, email, name) vào localStorage
      localStorage.setItem('vi-nho-token', result.data.token)
      localStorage.setItem('vi-nho-user', JSON.stringify(result.data.user))

      if (onAuthSuccess) onAuthSuccess(result.data.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi.')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý đăng nhập bằng Google
  const googleLoginAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true)
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const googleUser = await res.json()

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: googleUser.email, name: googleUser.name }),
        })

        const result = await response.json()
        if (!response.ok || result.success === false) {
          throw new Error(result.message || 'Đăng nhập Google thất bại.')
        }

        localStorage.setItem('vi-nho-token', result.data.token)
        localStorage.setItem('vi-nho-user', JSON.stringify(result.data.user))

        if (onAuthSuccess) onAuthSuccess(result.data.user)
        navigate('/')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    onError: () => setError('Đăng nhập bằng Google không thành công.'),
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <Wallet size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            {isRegister ? 'Tạo tài khoản Ví Nhỏ' : 'Đăng nhập vào Ví Nhỏ'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">Quản lý chi tiêu cá nhân thông minh</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-rose-50 p-3 text-center text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Họ và tên</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vinhovn@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Mật khẩu</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (isRegister ? <UserPlus size={18} /> : <LogIn size={18} />)}
            {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-5">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase">Hoặc</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            onClick={() => googleLoginAction()}
            type="button"
            className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Đăng nhập với Google (Gmail)
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký mới'}
          </button>
        </div>
      </div>
    </div>
  )
}