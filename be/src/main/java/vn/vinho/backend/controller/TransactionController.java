package vn.vinho.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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

    /**
     * Lấy danh sách giao dịch.
     */
    @GetMapping
    public ApiResponse<List<TransactionDto>> list(
            @RequestParam(required = false) String userId
    ) {
        return ApiResponse.ok(
                "Lấy danh sách giao dịch thành công",
                googleSheetsService.getTransactions(userId)
        );
    }

    /**
     * Thêm một giao dịch mới.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TransactionDto> create(
            @Valid @RequestBody TransactionDto transaction
    ) {
        TransactionDto result =
                googleSheetsService.createTransaction(transaction);

        return ApiResponse.ok(
                "Thêm giao dịch thành công",
                result
        );
    }

    /**
     * Cập nhật giao dịch theo ID.
     */
    @PutMapping("/{id}")
    public ApiResponse<TransactionDto> update(
            @PathVariable String id,
            @Valid @RequestBody TransactionDto transaction
    ) {
        TransactionDto result =
                googleSheetsService.updateTransaction(id, transaction);

        return ApiResponse.ok(
                "Cập nhật giao dịch thành công",
                result
        );
    }

    /**
     * Xóa giao dịch theo ID.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable String id
    ) {
        googleSheetsService.deleteTransaction(id);

        return ApiResponse.ok(
                "Xóa giao dịch thành công",
                null
        );
    }
}