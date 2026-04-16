package com.markhub.service;

import com.markhub.config.SecurityConstants;
import com.markhub.dto.team.TeamBriefResponse;
import com.markhub.dto.user.CreateUserRequest;
import com.markhub.dto.user.UpdateUserRequest;
import com.markhub.dto.user.UserResponse;
import com.markhub.dto.user.UserWithTeamsResponse;
import com.markhub.entity.Team;
import com.markhub.entity.User;
import com.markhub.exception.ApiException;
import com.markhub.mapper.EntityMappers;
import com.markhub.repository.MarkdownFileRepository;
import com.markhub.repository.ProjectRepository;
import com.markhub.repository.TeamMemberRepository;
import com.markhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final MarkdownFileRepository markdownFileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String username = request.username().trim();
        if (userRepository.existsByUsername(username)) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
        }
        Instant now = Instant.now();
        User user = User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(SecurityConstants.INITIAL_USER_PASSWORD))
                .role(request.role())
                .mustChangePassword(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
        user = userRepository.save(user);
        return EntityMappers.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserWithTeamsResponse> listAllWithTeams() {
        List<User> users = userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getUsername, String.CASE_INSENSITIVE_ORDER))
                .toList();
        return users.stream().map(this::toUserWithTeams).toList();
    }

    private UserWithTeamsResponse toUserWithTeams(User u) {
        List<TeamBriefResponse> teams = teamMemberRepository.findTeamsByUserId(u.getId()).stream()
                .sorted(Comparator.comparing(Team::getName, String.CASE_INSENSITIVE_ORDER))
                .map(t -> new TeamBriefResponse(t.getId(), t.getName()))
                .toList();
        return new UserWithTeamsResponse(
                u.getId(),
                u.getUsername(),
                u.getRole(),
                u.isMustChangePassword(),
                u.getCreatedAt(),
                u.getUpdatedAt(),
                teams
        );
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return EntityMappers.toUserResponse(user);
    }

    /**
     * Elimina un usuario: reasigna referencias en proyectos y archivos a otro usuario y borra membresías.
     */
    @Transactional
    public void delete(Long id, Long actingUserId) {
        if (id.equals(actingUserId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No puedes eliminar tu propia cuenta");
        }
        User toDelete = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (userRepository.count() <= 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No se puede eliminar el único usuario del sistema");
        }
        User replacement = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(id))
                .min(Comparator.comparing(User::getId))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "No replacement user"));

        projectRepository.reassignCreatedBy(toDelete.getId(), replacement);
        markdownFileRepository.reassignCreatedBy(toDelete.getId(), replacement);
        markdownFileRepository.reassignUpdatedBy(toDelete.getId(), replacement);
        teamMemberRepository.deleteAllByUserId(toDelete.getId());
        userRepository.delete(toDelete);
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        String newName = request.username().trim();
        if (!newName.equals(user.getUsername()) && userRepository.existsByUsername(newName)) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
        }
        user.setUsername(newName);
        if (request.role() != null) {
            user.setRole(request.role());
        }
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return EntityMappers.toUserResponse(user);
    }
}
