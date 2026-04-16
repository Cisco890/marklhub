package com.markhub.config;

import com.markhub.entity.Role;
import com.markhub.entity.User;
import com.markhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Seeds a default {@code admin} user when the database is empty so the system can be used immediately.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${markhub.bootstrap.admin-username:admin}")
    private String adminUsername;

    @Value("${markhub.bootstrap.admin-password:password123}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }
        Instant now = Instant.now();
        User admin = User.builder()
                .username(adminUsername)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .mustChangePassword(false)
                .createdAt(now)
                .updatedAt(now)
                .build();
        userRepository.save(admin);
        log.info("Seeded default admin user '{}'", adminUsername);
    }
}
