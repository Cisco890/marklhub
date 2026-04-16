package com.markhub.dto.file;

import java.time.Instant;

public record MarkdownFileResponse(
        Long id,
        String name,
        Long projectId,
        Long folderId,
        String content,
        Long createdBy,
        Long updatedBy,
        Instant createdAt,
        Instant updatedAt
) {
}
