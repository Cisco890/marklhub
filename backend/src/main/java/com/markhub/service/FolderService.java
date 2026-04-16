package com.markhub.service;

import com.markhub.dto.folder.FolderRequest;
import com.markhub.dto.folder.FolderResponse;
import com.markhub.entity.Folder;
import com.markhub.entity.Project;
import com.markhub.exception.ApiException;
import com.markhub.mapper.EntityMappers;
import com.markhub.repository.FolderRepository;
import com.markhub.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final ProjectRepository projectRepository;
    private final TeamAccessService teamAccessService;

    @Transactional(readOnly = true)
    public List<FolderResponse> listByProject(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        teamAccessService.requireTeamMember(userId, project.getTeam().getId());
        return folderRepository.findByProjectIdOrderByNameAsc(projectId).stream()
                .map(EntityMappers::toFolderResponse)
                .toList();
    }

    @Transactional
    public FolderResponse create(Long userId, Long projectId, FolderRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        teamAccessService.requireTeamMember(userId, project.getTeam().getId());

        Folder parent = null;
        if (request.parentFolderId() != null) {
            parent = folderRepository.findById(request.parentFolderId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Parent folder not found"));
            if (!parent.getProject().getId().equals(projectId)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Parent folder must belong to the same project");
            }
        }

        Instant now = Instant.now();
        Folder folder = Folder.builder()
                .name(request.name().trim())
                .project(project)
                .parentFolder(parent)
                .createdAt(now)
                .updatedAt(now)
                .build();
        folder = folderRepository.save(folder);
        return EntityMappers.toFolderResponse(folder);
    }

    @Transactional
    public FolderResponse update(Long userId, Long folderId, FolderRequest request) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Folder not found"));
        teamAccessService.requireTeamMember(userId, folder.getProject().getTeam().getId());

        if (request.parentFolderId() != null) {
            if (request.parentFolderId().equals(folderId)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Folder cannot be its own parent");
            }
            Folder parent = folderRepository.findById(request.parentFolderId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Parent folder not found"));
            if (!parent.getProject().getId().equals(folder.getProject().getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Parent folder must belong to the same project");
            }
            folder.setParentFolder(parent);
        } else {
            folder.setParentFolder(null);
        }

        folder.setName(request.name().trim());
        folder.setUpdatedAt(Instant.now());
        folderRepository.save(folder);
        return EntityMappers.toFolderResponse(folder);
    }

    @Transactional
    public void delete(Long userId, Long folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Folder not found"));
        teamAccessService.requireTeamMember(userId, folder.getProject().getTeam().getId());
        folderRepository.delete(folder);
    }

    @Transactional(readOnly = true)
    public Folder getFolderOrThrow(Long folderId) {
        return folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Folder not found"));
    }

    @Transactional(readOnly = true)
    public FolderResponse getForUser(Long userId, Long folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Folder not found"));
        teamAccessService.requireTeamMember(userId, folder.getProject().getTeam().getId());
        return EntityMappers.toFolderResponse(folder);
    }
}
