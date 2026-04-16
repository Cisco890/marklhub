package com.markhub.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "markhub.jwt")
public class JwtProperties {

    /**
     * HS256 secret; must be strong in production.
     */
    private String secret;

    private long expirationMs = 86_400_000L;
}
