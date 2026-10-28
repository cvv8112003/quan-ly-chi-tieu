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
  }
}

export async function loadTransactionsFromApi() {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions`)
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy tại http://localhost:8080.')
  }
  const result = await readApiResponse(response)
  if (!Array.isArray(result.data)) {
    throw new Error('API giao dịch không trả về danh sách dữ liệu hợp lệ.')
  }
  return result.data.map(normalizeTransaction)
}

export async function createTransactionApi(transaction) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...transaction,
        id: null,
        amount: Number(transaction.amount),
      }),
    })
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy.')
  }
  const result = await readApiResponse(response)
  return result.data ? normalizeTransaction(result.data) : null
}

export async function updateTransactionApi(id, transaction) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/transactions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...transaction,
        id,
        amount: Number(transaction.amount),
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
    })
  } catch {
    throw new Error('Không kết nối được Backend. Hãy kiểm tra Spring Boot đang chạy.')
  }
  await readApiResponse(response)
}

export { API_BASE_URL }