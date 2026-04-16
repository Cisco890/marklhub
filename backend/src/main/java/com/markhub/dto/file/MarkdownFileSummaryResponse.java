package com.markhub.dto.file;

import java.time.Instant;

/**
 * Lightweight row for search results (includes folder/project for navigation).
 */
public record MarkdownFileSummaryResponse(
        Long id,
        String name,
        Long projectId,
        Long folderId,
        Long createdBy,
        Instant updatedAt
) {
}
