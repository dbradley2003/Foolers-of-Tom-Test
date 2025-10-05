package com.example.demo.service.impl;

import com.example.demo.model.Forecast;
import com.example.demo.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class WeatherServiceImpl implements WeatherService {

    @Override
    public Forecast getForecast(String city) {
        return new Forecast("Sunny", 25.0);
    }


}
