package com.markhub.dto.project;

import java.time.Instant;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        Long teamId,
        Long createdBy,
        Instant createdAt,
        Instant updatedAt
) {
}
