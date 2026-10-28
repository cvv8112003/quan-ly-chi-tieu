package vn.vinho.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record TransactionDto(
        String id,
        @NotBlank(message = "Ngày giao dịch không được để trống") String date,
        @NotBlank(message = "Tên giao dịch không được để trống") String title,
        @NotBlank(message = "Loại giao dịch không được để trống") String type,
        String category,
        @Positive(message = "Số tiền phải lớn hơn 0") double amount,
        String method,
        String note
) {}
