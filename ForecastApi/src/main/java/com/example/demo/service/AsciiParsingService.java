package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;


@Service
public class AsciiParsingService {

    private final RestClient restClient;

    public AsciiParsingService(@Qualifier("apiRestClient")RestClient restClient) {
        this.restClient = restClient;
    }

    public String parseAsciiResponse(String format, int limit) {
        //String asciiResponse = "ID12345,NAME_OF_ITEM,2024-10-26\nID67890,ANOTHER_ITEM,2024-10-27";
        String asciiResponse = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("startData", "2022-07-01T00")
                        .queryParam("endData", "2022-09-01T00")
                        .queryParam("variable", "NLDAS2%3ANLDAS_FORA0125_H_v2.0%3ARainf")
                        .queryParam("type","asc2")
                        .queryParam("location","GEOM%3APOINT%28-88.18%2C%2038.89%29")
                        .build())
                .retrieve()
                .body(String.class);


        if (asciiResponse == null) {
            System.err.println("Response was empty.");
            return asciiResponse;
        }
        System.out.println("--- Parsing with params format=" + format + " and limit=" + limit + " ---");
        asciiResponse.lines().limit(limit).forEach(line -> {
            String[] values = line.split(",");
            if (values.length == 3) {
                System.out.println("ID: " + values[0] + ", Name: " + values[1] + ", Date: " + values[2]);
            }
        });
        return asciiResponse;
    }
}
