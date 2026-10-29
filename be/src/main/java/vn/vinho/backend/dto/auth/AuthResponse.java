package vn.vinho.backend.dto.auth;

public record AuthResponse(
        String token,
        UserData user
) {
    public record UserData(
            String id,
            String email,
            String name
    ) {}
}