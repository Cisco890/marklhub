package com.markhub.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Railway (and Heroku-style) {@code DATABASE_URL} values use {@code postgresql://}.
 * Spring JDBC expects {@code jdbc:postgresql://}. This maps env {@code DATABASE_URL} to
 * {@code spring.datasource.*} when needed, with highest precedence.
 */
public class RailwayPostgresUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    private static final String ENV_DATABASE_URL = "DATABASE_URL";
    private static final String DS_URL = "spring.datasource.url";
    private static final String DS_USER = "spring.datasource.username";
    private static final String DS_PASS = "spring.datasource.password";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = environment.getProperty(ENV_DATABASE_URL);
        if (raw == null || raw.isBlank()) {
            return;
        }
        raw = raw.trim();
        if (raw.startsWith("jdbc:postgresql://") || raw.startsWith("jdbc:postgres://")) {
            return;
        }
        if (!raw.startsWith("postgresql://") && !raw.startsWith("postgres://")) {
            return;
        }

        try {
            String normalized = raw.replaceFirst("^postgres(ql)?://", "http://");
            URI uri = URI.create(normalized);
            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                throw new IllegalArgumentException("missing host");
            }
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath();
            String database = (path == null || path.isEmpty() || "/".equals(path))
                    ? ""
                    : path.replaceFirst("^/", "");
            if (database.isBlank()) {
                throw new IllegalArgumentException("missing database name in path");
            }

            Map<String, Object> map = new HashMap<>();
            map.put(DS_URL, "jdbc:postgresql://" + host + ":" + port + "/" + database);

            String userInfo = uri.getUserInfo();
            if (userInfo != null && !userInfo.isBlank()) {
                int colon = userInfo.indexOf(':');
                if (colon > 0) {
                    map.put(DS_USER, userInfo.substring(0, colon));
                    map.put(DS_PASS, userInfo.substring(colon + 1));
                } else {
                    map.put(DS_USER, userInfo);
                }
            }

            environment.getPropertySources().addFirst(new MapPropertySource("railwayDatabaseUrl", map));
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Could not parse " + ENV_DATABASE_URL + " as a PostgreSQL URL. "
                            + "Use postgresql://user:pass@host:port/db or jdbc:postgresql://host:port/db.",
                    e);
        }
    }
}
