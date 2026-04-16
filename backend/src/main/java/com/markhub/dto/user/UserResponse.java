package com.markhub.dto.user;

import com.markhub.entity.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        Role role,
        boolean mustChangePassword,
        Instant createdAt,
        Instant updatedAt
) {
}
