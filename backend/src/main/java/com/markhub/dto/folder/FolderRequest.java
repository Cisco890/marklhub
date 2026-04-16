package com.markhub.dto.folder;

import jakarta.validation.constraints.NotBlank;

public record FolderRequest(
        @NotBlank String name,
        Long parentFolderId
) {
}
