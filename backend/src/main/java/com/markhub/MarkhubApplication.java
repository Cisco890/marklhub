package com.markhub;

import com.markhub.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class MarkhubApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarkhubApplication.class, args);
    }
}
