package com.bakery.dto;

import jakarta.validation.constraints.NotBlank;

public sealed interface AuthDTO permits AuthDTO.LoginRequest, AuthDTO.LoginResponse {
    
    record LoginRequest(
        @NotBlank(message = "Username is required")
        String username,
        
        @NotBlank(message = "Password is required")
        String password
    ) implements AuthDTO {}
    
    record LoginResponse(
        String token,
        Long userId,
        String username,
        String email,
        String role
    ) implements AuthDTO {}
}
