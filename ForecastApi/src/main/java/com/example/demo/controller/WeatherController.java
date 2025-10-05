package com.example.demo.controller;

import com.example.demo.model.Forecast;
import com.example.demo.service.AsciiParsingService;
import com.example.demo.service.TimeSeriesService;
import com.example.demo.service.WeatherService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WeatherController {

    private final WeatherService weatherService;
    private final TimeSeriesService timeSeriesService;
    private final AsciiParsingService asciiParsingService;

    public WeatherController(WeatherService weatherService, TimeSeriesService timeSeriesService, AsciiParsingService asciiParsingService) {
        this.weatherService = weatherService;
        this.timeSeriesService = timeSeriesService;
        this.asciiParsingService = asciiParsingService;
    }

    @GetMapping("/forecast")
    public Forecast getForecast(@RequestParam String city) {
        return weatherService.getForecast(city);
    }

    @GetMapping("/process-timeseries")
    public String processTimeSeries() {
        timeSeriesService.processTimeSeriesData();
        return "Time series processing initiated.";
    }



    @GetMapping("/parse-ascii")
    public String parseAscii() {
        String asciiResponse = asciiParsingService.parseAsciiResponse("csv",10);
        return "ASCII parsing logic executed. Check application logs for output.";
    }
}
