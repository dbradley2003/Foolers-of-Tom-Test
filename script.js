// *** BACKEND INTEGRATION NOTES ***
// selectedPlace contains the user's selected location data: { name: string, lat: number, lng: number }
// This is set when user selects a place from the autocomplete dropdown
// Use this data to make your API calls to get weather information

let selectedPlace = null; // always { name, lat, lng } after a selection

let hasPlace = false;
let map, marker;

const dateEl   = document.getElementById("pick-date");
const checkBtn = document.getElementById("check");
const statusEl = document.getElementById("status");
const placeJsonEl = document.getElementById("place-json");

function updateCheck() {
  checkBtn.disabled = !(hasPlace && dateEl.value);
}
dateEl.addEventListener("change", updateCheck);
updateCheck(); // start disabled

function renderPlaceJSON(obj) {
  if (!placeJsonEl) return;
  placeJsonEl.textContent = JSON.stringify(obj ?? selectedPlace, null, 2);
}


function boot() {
  Promise.all([
    google.maps.importLibrary("places"),
    google.maps.importLibrary("maps"),
  ])
  .then(([/*places*/, mapsNS]) => {

    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
    document.getElementById("place-container").appendChild(placeAutocomplete);

    // 2) Map + classic marker 
    map = new mapsNS.Map(document.getElementById("map"), {
      center: { lat: 41.8781, lng: -87.6298 },  // Chicago
      zoom: 12,
      disableDefaultUI: true
    });

    marker = new google.maps.Marker({
      map,
      position: { lat: 41.8781, lng: -87.6298 },
      draggable: true,
      title: "Selected location"
    });

    // 3) Selection handler -> build selectedPlace object, move map, enable button
    placeAutocomplete.addEventListener("gmp-select", (ev) => {
      const place = ev.place || (ev.placePrediction?.toPlace && ev.placePrediction.toPlace());
      if (!place) return;

      const ensureLoc = place.fetchFields
        ? place.fetchFields({ fields: ["displayName","formattedAddress","location"] })
        : Promise.resolve();

      ensureLoc.then(() => {
        if (!place.location) return;

        const lat = typeof place.location.lat === "function" ? place.location.lat() : place.location.lat;
        const lng = typeof place.location.lng === "function" ? place.location.lng() : place.location.lng;
        const name = place.displayName || place.formattedAddress || "Selected place";

      
        selectedPlace = { name, lat, lng };
        console.log('Selected place:', selectedPlace);
        hasPlace = true;
        updateCheck();


        map.setCenter({ lat, lng });
        map.setZoom(13);
        marker.setPosition({ lat, lng });


        renderPlaceJSON(selectedPlace);
        statusEl.textContent = "";
      }).catch(err => console.error("fetchFields error:", err));
    });

    // If user drags the marker, keep selectedPlace in sync
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (!pos || !selectedPlace) return;
      selectedPlace.lat = pos.lat();
      selectedPlace.lng = pos.lng();
      console.log('Updated place after drag:', selectedPlace);
      renderPlaceJSON(selectedPlace);
    });

    // Button click demo: shows it’s reading from selectedPlace
    checkBtn.addEventListener("click", () => {
      if (!selectedPlace) return;
      statusEl.textContent = `OK! Using ${selectedPlace.name} (${selectedPlace.lat.toFixed(5)}, ${selectedPlace.lng.toFixed(5)}) on ${dateEl.value}`;
    });
  })
  .catch(err => {
    console.error("Google Maps loader error:", err);
    statusEl.textContent = "Failed to load Google Maps.";
  });
}

boot();

window.getSelectedPlace = () => selectedPlace;

// console.log(selectedPlace) // This was logging null at startup
const contentWrapper = document.getElementById("content-wrapper");
let weatherSquare = null;

checkBtn.addEventListener("click", () => {
  // *** BACKEND INTEGRATION POINT ***
  // This is where you should make your API call to get weather data
  // You have access to:
  // - selectedPlace: { name, lat, lng } - the user's selected location
  // - dateEl.value - the selected date from the date picker
  // 
  // Example API call structure:
  // const weatherData = await fetchWeatherData(selectedPlace.lat, selectedPlace.lng, dateEl.value);
  // showWeatherCard(weatherData);
  
  // Create the weather square when button is clicked
  showWeatherCard({ temperature: 20, description: "Sunny" });
});

function showWeatherCard(mockData) {
  // *** BACKEND INTEGRATION FUNCTION ***
  // This function displays the weather data in a card format
  // Replace mockData parameter with your actual weather API response
  // Expected data structure: { temperature: number, description: string }
  // You can add more fields like humidity, wind speed, etc. as needed
  
  // Check if square already exists
  if (weatherSquare) {
    return; // Don't create multiple squares
  }

  const w = mockData; // *** Replace this with your API response data ***
  const temp = (w.temperature ?? "—");
  const desc = (w.description ?? "—");

  const niceDate = new Date(dateEl.value).toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" }
  );
  
  // *** BACKEND INTEGRATION NOTE ***
  // selectedPlace.name contains the location name for display
  // selectedPlace.lat and selectedPlace.lng contain coordinates for API calls
  const title = selectedPlace?.name || "Selected place";
  
  console.log('Creating square with selectedPlace:', selectedPlace);
  console.log('Title will be:', title);

  // Create the square element
  weatherSquare = document.createElement('div');
  weatherSquare.className = 'weather-square';
  weatherSquare.innerHTML = `
    <h3>${title}</h3>
    <div class="temp">${temp}°C</div>
    <div class="desc">${desc}</div>
    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">${niceDate}</div>
  `;

  // Add the square to the content wrapper
  contentWrapper.appendChild(weatherSquare);
  
  // Add class to change flexbox behavior (moves main container to left)
  contentWrapper.classList.add('has-square');
}

