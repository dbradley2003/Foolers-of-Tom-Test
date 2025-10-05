package com.example.demo.service.impl;

import com.example.demo.dto.PredictionRequestDTO;
import com.example.demo.dto.PredictionResponseDTO;
import com.example.demo.model.Forecast;
import com.example.demo.service.WeatherService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class WeatherServiceImpl implements WeatherService {

    private final RestClient restClient;

    public WeatherServiceImpl(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://foolersoftom-modelapi.azurewebsites.net")
                .build();
    }

    @Override
    public Forecast getForecast(String date, double lat, double lon) {
        PredictionRequestDTO requestDTO = new PredictionRequestDTO(date, lat, lon);

        PredictionResponseDTO response = restClient.post()
                .uri("/api/predict")
                .body(requestDTO)
                .retrieve()
                .body(PredictionResponseDTO.class);

        if (response != null) {
            String description = response.getRain_prediction().getClassification();
            double temperature = response.getTemperature_prediction().getTemperatureFahrenheit();
            return new Forecast(description, temperature);
        }

        return new Forecast("Error fetching prediction", 0);
    }
}
