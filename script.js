// *** BACKEND INTEGRATION NOTES ***
// selectedPlace contains the user's selected location data: { name: string, lat: number, lng: number }
// This is set when user selects a place from the autocomplete dropdown

let selectedPlace = null; //  { name, lat, lng } after a selection

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

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (!pos || !selectedPlace) return;
      selectedPlace.lat = pos.lat();
      selectedPlace.lng = pos.lng();
      console.log('Updated place after drag:', selectedPlace);
      renderPlaceJSON(selectedPlace);
    });

    // checkBtn.addEventListener("click", () => {
    //   if (!selectedPlace) return;
    //   statusEl.textContent = `OK! Using ${selectedPlace.name} (${selectedPlace.lat.toFixed(5)}, ${selectedPlace.lng.toFixed(5)}) on ${dateEl.value}`;
    // });
  })
  .catch(err => {
    console.error("Google Maps loader error:", err);
    statusEl.textContent = "Failed to load Google Maps.";
  });
}

boot();

window.getSelectedPlace = () => selectedPlace;

const contentWrapper = document.getElementById("content-wrapper");
let weatherSquare = null;

checkBtn.addEventListener("click", () => {
  // *** BACKEND INTEGRATION POINT ***
  // This is where you should make your call to get weather data
  // You have access to:
  // selectedPlace: { name, lat, lng } - the user's selected location
  // dateEl.value - the selected date from the date picker

 
  
  // Create the weather square when button is clicked
  showWeatherCard({ temperature: 20, description: "Sunny" });
});

function showWeatherCard(mockData) {
  // *** BACKEND INTEGRATION FUNCTION ***
  // This function displays the weather data in a card format
  // Replace mockData parameter with your actual weather API response
  // Expected data structure: { temperature: number, description: string }
 

  if (weatherSquare) {
    return;
  }

  const w = mockData; // *** Replace this with your the actual weather response data ***
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

  // Determine weather class based on description
  let weatherClass = 'clear'; // default
  if (desc === "Rain") {
    weatherClass = 'rain';
  } else if (desc === "Snow") {
    weatherClass = 'snow';
  } else if (desc === "Clear") {
    weatherClass = 'clear';
  }

  // Create the square element
  weatherSquare = document.createElement('div');
  weatherSquare.className = `weather-square ${weatherClass}`;
  
  // Add extra elements for rain and snow effects
  let extraElements = '';
  if (weatherClass === 'rain') {
    extraElements = '<div class="raindrop-1"></div><div class="raindrop-2"></div><div class="raindrop-3"></div><div class="raindrop-4"></div><div class="raindrop-5"></div><div class="raindrop-6"></div><div class="raindrop-7"></div><div class="raindrop-8"></div>';
  } else if (weatherClass === 'snow') {
    extraElements = '<div class="snowflake-1"></div><div class="snowflake-2"></div><div class="snowflake-3"></div><div class="snowflake-4"></div><div class="snowflake-5"></div><div class="snowflake-6"></div><div class="snowflake-7"></div><div class="snowflake-8"></div><div class="snowflake-9"></div><div class="snowflake-10"></div>';
  }
  
  weatherSquare.innerHTML = `
    <h3>${title}</h3>
    <div class="temp">${temp}°C</div>
    <div class="desc">${desc}</div>
    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">${niceDate}</div>
    ${extraElements}
  `;

  // Add the square to the content wrapper
  contentWrapper.appendChild(weatherSquare);
  
  // Add class to change flexbox behavior (moves main container to left)
  contentWrapper.classList.add('has-square');
}

