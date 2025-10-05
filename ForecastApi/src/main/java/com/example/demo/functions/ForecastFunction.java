package com.example.demo.functions;

import com.example.demo.dto.ForecastQueryDTO;
import com.example.demo.model.Forecast;
import com.example.demo.service.WeatherService;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component("forecast")
public class ForecastFunction implements Function<ForecastQueryDTO, Forecast> {

    private final WeatherService weatherService;

    public ForecastFunction(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @Override
    public Forecast apply(ForecastQueryDTO forecastQuery) {
        String date = forecastQuery.getDate();
        double lat = forecastQuery.getLat();
        double lon = forecastQuery.getLon();
        return weatherService.getForecast(date, lat, lon);
    }
}
