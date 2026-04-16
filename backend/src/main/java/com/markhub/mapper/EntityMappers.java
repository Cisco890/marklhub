package com.markhub.mapper;

import com.markhub.dto.file.MarkdownFileResponse;
import com.markhub.dto.file.MarkdownFileSummaryResponse;
import com.markhub.dto.folder.FolderResponse;
import com.markhub.dto.project.ProjectResponse;
import com.markhub.dto.team.TeamResponse;
import com.markhub.dto.user.UserResponse;
import com.markhub.entity.Folder;
import com.markhub.entity.MarkdownFile;
import com.markhub.entity.Project;
import com.markhub.entity.Team;
import com.markhub.entity.User;

public final class EntityMappers {

    private EntityMappers() {
    }

    public static UserResponse toUserResponse(User u) {
        return new UserResponse(
                u.getId(),
                u.getUsername(),
                u.getRole(),
                u.isMustChangePassword(),
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }

    public static TeamResponse toTeamResponse(Team t) {
        return new TeamResponse(
                t.getId(),
                t.getName(),
                t.getDescription(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }

    public static ProjectResponse toProjectResponse(Project p) {
        return new ProjectResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getTeam().getId(),
                p.getCreatedBy().getId(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    public static FolderResponse toFolderResponse(Folder f) {
        return new FolderResponse(
                f.getId(),
                f.getName(),
                f.getProject().getId(),
                f.getParentFolder() != null ? f.getParentFolder().getId() : null,
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }

    public static MarkdownFileResponse toFileResponse(MarkdownFile mf) {
        return new MarkdownFileResponse(
                mf.getId(),
                mf.getName(),
                mf.getProject().getId(),
                mf.getFolder().getId(),
                mf.getContent(),
                mf.getCreatedBy().getId(),
                mf.getUpdatedBy().getId(),
                mf.getCreatedAt(),
                mf.getUpdatedAt()
        );
    }

    public static MarkdownFileSummaryResponse toFileSummary(MarkdownFile mf) {
        return new MarkdownFileSummaryResponse(
                mf.getId(),
                mf.getName(),
                mf.getProject().getId(),
                mf.getFolder().getId(),
                mf.getCreatedBy().getId(),
                mf.getUpdatedAt()
        );
    }
}
