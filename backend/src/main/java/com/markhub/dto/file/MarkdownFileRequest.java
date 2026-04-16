package com.markhub.dto.file;

import jakarta.validation.constraints.NotBlank;

public record MarkdownFileRequest(
        @NotBlank String name,
        @NotBlank String content
) {
}
