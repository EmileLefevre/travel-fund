// Fonction pour charger la navbar depuis navbar.html
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
// Fonction pour charger et initialiser Google Maps
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

// Fonction d'initialisation de la carte Google Maps
let map, marker, geocoder, autocomplete;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
        zoom: 12,
    });

    geocoder = new google.maps.Geocoder();

    marker = new google.maps.Marker({
        position: { lat: 48.8566, lng: 2.3522 },
        map: map,
        title: "Cliquez pour déplacer",
    });

    google.maps.event.addListener(marker, 'position_changed', function () {
        geocodePosition(marker.position);
    });

    const input = document.getElementById("adresse");
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", map);

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            alert("Aucun détail disponible pour l'adresse saisie.");
            return;
        }

        map.setCenter(place.geometry.location);
        map.setZoom(15);
        marker.setPosition(place.geometry.location);
    });

    google.maps.event.addListener(map, "click", (event) => {
        const position = event.latLng;
        marker.setPosition(position);
        geocodePosition(position);
    });
}

// Fonction pour géocoder une position
function geocodePosition(position) {
    geocoder.geocode({ location: position }, (results, status) => {
        if (status === "OK" && results[0]) {
            document.getElementById("adresse").value = results[0].formatted_address;
        } else {
            alert("Impossible de trouver une adresse pour cette position.");
        }
    });
}

// Fonction principale pour initialiser la page
function init() {
    loadNavbar();
    loadGoogleMapsAPI();
}

// Appel de la fonction d'initialisation
init();
