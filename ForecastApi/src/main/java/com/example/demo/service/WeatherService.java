package com.example.demo.service;

import com.example.demo.model.Date;
import com.example.demo.model.Forecast;

public interface WeatherService {

    Forecast getForecast(String city);
}
