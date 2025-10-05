import logging
import azure.functions as func
import joblib
import requests
import io
import pandas as pd
from datetime import datetime
import json

# URLs to your hosted models on Azure Blob Storage
RAIN_MODEL_URL = "https://spaceapps.blob.core.windows.net/pklfile/rain_model.pkl"
TEMP_MODEL_URL = "https://spaceapps.blob.core.windows.net/pklfile/random_forest_regressor_model.pkl"

def load_model(url):
    logging.info(f"Loading model from: {url}")
    response = requests.get(url)
    response.raise_for_status()
    return joblib.load(io.BytesIO(response.content))

# Load models on cold start
rain_model = load_model(RAIN_MODEL_URL)
temp_model = load_model(TEMP_MODEL_URL)
logging.info("Models loaded successfully.")

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        req_body = req.get_json()
        date_str = req_body.get('date')
        lat = float(req_body.get('lat'))
        lon = float(req_body.get('lon'))
    except (ValueError, TypeError) as e:
        return func.HttpResponse(
             "Please pass date, lat, and lon in the request body",
             status_code=400
        )

    # Parse date components
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    month = dt.month
    day = dt.day
    year = dt.year
    day_of_week = dt.weekday()

    # Prepare data for models
    X_temp = pd.DataFrame([[lat, lon, month, day, year, day_of_week]],
                          columns=['latitude', 'longitude', 'year', 'month', 'day', 'day_of_week'])
    X_rain = pd.DataFrame([[lat, lon, month]], columns=['lat', 'lon', 'month'])

    # Run predictions
    rain_prob = rain_model.predict_proba(X_rain)[0][1]
    rain_label = rain_model.predict(X_rain)[0]
    temp_pred = temp_model.predict(X_temp)[0]

    # Create response
    results = {
        'rain_prediction': {
            'probability': round(rain_prob, 3),
            'classification': 'rainy' if rain_label == 1 else 'not rainy'
        },
        'temperature_prediction': {
            'temperature_fahrenheit': round(temp_pred, 2)
        }
    }

    return func.HttpResponse(
        json.dumps(results),
        mimetype="application/json",
        status_code=200
    )
