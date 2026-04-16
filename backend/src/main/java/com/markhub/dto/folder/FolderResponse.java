package com.markhub.dto.folder;

import java.time.Instant;

public record FolderResponse(
        Long id,
        String name,
        Long projectId,
        Long parentFolderId,
        Instant createdAt,
        Instant updatedAt
) {
}
