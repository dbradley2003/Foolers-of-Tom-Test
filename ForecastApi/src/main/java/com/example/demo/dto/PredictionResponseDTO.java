package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PredictionResponseDTO {
    private RainPrediction rain_prediction;
    private TemperaturePrediction temperature_prediction;

    @Data
    public static class RainPrediction {
        private double probability;
        private String classification;
    }

    @Data
    public static class TemperaturePrediction {
        @JsonProperty("temperature_fahrenheit")
        private double temperatureFahrenheit;
    }
}
