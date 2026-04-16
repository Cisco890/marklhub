package com.markhub.service;

import com.markhub.exception.ApiException;
import com.markhub.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeamAccessService {

    private final TeamMemberRepository teamMemberRepository;

    public void requireTeamMember(Long userId, Long teamId) {
        if (!teamMemberRepository.isUserMemberOfTeam(userId, teamId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not a member of this team");
        }
    }
}
