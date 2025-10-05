package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                // In a real application, you would set a base URL, headers, etc.
                // .baseUrl("https://api.example.com")
                .build();
    }
}
