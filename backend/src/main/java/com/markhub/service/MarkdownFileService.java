package com.markhub.service;

import com.markhub.dto.file.MarkdownFileRequest;
import com.markhub.dto.file.MarkdownFileResponse;
import com.markhub.dto.file.MarkdownFileSummaryResponse;
import com.markhub.entity.Folder;
import com.markhub.entity.MarkdownFile;
import com.markhub.entity.User;
import com.markhub.exception.ApiException;
import com.markhub.mapper.EntityMappers;
import com.markhub.repository.FolderRepository;
import com.markhub.repository.MarkdownFileRepository;
import com.markhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MarkdownFileService {

    private static final long MAX_BYTES = 2 * 1024 * 1024;

    private final MarkdownFileRepository markdownFileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final TeamAccessService teamAccessService;

    @Transactional(readOnly = true)
    public List<MarkdownFileResponse> listByFolder(Long userId, Long folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Folder not found"));
        teamAccessService.requireTeamMember(userId, folder.getProject().getTeam().getId());
        return markdownFileRepository.findByFolderIdOrderByNameAsc(folderId).stream()
                .map(EntityMappers::toFileResponse)
                .toList();
    }

    @Transactional
    public MarkdownFileResponse create(Long userId, Long folderId, MarkdownFileRequest request) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Folder not found"));
        teamAccessService.requireTeamMember(userId, folder.getProject().getTeam().getId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        Instant now = Instant.now();
        MarkdownFile file = MarkdownFile.builder()
                .name(request.name().trim())
                .project(folder.getProject())
                .folder(folder)
                .content(request.content())
                .createdBy(user)
                .updatedBy(user)
                .createdAt(now)
                .updatedAt(now)
                .build();
        file = markdownFileRepository.save(file);
        return EntityMappers.toFileResponse(file);
    }

    @Transactional
    public MarkdownFileResponse upload(Long userId, Long folderId, MultipartFile multipart) throws IOException {
        if (multipart == null || multipart.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is required");
        }
        String original = multipart.getOriginalFilename();
        if (original == null || !original.toLowerCase(Locale.ROOT).endsWith(".md")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only .md files are allowed");
        }
        if (multipart.getSize() > MAX_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File exceeds maximum size of 2MB");
        }

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Folder not found"));
        teamAccessService.requireTeamMember(userId, folder.getProject().getTeam().getId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        String content = new String(multipart.getBytes(), StandardCharsets.UTF_8);
        String name = original;
        if (name.contains("/")) {
            name = name.substring(name.lastIndexOf('/') + 1);
        }
        if (name.contains("\\")) {
            name = name.substring(name.lastIndexOf('\\') + 1);
        }

        Instant now = Instant.now();
        MarkdownFile file = MarkdownFile.builder()
                .name(name.trim())
                .project(folder.getProject())
                .folder(folder)
                .content(content)
                .createdBy(user)
                .updatedBy(user)
                .createdAt(now)
                .updatedAt(now)
                .build();
        file = markdownFileRepository.save(file);
        return EntityMappers.toFileResponse(file);
    }

    @Transactional(readOnly = true)
    public MarkdownFileResponse getById(Long userId, Long fileId) {
        MarkdownFile file = markdownFileRepository.findById(fileId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "File not found"));
        teamAccessService.requireTeamMember(userId, file.getProject().getTeam().getId());
        return EntityMappers.toFileResponse(file);
    }

    @Transactional
    public MarkdownFileResponse update(Long userId, Long fileId, MarkdownFileRequest request) {
        MarkdownFile file = markdownFileRepository.findById(fileId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "File not found"));
        teamAccessService.requireTeamMember(userId, file.getProject().getTeam().getId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        file.setName(request.name().trim());
        file.setContent(request.content());
        file.setUpdatedBy(user);
        file.setUpdatedAt(Instant.now());
        markdownFileRepository.save(file);
        return EntityMappers.toFileResponse(file);
    }

    @Transactional
    public void delete(Long userId, Long fileId) {
        MarkdownFile file = markdownFileRepository.findById(fileId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "File not found"));
        teamAccessService.requireTeamMember(userId, file.getProject().getTeam().getId());
        markdownFileRepository.delete(file);
    }

    @Transactional(readOnly = true)
    public List<MarkdownFileSummaryResponse> searchByName(Long userId, Long teamId, String name) {
        teamAccessService.requireTeamMember(userId, teamId);
        String q = name != null ? name.trim() : "";
        if (q.isEmpty()) {
            return List.of();
        }
        return markdownFileRepository.searchByTeamAndNameContainingIgnoreCase(teamId, q).stream()
                .map(EntityMappers::toFileSummary)
                .toList();
    }
}
