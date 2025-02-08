function loadNavbar() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            updateNavbar();
        })
        .catch(error => console.error('Erreur lors du chargement de la barre de navigation :', error));
}

function updateNavbar() {
    const authLink = document.querySelector('#auth-link');
    if (authLink) {
        const userName = localStorage.getItem('userName');
        if (userName) {
            authLink.textContent = `Se déconnecter (${userName})`;
            authLink.href = '#';
            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userName');
                localStorage.removeItem('sessionId');
                window.location.reload();
            });
        } else {
            authLink.textContent = 'Se connecter';
            authLink.href = 'connection.html';
        }
    }
}

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


let map, marker, geocoder, placesService;
let markersArray = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 48.8566, lng: 2.3522 }, // Par defaut la carte se met sur paris si il ne touve pas ma loc
        zoom: 12,
    });

    geocoder = new google.maps.Geocoder();
    placesService = new google.maps.places.PlacesService(map);

    marker = new google.maps.Marker({
        position: { lat: 48.8566, lng: 2.3522 },
        map: map,
        title: "Votre position",
        draggable: true
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude, //trouve ma loc 
                    lng: position.coords.longitude
                };

                map.setCenter(userLocation);
                map.setZoom(14);
                marker.setPosition(userLocation);
            },
            () => alert("Géolocalisation refusée. Veuillez déplacer le marqueur.")
        );
    } else {
        alert("Votre navigateur ne supporte pas la géolocalisation. Veuillez déplacer le marqueur.");
    }

    google.maps.event.addListener(map, "click", (event) => {
        marker.setPosition(event.latLng); // Mettre le marqueur au clic
    });

    document.getElementById("searchForm").addEventListener("submit", (e) => {
        e.preventDefault(); 
        const categorie = document.getElementById("categorie").value;
        const rayon = parseInt(document.getElementById("rayon").value, 10);
        const position = marker.getPosition();

        if (categorie === "Default") {
            alert("Veuillez sélectionner une catégorie.");
            return;
        }

        const categoriesMap = {
            "Restaurant": "restaurant",
            "Hotel": "lodging", // nom des lieux avec google places
            "Parc": "park",
            "Bar": "bar"
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
                    title: place.name
                });

                markersArray.push(placeMarker);

                let photoUrl = "";
                if (place.photos && place.photos.length > 0) {
                    photoUrl = place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 });
                } else {
                    photoUrl = "https://via.placeholder.com/200?text=Aucune+image"; // image par défaut
                }

                const infoWindow = new google.maps.InfoWindow({ // avoir toutes les onfos au click 
                    content: `
                        <div>
                            <strong>${place.name}</strong><br>
                            ${place.vicinity}<br> 
                            <img src="${photoUrl}" alt="Photo de ${place.name}" style="width: 100%; max-width: 200px; border-radius: 8px; margin-top: 5px;">
                        </div>
                    `
                });

                placeMarker.addListener("click", () => {
                    infoWindow.open(map, placeMarker); // afficher les infos au click
                });
            });
        } else {
            alert("Aucun résultat trouvé.");
        }
    });
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
    loadNavbar();
    loadGoogleMapsAPI();
}

init();
