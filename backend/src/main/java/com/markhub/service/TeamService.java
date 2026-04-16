package com.markhub.service;

import com.markhub.dto.team.TeamRequest;
import com.markhub.dto.team.TeamResponse;
import com.markhub.entity.Team;
import com.markhub.entity.TeamMember;
import com.markhub.entity.User;
import com.markhub.exception.ApiException;
import com.markhub.dto.user.UserResponse;
import com.markhub.mapper.EntityMappers;
import com.markhub.repository.TeamMemberRepository;
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
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TeamAccessService teamAccessService;

    @Transactional
    public TeamResponse createTeam(TeamRequest request) {
        Instant now = Instant.now();
        Team team = Team.builder()
                .name(request.name().trim())
                .description(request.description())
                .createdAt(now)
                .updatedAt(now)
                .build();
        team = teamRepository.save(team);
        return EntityMappers.toTeamResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> listAllTeams() {
        return teamRepository.findAllByOrderByNameAsc().stream()
                .map(EntityMappers::toTeamResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> listMyTeams(Long userId) {
        List<Team> teams = teamMemberRepository.findTeamsByUserId(userId);
        return teams.stream().map(EntityMappers::toTeamResponse).toList();
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeam(Long userId, Long teamId) {
        teamAccessService.requireTeamMember(userId, teamId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Team not found"));
        return EntityMappers.toTeamResponse(team);
    }

    @Transactional
    public void addMember(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Team not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (teamMemberRepository.existsByUserAndTeam(user, team)) {
            throw new ApiException(HttpStatus.CONFLICT, "User is already in this team");
        }

        TeamMember member = TeamMember.builder()
                .user(user)
                .team(team)
                .joinedAt(Instant.now())
                .build();
        teamMemberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listMembers(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Team not found"));
        return teamMemberRepository.findUsersByTeamId(team.getId()).stream()
                .map(EntityMappers::toUserResponse)
                .toList();
    }

    @Transactional
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Team not found"));
        teamRepository.delete(team);
    }

    @Transactional
    public void removeMember(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Team not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        TeamMember tm = teamMemberRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Membership not found"));
        teamMemberRepository.delete(tm);
    }
}
