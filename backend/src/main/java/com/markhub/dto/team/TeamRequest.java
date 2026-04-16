package com.markhub.dto.team;

import jakarta.validation.constraints.NotBlank;

public record TeamRequest(
        @NotBlank String name,
        String description
) {
}
