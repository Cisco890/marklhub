package com.markhub.service;

import com.markhub.dto.project.ProjectRequest;
import com.markhub.dto.project.ProjectResponse;
import com.markhub.entity.Project;
import com.markhub.entity.Team;
import com.markhub.entity.User;
import com.markhub.exception.ApiException;
import com.markhub.mapper.EntityMappers;
import com.markhub.repository.ProjectRepository;
import com.markhub.repository.TeamRepository;
import com.markhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamAccessService teamAccessService;

    @Transactional(readOnly = true)
    public List<ProjectResponse> listByTeam(Long userId, Long teamId) {
        teamAccessService.requireTeamMember(userId, teamId);
        return projectRepository.findByTeamIdOrderByNameAsc(teamId).stream()
                .map(EntityMappers::toProjectResponse)
                .toList();
    }

    @Transactional
    public ProjectResponse create(Long userId, Long teamId, ProjectRequest request) {
        teamAccessService.requireTeamMember(userId, teamId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Team not found"));
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        Instant now = Instant.now();
        Project project = Project.builder()
                .name(request.name().trim())
                .description(request.description())
                .team(team)
                .createdBy(creator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        project = projectRepository.save(project);
        return EntityMappers.toProjectResponse(project);
    }

    @Transactional
    public ProjectResponse update(Long userId, Long projectId, ProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        teamAccessService.requireTeamMember(userId, project.getTeam().getId());
        project.setName(request.name().trim());
        project.setDescription(request.description());
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);
        return EntityMappers.toProjectResponse(project);
    }

    @Transactional
    public void delete(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        teamAccessService.requireTeamMember(userId, project.getTeam().getId());
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public Project getProjectOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    @Transactional(readOnly = true)
    public ProjectResponse getForUser(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        teamAccessService.requireTeamMember(userId, project.getTeam().getId());
        return EntityMappers.toProjectResponse(project);
    }
}
