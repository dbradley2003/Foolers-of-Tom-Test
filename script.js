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