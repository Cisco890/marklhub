package com.markhub.controller;

import com.markhub.dto.folder.FolderRequest;
import com.markhub.dto.folder.FolderResponse;
import com.markhub.security.MarkhubUserDetails;
import com.markhub.service.FolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @GetMapping("/api/folders/{folderId}")
    public FolderResponse getOne(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long folderId
    ) {
        return folderService.getForUser(principal.getId(), folderId);
    }

    @GetMapping("/api/projects/{projectId}/folders")
    public List<FolderResponse> list(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long projectId
    ) {
        return folderService.listByProject(principal.getId(), projectId);
    }

    @PostMapping("/api/projects/{projectId}/folders")
    public FolderResponse create(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long projectId,
            @Valid @RequestBody FolderRequest request
    ) {
        return folderService.create(principal.getId(), projectId, request);
    }

    @PutMapping("/api/folders/{folderId}")
    public FolderResponse update(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long folderId,
            @Valid @RequestBody FolderRequest request
    ) {
        return folderService.update(principal.getId(), folderId, request);
    }

    @DeleteMapping("/api/folders/{folderId}")
    public void delete(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long folderId
    ) {
        folderService.delete(principal.getId(), folderId);
    }
}
