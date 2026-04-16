package com.markhub.controller;

import com.markhub.dto.auth.ChangePasswordRequest;
import com.markhub.dto.auth.LoginRequest;
import com.markhub.dto.auth.LoginResponse;
import com.markhub.dto.user.UserResponse;
import com.markhub.security.MarkhubUserDetails;
import com.markhub.service.AuthService;
import com.markhub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal MarkhubUserDetails principal) {
        return userService.getById(principal.getId());
    }

    @PostMapping("/change-password")
    public UserResponse changePassword(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        return authService.changePassword(principal.getId(), request);
    }
}
