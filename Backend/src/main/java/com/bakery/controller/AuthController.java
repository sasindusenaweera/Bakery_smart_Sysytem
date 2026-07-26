package com.bakery.controller;

import com.bakery.dto.AuthDTO;
import com.bakery.dto.UserDTO;
import com.bakery.entity.User;
import com.bakery.exception.ErrorResponse;
import com.bakery.repository.UserRepository;
import com.bakery.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserDTO.Response> registerUser(@Valid @RequestBody UserDTO.Create createDTO) {
        UserDTO.Response response = userService.registerUser(createDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody AuthDTO.LoginRequest loginRequest) {
        try {
            String token = userService.loginUser(loginRequest.username(), loginRequest.password());
            
            User user = userRepository.findByUsername(loginRequest.username())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            AuthDTO.LoginResponse response = new AuthDTO.LoginResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(HttpStatus.UNAUTHORIZED.value(), e.getMessage(), LocalDateTime.now()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO.Response> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserDTO.Response response = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
