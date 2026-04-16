package com.markhub.dto.team;

import java.time.Instant;

public record TeamResponse(
        Long id,
        String name,
        String description,
        Instant createdAt,
        Instant updatedAt
) {
}
