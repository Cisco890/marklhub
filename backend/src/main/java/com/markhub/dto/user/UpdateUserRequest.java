package com.markhub.dto.user;

import com.markhub.entity.Role;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
        @NotBlank String username,
        /** When null, the role is left unchanged. */
        Role role
) {
}
