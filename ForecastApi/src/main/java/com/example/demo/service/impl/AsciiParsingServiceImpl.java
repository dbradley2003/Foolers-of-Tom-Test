package com.example.demo.service.impl;

import com.example.demo.service.AsciiParsingService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class AsciiParsingServiceImpl implements AsciiParsingService {
    private final RestClient restClient;

    public AsciiParsingServiceImpl(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/timeseries.cgi")
                .build();
    }

    @Override
    public String parseAsciiResponse(String format, int limit) {
        String asciiResponse = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("startDate", "2022-07-01T00")
                        .queryParam("endDate", "2022-09-01T00")
                        .queryParam("variable", "NLDAS2:NLDAS_FORA0125_H_v2.0:Rainf")
                        .queryParam("type", "asc2")
                        .queryParam("location", "GEOM:POINT(-88.18, 38.89)")
                        .build())
                .retrieve()
                .body(String.class);

        if (asciiResponse == null || asciiResponse.isEmpty()) {
            return "Error: Response was empty.";
        }

        Map<String, List<String>> valuesByDate = new TreeMap<>();
        asciiResponse.lines()
                .filter(line -> !line.isEmpty() && Character.isDigit(line.charAt(0)))
                .forEach(line -> {
                    try {
                        String[] parts = line.split("\\s+");
                        if (parts.length >= 2) {
                            String timestamp = parts[0];
                            String value = parts[1];
                            String date = timestamp.substring(0, 10); // Extract "YYYY-MM-DD"

                            valuesByDate.computeIfAbsent(date, k -> new ArrayList<>()).add(value);
                        }
                    } catch (Exception e) {
                        System.err.println("Could not parse line: " + line);
                    }
                });


        StringBuilder csvContent = new StringBuilder("Date,Values\n");
        for (Map.Entry<String, List<String>> entry : valuesByDate.entrySet()) {
            csvContent.append(entry.getKey())
                    .append(",")
                    .append(String.join(";", entry.getValue())) // Join values with a semicolon
                    .append("\n");
        }

        try {
            Files.writeString(Paths.get("output.csv"), csvContent.toString());
            return "Successfully created output.csv with data grouped by date.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error writing to CSV file: " + e.getMessage();
        }
    }
}
