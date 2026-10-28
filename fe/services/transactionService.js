const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// Lấy danh sách giao dịch
export async function getTransactions() {
  const response = await fetch(`${API_URL}?action=list`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Không lấy được giao dịch");
  }

  return result.data;
}

// Thêm giao dịch
export async function createTransaction(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "create",
      data,
    }),
  });

  return response.json();
}

// Sửa giao dịch
export async function updateTransaction(id, data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "update",
      id,
      data,
    }),
  });

  return response.json();
}

// Xóa giao dịch
export async function deleteTransaction(id) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "delete",
      id,
    }),
  });

  return response.json();
}