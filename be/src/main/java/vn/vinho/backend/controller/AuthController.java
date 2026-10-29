package vn.vinho.backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.vinho.backend.dto.ApiResponse;
import vn.vinho.backend.dto.UpdatePasswordRequest;
import vn.vinho.backend.dto.auth.AuthResponse;
import vn.vinho.backend.dto.auth.AuthRequest;
import vn.vinho.backend.service.GoogleSheetsService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final GoogleSheetsService sheetsService;

    public AuthController(GoogleSheetsService sheetsService) {
        this.sheetsService = sheetsService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody AuthRequest request) {
        AuthResponse result = sheetsService.register(request.email(), request.password(), request.name());
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký thành công", result));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse result = sheetsService.login(request.email(), request.password());
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", result));
    }

    @PostMapping("/google-login")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@RequestBody AuthRequest request) {
        AuthResponse result = sheetsService.googleLogin(request.email(), request.name());
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập Google thành công", result));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(@RequestBody UpdatePasswordRequest request) {
        sheetsService.updatePassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật mật khẩu thành công", null));
    }
}