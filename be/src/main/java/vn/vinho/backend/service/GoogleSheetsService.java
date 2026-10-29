package vn.vinho.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import vn.vinho.backend.dto.TransactionDto;
import vn.vinho.backend.dto.UpdatePasswordRequest;
import vn.vinho.backend.dto.auth.AuthResponse;

import java.util.List;
import java.util.Map;

@Service
public class GoogleSheetsService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${google.script.url:}")
    private String scriptUrl;

    public GoogleSheetsService(
            RestClient.Builder builder,
            ObjectMapper objectMapper
    ) {
        this.restClient = builder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Lấy danh sách giao dịch theo userId từ Google Sheets.
     */
    public List<TransactionDto> getTransactions(String userId) {
        String url = requireScriptUrl();

        try {
            StringBuilder requestUrl = new StringBuilder(url)
                    .append(url.contains("?") ? "&" : "?")
                    .append("action=list");

            if (userId != null && !userId.isBlank()) {
                requestUrl.append("&userId=").append(userId.trim());
            }

            String body = restClient.get()
                    .uri(requestUrl.toString())
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(body);

            if (!root.path("success").asBoolean(false)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        root.path("message").asText(
                                "Không đọc được dữ liệu Google Sheets."
                        )
                );
            }

            return objectMapper.convertValue(
                    root.path("data"),
                    new TypeReference<List<TransactionDto>>() {}
            );

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Không đọc được dữ liệu từ Google Sheets.",
                    ex
            );
        }
    }

    /**
     * Thêm một giao dịch mới.
     */
    public TransactionDto createTransaction(TransactionDto transaction) {
        if (transaction == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Giao dịch không hợp lệ."
            );
        }

        String id = transaction.id();

        if (id == null || id.isBlank()) {
            id = java.util.UUID.randomUUID().toString();
        }

        TransactionDto newTransaction = new TransactionDto(
                id,
                transaction.date(),
                transaction.title(),
                transaction.type(),
                transaction.category(),
                transaction.amount(),
                transaction.method(),
                transaction.note(),
                transaction.userId()
        );

        callScript("create", Map.of("transaction", newTransaction));

        return findById(id, transaction.userId());
    }

    /**
     * Cập nhật một giao dịch theo ID.
     */
    public TransactionDto updateTransaction(
            String id,
            TransactionDto transaction
    ) {
        if (id == null || id.isBlank() || transaction == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "ID hoặc thông tin giao dịch không hợp lệ."
            );
        }

        TransactionDto updatedTransaction = new TransactionDto(
                id,
                transaction.date(),
                transaction.title(),
                transaction.type(),
                transaction.category(),
                transaction.amount(),
                transaction.method(),
                transaction.note(),
                transaction.userId()
        );

        callScript(
                "update",
                Map.of("transaction", updatedTransaction)
        );

        return findById(id, transaction.userId());
    }

    /**
     * Xóa một giao dịch theo ID.
     */
    public void deleteTransaction(String id) {
        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "ID giao dịch không hợp lệ."
            );
        }

        callScript("delete", Map.of("id", id));
    }

    /**
     * Lấy danh sách ngân sách (Budgets) của user từ Google Sheets.
     */
    public Map<String, Object> getBudgets(String userId) {
        String url = requireScriptUrl();

        try {
            StringBuilder requestUrl = new StringBuilder(url)
                    .append(url.contains("?") ? "&" : "?")
                    .append("action=getBudgets");

            if (userId != null && !userId.isBlank()) {
                requestUrl.append("&userId=").append(userId.trim());
            }

            String body = restClient.get()
                    .uri(requestUrl.toString())
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(body);

            if (!root.path("success").asBoolean(false)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        root.path("message").asText("Không đọc được dữ liệu ngân sách từ Google Sheets.")
                );
            }

            return objectMapper.convertValue(
                    root.path("data"),
                    new TypeReference<Map<String, Object>>() {}
            );

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Lỗi khi đọc dữ liệu ngân sách từ Google Sheets.",
                    ex
            );
        }
    }

    /**
     * Lưu/Cập nhật danh sách ngân sách (Budgets) lên Google Sheets.
     */
    public void saveBudgets(String userId, Map<String, ? extends Number> budgets) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User ID không hợp lệ."
            );
        }

        callScript("saveBudgets", Map.of(
                "userId", userId,
                "budgets", budgets != null ? budgets : Map.of()
        ));
    }

    /**
     * Tìm giao dịch theo ID và userId.
     */
    private TransactionDto findById(String id, String userId) {
        return getTransactions(userId).stream()
                .filter(item -> id.equals(item.id()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy giao dịch có ID: " + id
                ));
    }

    /**
     * Gửi yêu cầu đến Google Apps Script (POST).
     */
    private JsonNode callScript(String action, Map<String, ?> data) {
        String url = requireScriptUrl();

        try {
            Map<String, Object> request = new java.util.HashMap<>();
            request.put("action", action);
            request.putAll(data);

            String requestBody = objectMapper.writeValueAsString(request);

            String body = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (body == null || body.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Google Apps Script không trả về dữ liệu."
                );
            }

            JsonNode root = objectMapper.readTree(body);

            if (!root.path("success").asBoolean(false)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        root.path("message").asText(
                                "Không thể xử lý yêu cầu."
                        )
                );
            }

            return root;

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Lỗi khi xử lý trên Google Sheets: " + ex.getMessage(),
                    ex
            );
        }
    }

    /**
     * Kiểm tra URL Apps Script.
     */
    private String requireScriptUrl() {
        if (scriptUrl == null
                || scriptUrl.isBlank()
                || !scriptUrl.trim().startsWith(
                        "https://script.google.com/macros/s/"
                )
                || !scriptUrl.trim().endsWith("/exec")) {

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Chưa cấu hình GOOGLE_SCRIPT_URL hoặc URL không hợp lệ."
            );
        }

        return scriptUrl.trim();
    }

    /**
     * Đăng ký tài khoản mới.
     */
    public AuthResponse register(String email, String password, String name) {
        JsonNode root = callScript("register", Map.of(
                "email", email,
                "password", password != null ? password : "",
                "name", name != null ? name : ""
        ));
        return parseAuthResult(root);
    }

    /**
     * Đăng nhập tài khoản.
     */
    public AuthResponse login(String email, String password) {
        JsonNode root = callScript("login", Map.of(
                "email", email,
                "password", password != null ? password : ""
        ));
        return parseAuthResult(root);
    }

    /**
     * Đăng nhập / Đăng ký bằng Google (Gmail).
     */
    public AuthResponse googleLogin(String email, String name) {
        JsonNode root = callScript("google-login", Map.of(
                "email", email,
                "name", name != null ? name : ""
        ));
        return parseAuthResult(root);
    }

    /**
     * Đổi / Tạo mật khẩu mới cho người dùng.
     */
    public Map<String, Object> updatePassword(UpdatePasswordRequest request) {
        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID không hợp lệ.");
        }

        JsonNode root = callScript("update-password", Map.of(
                "userId", request.getUserId(),
                "currentPassword", request.getCurrentPassword() != null ? request.getCurrentPassword() : "",
                "newPassword", request.getNewPassword() != null ? request.getNewPassword() : ""
        ));

        return Map.of(
                "success", true,
                "message", root.path("message").asText("Cập nhật mật khẩu thành công.")
        );
    }

    private AuthResponse parseAuthResult(JsonNode root) {
        String token = root.path("token").asText("");
        JsonNode dataNode = root.path("data");

        AuthResponse.UserData user = new AuthResponse.UserData(
                dataNode.path("id").asText(""),
                dataNode.path("email").asText(""),
                dataNode.path("name").asText("")
        );

        return new AuthResponse(token, user);
    }
}