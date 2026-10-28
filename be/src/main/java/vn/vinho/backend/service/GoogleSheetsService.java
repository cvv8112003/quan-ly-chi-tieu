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
     * Lấy danh sách giao dịch.
     */
    public List<TransactionDto> getTransactions() {
        String url = requireScriptUrl();

        try {
            String requestUrl = url
                    + (url.contains("?") ? "&" : "?")
                    + "action=list";

            String body = restClient.get()
                    .uri(requestUrl)
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

        // Sinh ID mới nếu chưa có ID.
        String id = transaction.id();

        if (id == null || id.isBlank()) {
                id = java.util.UUID.randomUUID().toString();
        }

        // Tạo DTO mới vì record không có setter.
        TransactionDto newTransaction = new TransactionDto(
                id,
                transaction.date(),
                transaction.title(),
                transaction.type(),
                transaction.category(),
                transaction.amount(),
                transaction.method(),
                transaction.note()
        );

        callScript("create", Map.of("transaction", newTransaction));

        return findById(id);
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

        // Tạo DTO mới với ID lấy từ URL.
        TransactionDto updatedTransaction = new TransactionDto(
                id,
                transaction.date(),
                transaction.title(),
                transaction.type(),
                transaction.category(),
                transaction.amount(),
                transaction.method(),
                transaction.note()
        );

        callScript(
                "update",
                Map.of("transaction", updatedTransaction)
        );

        return findById(id);
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
     * Tìm giao dịch theo ID.
     */
        private TransactionDto findById(String id) {
        return getTransactions().stream()
                .filter(item -> id.equals(item.id()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy giao dịch có ID: " + id
                ));
        }

    /**
     * Gửi yêu cầu đến Google Apps Script.
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
                                "Không thể xử lý giao dịch."
                        )
                );
            }

            return root;

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Lỗi khi xử lý giao dịch trên Google Sheets: "
                            + ex.getMessage(),
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
}