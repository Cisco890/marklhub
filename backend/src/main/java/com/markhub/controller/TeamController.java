package com.markhub.controller;

import com.markhub.dto.team.TeamRequest;
import com.markhub.dto.team.TeamResponse;
import com.markhub.dto.user.UserResponse;
import com.markhub.security.MarkhubUserDetails;
import com.markhub.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public TeamResponse create(@Valid @RequestBody TeamRequest request) {
        return teamService.createTeam(request);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TeamResponse> listAll() {
        return teamService.listAllTeams();
    }

    @GetMapping("/my")
    public List<TeamResponse> myTeams(@AuthenticationPrincipal MarkhubUserDetails principal) {
        return teamService.listMyTeams(principal.getId());
    }

    /** Solo dígitos: evita que {@code /teams/all} se interprete como {@code teamId}. */
    @GetMapping("/{teamId:\\d+}")
    public TeamResponse get(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long teamId
    ) {
        return teamService.getTeam(principal.getId(), teamId);
    }

    @GetMapping("/{teamId:\\d+}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> listMembers(@PathVariable Long teamId) {
        return teamService.listMembers(teamId);
    }

    @PostMapping("/{teamId:\\d+}/members/{userId:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    public void addMember(@PathVariable Long teamId, @PathVariable Long userId) {
        teamService.addMember(teamId, userId);
    }

    @DeleteMapping("/{teamId:\\d+}/members/{userId:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    public void removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        teamService.removeMember(teamId, userId);
    }

    @DeleteMapping("/{teamId:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTeam(@PathVariable Long teamId) {
        teamService.deleteTeam(teamId);
    }
}
