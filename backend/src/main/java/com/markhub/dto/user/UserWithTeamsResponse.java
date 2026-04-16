package com.markhub.dto.user;

import com.markhub.dto.team.TeamBriefResponse;
import com.markhub.entity.Role;

import java.time.Instant;
import java.util.List;

public record UserWithTeamsResponse(
        Long id,
        String username,
        Role role,
        boolean mustChangePassword,
        Instant createdAt,
        Instant updatedAt,
        List<TeamBriefResponse> teams
) {
}
