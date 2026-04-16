package com.markhub.dto.auth;

import com.markhub.dto.user.UserResponse;

public record LoginResponse(
        String token,
        UserResponse user,
        boolean mustChangePassword
) {
}
