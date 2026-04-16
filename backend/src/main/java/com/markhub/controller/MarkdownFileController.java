package com.markhub.controller;

import com.markhub.dto.file.MarkdownFileRequest;
import com.markhub.dto.file.MarkdownFileResponse;
import com.markhub.dto.file.MarkdownFileSummaryResponse;
import com.markhub.security.MarkhubUserDetails;
import com.markhub.service.MarkdownFileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MarkdownFileController {

    private final MarkdownFileService markdownFileService;

    @GetMapping("/api/folders/{folderId}/files")
    public List<MarkdownFileResponse> listByFolder(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long folderId
    ) {
        return markdownFileService.listByFolder(principal.getId(), folderId);
    }

    @PostMapping("/api/folders/{folderId}/files")
    public MarkdownFileResponse create(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long folderId,
            @Valid @RequestBody MarkdownFileRequest request
    ) {
        return markdownFileService.create(principal.getId(), folderId, request);
    }

    @PostMapping("/api/folders/{folderId}/files/upload")
    public MarkdownFileResponse upload(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long folderId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return markdownFileService.upload(principal.getId(), folderId, file);
    }

    @GetMapping("/api/files/{fileId}")
    public MarkdownFileResponse get(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long fileId
    ) {
        return markdownFileService.getById(principal.getId(), fileId);
    }

    @PutMapping("/api/files/{fileId}")
    public MarkdownFileResponse update(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long fileId,
            @Valid @RequestBody MarkdownFileRequest request
    ) {
        return markdownFileService.update(principal.getId(), fileId, request);
    }

    @DeleteMapping("/api/files/{fileId}")
    public void delete(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long fileId
    ) {
        markdownFileService.delete(principal.getId(), fileId);
    }

    @GetMapping("/api/teams/{teamId:\\d+}/files/search")
    public List<MarkdownFileSummaryResponse> search(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long teamId,
            @RequestParam(name = "name", required = false, defaultValue = "") String name
    ) {
        return markdownFileService.searchByName(principal.getId(), teamId, name);
    }
}
