package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ForecastQueryDTO {
    private String date;
    private double lat;
    private double lon;
}
