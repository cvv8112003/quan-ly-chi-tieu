export const logoutUser = (onBeforeRedirect) => {
  // 1. Gọi callback (ví dụ để bật loading UI nếu cần)
  if (typeof onBeforeRedirect === 'function') {
    onBeforeRedirect()
  }

  // 2. Xóa toàn bộ dữ liệu phiên làm việc
//   localStorage.removeItem('vi-nho-token')
//   localStorage.removeItem('vi-nho-user')
//   localStorage.removeItem('vi-nho-transactions')
//   localStorage.removeItem('vi-nho-budgets')


  localStorage.clear()
  
  // 3. Điều hướng về trang login sau độ trễ ngắn
  setTimeout(() => {
    window.location.href = '/login'
  }, 500)
}