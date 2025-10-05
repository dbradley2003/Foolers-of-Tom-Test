package com.example.demo.controller;

import com.example.demo.model.Forecast;
import com.example.demo.service.impl.AsciiParsingServiceImpl;
import com.example.demo.service.impl.WeatherServiceImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WeatherController {

    private final WeatherServiceImpl weatherServiceImpl;
    private final AsciiParsingServiceImpl asciiParsingServiceImpl;

    public WeatherController(WeatherServiceImpl weatherServiceImpl, AsciiParsingServiceImpl asciiParsingServiceImpl) {
        this.weatherServiceImpl = weatherServiceImpl;
        this.asciiParsingServiceImpl = asciiParsingServiceImpl;
    }

    @GetMapping("/forecast")
    public Forecast getForecast(@RequestParam String city) {
        return weatherServiceImpl.getForecast(city);
    }


    @GetMapping("/parse-ascii")
    public String parseAscii() {
        String res = asciiParsingServiceImpl.parseAsciiResponse("csv",10);
        return "Time series parsing initiated.";
    }
}
