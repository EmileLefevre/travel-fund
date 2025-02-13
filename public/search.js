const slider = document.getElementById("rayon");
const sliderValue = document.getElementById("rayonValue");
let directionsService, directionsRenderer;
let map, marker, geocoder, placesService, circle;
let markersArray = [];
let infoWindow
let userLocation = null;
const userName = localStorage.getItem('userName');

function loadGoogleMapsAPI() {
    fetch('/api/google-maps-key')
        .then(response => response.json())
        .then(data => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&callback=initMap&libraries=places,marker&v=beta`;
            script.async = true;
            document.head.appendChild(script);
        })
        .catch(error => {
            console.error('Erreur lors du chargement de la clé API :', error);
            alert('Impossible de charger la carte. Veuillez réessayer plus tard.');
        });
}

function updateCircle(position, radius) {
    if (circle) {
        circle.setMap(null);
    }
    circle = new google.maps.Circle({
        center: position,
        radius: radius,
        map: map,
        fillColor: "#3498db",
        fillOpacity: 0.1,
        strokeColor: "#2980b9",
        strokeOpacity: 0.8,
        strokeWeight: 2
    });
}

function addFavorite(mode, duration, distance, start, arrive) {
    const favoriteData = {
        user_id: userName,
        mode: mode,
        duration: duration,
        distance: distance,
        start: start,
        arrive: arrive
    };
    console.log(favoriteData);
    fetch('/addFavorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(favoriteData)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Favori ajouté avec succès', data);
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout du favori:', error);
        });
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 48.8566, lng: 2.3522 }, // Par defaut la carte se met sur paris si il ne touve pas ma loc
        zoom: 12,
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    geocoder = new google.maps.Geocoder();
    placesService = new google.maps.places.PlacesService(map);
    marker = new google.maps.Marker({
        position: { lat: 48.8566, lng: 2.3522 },
        map: map,
        title: "Votre position",
        draggable: true,
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/bus.png",
            size: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 40)
        }
    });
    updateCircle(marker.getPosition(), slider.value * 1000);
    slider.addEventListener("input", function () {
        sliderValue.textContent = slider.value;
        updateCircle(marker.getPosition(), slider.value * 1000);
    });
    // Mise à jour de userLocation à chaque changement de position du marqueur
    userLocation = marker.getPosition();
    marker.addListener("dragend", function () {
        userLocation = marker.getPosition(); // MAJ de userLocation
        updateCircle(userLocation, slider.value * 1000); // MAJ du cercle
    });
    google.maps.event.addListener(map, "click", (event) => {
        const markerConfirm = window.confirm("Êtes-vous sûr de vouloir déplacer le marqueur ici ?");
        if (markerConfirm) {
            marker.setPosition(event.latLng);
            updateCircle(event.latLng, slider.value * 1000);
        } else {
            console.log("Déplacement du marqueur annulé.");
        }
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude, //trouve ma loc
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation); // Centrer la carte
                map.setZoom(11);
                marker.setPosition(userLocation); // MAJ position du marqueur
                updateCircle(userLocation, slider.value * 1000); // MAJ du cercle
            },
            () => alert("Géolocalisation refusée. Veuillez déplacer le marqueur.")
        );
    } else {
        alert("Votre navigateur ne supporte pas la géolocalisation. Veuillez déplacer le marqueur.");
    }
    document.getElementById("searchForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const categorie = document.getElementById("categorie").value;
        let rayon = parseInt(document.getElementById("rayon").value, 10);
        rayon *= 1000;
        const position = marker.getPosition();
        if (categorie === "Default") {
            alert("Veuillez sélectionner une catégorie.");
            return;
        }
        const categoriesMap = {
            "Restaurant": "restaurant",
            "Hotel": "lodging", // nom des lieux avec google places
            "Parc": "park",
            "Bar": "bar",
            "Parking": "parking"
        };
        searchPlaces(position, categoriesMap[categorie], rayon);
    });
}

function searchPlaces(position, type, radius) {
    clearMarkers();
    const request = {
        location: position,
        radius: radius,
        type: type
    };
    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => {
                const placeMarker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                        size: new google.maps.Size(40, 40),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(20, 40)
                    }
                });
                markersArray.push(placeMarker);
                let photoUrl = "";
                if (place.photos && place.photos.length > 0) {
                    photoUrl = place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 });
                } else {
                    photoUrl = "https://via.placeholder.com/200?text=Aucune+image"; // image par défaut
                }
                infoWindow = new google.maps.InfoWindow({ //afficher les infos au click
                    content: `
                        <div>
                            <strong>${place.name}</strong><br>
                            ${place.vicinity}<br> 
                            <img src="${photoUrl}" alt="Photo de ${place.name}" style="width: 100%; max-width: 200px; border-radius: 8px; margin-top: 5px;">
                            <br>
                            ${place.website
                            ? `<a href="${place.website}" target="_blank">Visiter le site</a>`
                            : `<a href="https://www.google.com/maps/place/?q=place_id:${place.place_id}" target="_blank">Voir sur Google Maps</a>`}
                            <br><br>
                            <label for="transportMode">Mode de transport :</label>
                            <select id="transportMode">
                                <option value="DRIVING">🚗 Voiture</option>
                                <option value="WALKING">🚶‍♂️ Marche</option>
                                <option value="BICYCLING">🚴 Vélo</option>
                                <option value="TRANSIT">🚌 Transport en commun</option>
                            </select>
                            <br><br>
                            <button onclick="calculateRoute('${place.geometry.location.lat()}', '${place.geometry.location.lng()}')">Itinéraire</button>
                        </div>
                    `
                });
                placeMarker.addListener("click", () => {
                    selectedDestination = place.geometry.location;
                    infoWindow.open(map, placeMarker);
                });
            });
        } else {
            alert("Aucun résultat trouvé.");
        }
    });
}

function calculateRoute(destLat, destLng) {
    const mode = document.getElementById('transportMode').value; // Récupère le mode de transport
    const transportModes = {
        "DRIVING": "En Voiture",
        "WALKING": "À Pied",
        "BICYCLING": "En Vélo",
        "TRANSIT": "En Transport en commun"
    };
    if (!userLocation) {
        alert("Position utilisateur inconnue.");
        return;
    }
    if (!selectedDestination) {
        selectedDestination = new google.maps.LatLng(destLat, destLng); // Crée un Lat/Lng si non défini
    }
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'location': userLocation }, function (results, status) {
        if (status === 'OK' && results[0]) {
            const userAddress = results[0].formatted_address;
            // Calcul de l'itinéraire
            directionsService.route({
                origin: userLocation,
                destination: selectedDestination,
                travelMode: google.maps.TravelMode[mode],
            }, (response, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(response);
                    const duration = response.routes[0].legs[0].duration.text;
                    const distance = response.routes[0].legs[0].distance.text;
                    const start = userAddress;
                    geocoder.geocode({ 'location': selectedDestination }, function (results, status) {
                        if (status === 'OK' && results[0]) {
                            const arrive = results[0].formatted_address;
                            console.log("arrive : ", arrive);
                            document.getElementById("durationDisplay").innerHTML = transportModes[mode] + ":" + "<br>" + `Temps: ${duration}` + "<br>" + "Distance: " + distance;
                            document.getElementById("durationDisplay").innerHTML += `<br> Ajouter ce trajet aux favoris
                                                                    <span id="favoriteStar" class="favorite-star">&#9734;</span>`;
                            if (userName) {
                                document.getElementById("favoriteStar").addEventListener("click", function () {
                                    this.classList.toggle("filled");
                                    if (this.classList.contains("filled")) {
                                        document.getElementById("durationDisplay").innerHTML += "<br> Trajet ajouté aux favoris";
                                        addFavorite(mode, duration, distance, start, arrive);
                                    } else {
                                        document.getElementById("durationDisplay").innerHTML += "<br> Trajet retiré des favoris";
                                    }
                                });
                            }
                        } else {
                            alert("Impossible de récupérer l'adresse de la destination.");
                        }
                    });
                } else {
                    alert("Impossible de calculer l'itinéraire.");
                }
            });
        } else {
            console.log("Impossible de récupérer l'adresse utilisateur.");
        }
    });

    if (infoWindow) {
        infoWindow.close();
    }
}

function clearMarkers() {
    markersArray.forEach(marker => marker.setMap(null));
    markersArray = [];
}

function geocodePosition(position) {
    geocoder.geocode({ location: position }, (results, status) => {
        if (status === "OK" && results[0]) {
            document.getElementById("adresse").value = results[0].formatted_address;
        } else {
            alert("Impossible de trouver une adresse pour cette position.");
        }
    });
}

function init() {
    loadGoogleMapsAPI();
}
init();
