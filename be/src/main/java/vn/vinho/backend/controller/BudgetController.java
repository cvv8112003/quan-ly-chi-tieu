package vn.vinho.backend.controller;

import vn.vinho.backend.dto.BudgetRequest;
import vn.vinho.backend.service.GoogleSheetsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private GoogleSheetsService googleSheetsService;

    // 1. API Lấy ngân sách theo User ID
    @GetMapping
    public ResponseEntity<Map<String, Object>> getBudgets(@RequestParam("userId") String userId) {
        try {
            Map<String, Object> result = googleSheetsService.getBudgets(userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 2. API Lưu / Cập nhật ngân sách
    @PostMapping
    public ResponseEntity<Map<String, Object>> saveBudgets(@RequestBody BudgetRequest request) {
        try {
            // Gọi đúng hàm saveBudgets từ GoogleSheetsService
            googleSheetsService.saveBudgets(request.getUserId(), request.getBudgets());
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã lưu ngân sách thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}