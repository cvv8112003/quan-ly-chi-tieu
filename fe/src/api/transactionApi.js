const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '')

async function readApiResponse(response) {
  const text = await response.text()
  let result
  try {
    result = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Backend trả về dữ liệu không hợp lệ. Hãy kiểm tra log Spring Boot.')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Yêu cầu thất bại (HTTP ${response.status}).`)
  }
  return result
}

// Xử lý user & token
function getAuthHeader() {
  const token = localStorage.getItem('vi-nho-token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('vi-nho-user'))
    return user ? user.id : ''
  } catch {
    return ''
  }
}

export async function loadTransactionsFromApi() {
  const userId = getCurrentUserId()
  let response
  try {
    const url = userId 
      ? `${API_BASE_URL}/api/transactions?userId=${encodeURIComponent(userId)}`
      : `${API_BASE_URL}/api/transactions`

    response = await fetch(url, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    })
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot.')
  }
  const result = await readApiResponse(response)
  return (result.data || []).map(normalizeTransaction)
}

function normalizeTransaction(row) {
  return {
    id: String(row.id ?? ''),
    date: String(row.date ?? '').slice(0, 10),
    title: String(row.title ?? row.transactionName ?? ''),
    type: String(row.type ?? 'expense').toLowerCase(),
    category: String(row.category ?? ''),
    amount: Number(row.amount ?? 0),
    method: String(row.method ?? row.paymentMethod ?? ''),
    note: String(row.note ?? ''),
    userId: String(row.userId ?? ''), // Thêm userId vào đây cho đồng bộ
  }
}

export async function createTransactionApi(transaction) {
  const userId = getCurrentUserId()
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...transaction,
        id: null,
        amount: Number(transaction.amount),
        userId: userId, 
      }),
    })
  } catch {
    throw new Error('Không kết nối được Backend.')
  }
  const result = await readApiResponse(response)
  return result.data ? normalizeTransaction(result.data) : null
}

export async function updateTransactionApi(id, transaction) {
  const userId = getCurrentUserId() // 2. ĐÃ FIX: Khai báo đầy đủ userId để tránh lỗi ReferenceError
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...transaction,
        id,
        amount: Number(transaction.amount),
        userId: userId,
      }),
    })
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy.')
  }
  const result = await readApiResponse(response)
  return result.data ? normalizeTransaction(result.data) : null
}

export async function deleteTransactionApi(id) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    })
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy.')
  }
  await readApiResponse(response)
}

export { API_BASE_URL }