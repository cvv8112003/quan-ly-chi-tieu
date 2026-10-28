# Ví Nhỏ — Spring Boot Backend

Backend khởi đầu cho ứng dụng quản lý thu chi React. Bản này làm trung gian giữa React và Google Apps Script để frontend không phải gọi Google Sheets trực tiếp.

## Công nghệ
- Java 21
- Spring Boot 3.5.5
- Maven
- REST API
- Google Apps Script hiện có làm lớp đọc/ghi Google Sheets

> Lưu ý: bản này CHƯA có đăng nhập, phân quyền thành viên gia đình hoặc cơ sở dữ liệu tài khoản. Không nên công khai backend cho người khác dùng với dữ liệu tài chính cho đến khi bổ sung xác thực và phân quyền.

## 1. Chuẩn bị
Cài Java 21 và Maven (hoặc mở project bằng IntelliJ IDEA có Maven).

## 2. Cấu hình URL Google Apps Script
Lấy URL Web App có dạng `https://script.google.com/macros/s/.../exec` từ Deploy → Manage deployments → Web app.

Windows PowerShell:
```powershell
$env:GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/THAY_BANG_URL_CUA_BAN/exec"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
mvn spring-boot:run
```

Hoặc cấu hình biến môi trường trong IntelliJ Run Configuration. Không đưa URL bí mật vào Git nếu dự án đã được chia sẻ.

Backend chạy ở `http://localhost:8080`.

## 3. API
### Kiểm tra backend
`GET http://localhost:8080/api/health`

### Lấy giao dịch
`GET http://localhost:8080/api/transactions`

Phản hồi dạng:
```json
{
  "success": true,
  "message": "Lấy danh sách giao dịch thành công",
  "data": [
    {
      "id": "tx-123",
      "date": "2026-10-28",
      "title": "Tiền ăn",
      "type": "expense",
      "category": "Ăn uống",
      "amount": 50000,
      "method": "Chuyển khoản",
      "note": ""
    }
  ]
}
```

### Ghi lại toàn bộ danh sách
`PUT http://localhost:8080/api/transactions/replace-all`
Header: `Content-Type: application/json`

Body:
```json
[
  {
    "id": "tx-123",
    "date": "2026-10-28",
    "title": "Tiền ăn",
    "type": "expense",
    "category": "Ăn uống",
    "amount": 50000,
    "method": "Chuyển khoản",
    "note": ""
  }
]
```

**Cảnh báo:** API `replace-all` ghi đè toàn bộ các dòng giao dịch trong Sheet. Hãy sao lưu Sheet trước khi thử; không gửi danh sách rỗng trừ khi bạn thực sự muốn xóa toàn bộ giao dịch.

## 4. Nối React vào backend
Frontend cần đổi các hàm đang gọi trực tiếp URL Apps Script sang gọi:
- Đọc: `GET http://localhost:8080/api/transactions`
- Ghi: `PUT http://localhost:8080/api/transactions/replace-all`

Không cần bật JSONP hoặc `mode: 'no-cors'` khi React gọi backend. Ví dụ:
```js
const API_BASE = 'http://localhost:8080';

export async function loadTransactions() {
  const response = await fetch(`${API_BASE}/api/transactions`);
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Không tải được giao dịch');
  }
  return result.data || [];
}

export async function replaceAllTransactions(rows) {
  const response = await fetch(`${API_BASE}/api/transactions/replace-all`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Không lưu được giao dịch');
  }
  return result.data || [];
}
```

## 5. Hướng phát triển tiếp theo
1. Thêm đăng ký/đăng nhập và mật khẩu được mã hóa.
2. Thêm Spring Security + JWT.
3. Lưu tài khoản và quan hệ thành viên gia đình trong MySQL.
4. Phân quyền để mỗi người chỉ xem/sửa dữ liệu được phép.
5. Sau khi có đăng nhập, bảo vệ các API giao dịch trước khi triển khai công khai.
