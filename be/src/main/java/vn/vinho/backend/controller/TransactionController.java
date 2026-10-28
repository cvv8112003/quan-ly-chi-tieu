package vn.vinho.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import vn.vinho.backend.dto.ApiResponse;
import vn.vinho.backend.dto.TransactionDto;
import vn.vinho.backend.service.GoogleSheetsService;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final GoogleSheetsService googleSheetsService;

    public TransactionController(GoogleSheetsService googleSheetsService) {
        this.googleSheetsService = googleSheetsService;
    }

    @GetMapping
    public ApiResponse<List<TransactionDto>> list() {
        return ApiResponse.ok("Lấy danh sách giao dịch thành công", googleSheetsService.getTransactions());
    }

    /**
     * Lưu toàn bộ danh sách để tương thích với Apps Script hiện tại (action=replaceAll).
     * Lưu ý: endpoint này thay thế toàn bộ dữ liệu trong sheet, không phải thêm một dòng.
     */
    @PutMapping("/replace-all")
    public ApiResponse<List<TransactionDto>> replaceAll(@RequestBody List<@Valid TransactionDto> transactions) {
        if (transactions == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách giao dịch không hợp lệ");
        }
        return ApiResponse.ok("Đã gửi yêu cầu lưu và đọc lại dữ liệu", googleSheetsService.replaceAll(transactions));
    }
}
