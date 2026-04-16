package com.markhub.security;

import com.markhub.config.JwtProperties;
import com.markhub.entity.Role;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    @Test
    void createsAndReadsRoundTripToken() {
        JwtProperties props = new JwtProperties();
        props.setSecret("test-secret-must-be-long-enough-for-hs256-algorithm-bits");
        props.setExpirationMs(60_000L);
        JwtTokenProvider provider = new JwtTokenProvider(props);

        MarkhubUserDetails user = new MarkhubUserDetails(
                1L,
                "alice",
                "hash",
                Role.USER,
                false
        );
        String jwt = provider.createToken(user);
        assertThat(provider.validateToken(jwt)).isTrue();
        assertThat(provider.getUsername(jwt)).isEqualTo("alice");
        assertThat(provider.getUserId(jwt)).isEqualTo(1L);
    }
}
