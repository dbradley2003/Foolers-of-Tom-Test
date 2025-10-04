package com.example.demo.service;

import com.example.demo.model.Forecast;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@RequiredArgsConstructor
@Service
public class WeatherService {

    public Forecast getForecast(String city) {
        return new Forecast("Sunny", 25.0);
    }



}
