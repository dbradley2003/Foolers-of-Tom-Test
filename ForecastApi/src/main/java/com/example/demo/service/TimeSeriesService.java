package com.example.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class TimeSeriesService {

    //private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper(); // For parsing JSON

    //public TimeSeriesService(RestClient restClient) {
        //this.restClient = restClient;
   // }


    public void processTimeSeriesData() {
        ResponseExtractor<Void> responseExtractor = response -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.getBody()))) {
                reader.lines().forEach(line -> {
                    try {

                        //TimeSeriesDataPoint dataPoint = objectMapper.readValue(line, TimeSeriesDataPoint.class);
                       //restClient.get()

                        System.out.println("Processing data point: " + line);

                    } catch (Exception e) {

                        System.err.println("Error parsing line: " + e.getMessage());
                    }
                });
            }
            return null;
        };


        // Execute the request and apply the streaming extractor
//        restClient.get()
//                .uri("/large-timeseries-endpoint")
//                .exchange(responseExtractor);
   }
}
