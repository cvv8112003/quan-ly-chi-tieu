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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

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
     * Lấy toàn bộ giao dịch từ Google Sheets.
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
                        root.path("message")
                                .asText("Không đọc được dữ liệu Google Sheets.")
                );
            }

            return objectMapper.convertValue(
                    root.path("data"),
                    new TypeReference<List<TransactionDto>>() {}
            );

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            ex.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Không đọc được dữ liệu từ Google Sheets. "
                            + "Hãy kiểm tra URL và quyền triển khai.",
                    ex
            );
        }
    }

    /**
     * Thay thế toàn bộ giao dịch trong Google Sheets.
     * Chú ý: Không phải thêm một giao dịch mới.
     */
    public List<TransactionDto> replaceAll(
            List<TransactionDto> transactions
    ) {
        String url = requireScriptUrl();

        try {
            if (transactions == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Danh sách giao dịch không hợp lệ."
                );
            }

            // Chuyển danh sách giao dịch thành JSON.
            String json = objectMapper.writeValueAsString(transactions);

            // Tạo JSON có action và data.
            // data là một mảng JSON, không phải chuỗi JSON.
            String requestBody = objectMapper.writeValueAsString(
                    java.util.Map.of(
                            "action", "replaceAll",
                            "data", transactions
                    )
            );

            // Gửi POST đến Google Apps Script.
            String body = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            System.out.println(
                    "Phản hồi từ Google Apps Script: " + body
            );

            if (body == null || body.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Google Apps Script không trả về kết quả lưu dữ liệu."
                );
            }

            // Đọc kết quả trả về từ Apps Script.
            JsonNode root = objectMapper.readTree(body);

            if (!root.path("success").asBoolean(false)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Google Sheets không lưu được dữ liệu: "
                                + root.path("message").asText("Không rõ nguyên nhân.")
                );
            }

            // Đọc lại danh sách sau khi lưu.
            return getTransactions();

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            ex.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Lỗi khi lưu Google Sheets: " + ex.getMessage(),
                    ex
            );
        }
    }

    /**
     * Kiểm tra URL Web App.
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
                    "Chưa cấu hình GOOGLE_SCRIPT_URL hoặc URL Web App không hợp lệ."
            );
        }

        return scriptUrl.trim();
    }
}