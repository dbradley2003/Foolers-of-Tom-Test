package com.example.demo.functions;

import com.example.demo.model.Forecast;
import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.function.adapter.azure.FunctionInvoker;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ForecastHandler {

    @Autowired
    private ForecastFunction forecastFunction;

    @FunctionName("forecast")
    public HttpResponseMessage execute(
            @HttpTrigger(name = "req",
                         methods = {HttpMethod.GET},
                         authLevel = AuthorizationLevel.ANONYMOUS)
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        final String city = request.getQueryParameters().get("city");

        if (city == null) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Please provide a 'city' on the query string.").build();
        }

        // The FunctionInvoker will call the 'forecast' bean and return the result
        final Forecast forecast = forecastFunction.apply(city);

        // Manually build the HTTP response with the result
        return request.createResponseBuilder(HttpStatus.OK)
                .header("Content-Type", "application/json")
                .body(forecast)
                .build();
    }
}
