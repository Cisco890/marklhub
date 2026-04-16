package com.markhub.controller;

import com.markhub.dto.project.ProjectRequest;
import com.markhub.dto.project.ProjectResponse;
import com.markhub.security.MarkhubUserDetails;
import com.markhub.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/api/projects/{projectId}")
    public ProjectResponse getOne(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long projectId
    ) {
        return projectService.getForUser(principal.getId(), projectId);
    }

    @GetMapping("/api/teams/{teamId:\\d+}/projects")
    public List<ProjectResponse> list(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long teamId
    ) {
        return projectService.listByTeam(principal.getId(), teamId);
    }

    @PostMapping("/api/teams/{teamId:\\d+}/projects")
    public ProjectResponse create(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long teamId,
            @Valid @RequestBody ProjectRequest request
    ) {
        return projectService.create(principal.getId(), teamId, request);
    }

    @PutMapping("/api/projects/{projectId}")
    public ProjectResponse update(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectRequest request
    ) {
        return projectService.update(principal.getId(), projectId, request);
    }

    @DeleteMapping("/api/projects/{projectId}")
    public void delete(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long projectId
    ) {
        projectService.delete(principal.getId(), projectId);
    }
}
