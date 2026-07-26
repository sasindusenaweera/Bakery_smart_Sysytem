package com.bakery.dto;

import com.bakery.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public sealed interface UserDTO permits UserDTO.Create, UserDTO.Response {
    
    record Create(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,
        
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,
        
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,
        
        UserRole role
    ) implements UserDTO {}
    
    record Response(
        Long id,
        String username,
        String email,
        UserRole role,
        Boolean active
    ) implements UserDTO {}
}
