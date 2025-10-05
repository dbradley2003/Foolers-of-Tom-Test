package com.example.demo.functions;

import com.example.demo.model.Forecast;
import com.example.demo.service.WeatherService;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component("forecast")
public class ForecastFunction implements Function<String, Forecast> {

    private final WeatherService weatherService;

    public ForecastFunction(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @Override
    public Forecast apply(String city) {
        return weatherService.getForecast(city);
    }
}
