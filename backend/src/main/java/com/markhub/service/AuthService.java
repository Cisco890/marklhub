package com.markhub.service;

import com.markhub.config.SecurityConstants;
import com.markhub.dto.auth.ChangePasswordRequest;
import com.markhub.dto.auth.LoginRequest;
import com.markhub.dto.auth.LoginResponse;
import com.markhub.dto.user.UserResponse;
import com.markhub.entity.User;
import com.markhub.exception.ApiException;
import com.markhub.mapper.EntityMappers;
import com.markhub.repository.UserRepository;
import com.markhub.security.JwtTokenProvider;
import com.markhub.security.MarkhubUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        MarkhubUserDetails details = new MarkhubUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPasswordHash(),
                user.getRole(),
                user.isMustChangePassword()
        );
        String token = jwtTokenProvider.createToken(details);
        UserResponse ur = EntityMappers.toUserResponse(user);
        return new LoginResponse(token, ur, user.isMustChangePassword());
    }

    @Transactional
    public UserResponse changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        if (request.newPassword().equals(request.currentPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must differ from current password");
        }

        if (SecurityConstants.INITIAL_USER_PASSWORD.equals(request.newPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password cannot be the initial demo password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        return EntityMappers.toUserResponse(user);
    }
}
