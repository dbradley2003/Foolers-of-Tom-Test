import joblib
import requests
import io
import pandas as pd
from datetime import datetime

# URLs to your hosted models on Azure Blob Storage
RAIN_MODEL_URL = "https://spaceapps.blob.core.windows.net/pklfile/rain_model.pkl"
TEMP_MODEL_URL = "https://spaceapps.blob.core.windows.net/pklfile/random_forest_regressor_model.pkl"


def load_model(url):
    print(f"🔄 Loading model from: {url}")
    response = requests.get(url)
    response.raise_for_status()
    return joblib.load(io.BytesIO(response.content))

# Load models
rain_model = load_model(RAIN_MODEL_URL)
temp_model = load_model(TEMP_MODEL_URL)
print("✅ Models loaded successfully.\n")

# Input date and location
date_str = "2025-07-15"
lat = 35.0
lon = -90.0

# Parse date components
dt = datetime.strptime(date_str, "%Y-%m-%d")
month = dt.month
day = dt.day
year = dt.year
day_of_week = dt.weekday()

# ✅ Match feature names AND order
X_temp = pd.DataFrame([[lat, lon, month, day, year, day_of_week]],
                      columns=['latitude', 'longitude', 'year', 'month', 'day', 'day_of_week'])

# ✅ Input for rain model (trained on lat, lon, month)
X_rain = pd.DataFrame([[lat, lon, month]], columns=['lat', 'lon', 'month'])

# ✅ Input for temperature model (trained on lat, lon, month, day, year)

# Run predictions
rain_prob = rain_model.predict_proba(X_rain)[0][1]
rain_label = rain_model.predict(X_rain)[0]
temp_pred = temp_model.predict(X_temp)[0]

# Display results
print("🌧️ Rain Prediction:")
print(f"Probability of rain: {round(rain_prob, 3)}")
print(f"Classification: {'rainy' if rain_label == 1 else 'not rainy'}")

print("\n🌡️ Temperature Prediction:")
print(f"Predicted temperature: {round(temp_pred, 2)} °F")