package com.markhub.controller;

import com.markhub.dto.user.CreateUserRequest;
import com.markhub.dto.user.UpdateUserRequest;
import com.markhub.dto.user.UserResponse;
import com.markhub.dto.user.UserWithTeamsResponse;
import com.markhub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.markhub.security.MarkhubUserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @GetMapping
    public List<UserWithTeamsResponse> list() {
        return userService.listAllWithTeams();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal MarkhubUserDetails principal,
            @PathVariable Long id
    ) {
        userService.delete(id, principal.getId());
    }
}
