package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ApiConfig {

    @Bean
    public RestClient restClient() {
        return RestClient.builder().baseUrl("https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/timeseries.cgi").build();
    }
}
