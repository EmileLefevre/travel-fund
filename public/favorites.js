import { loadNavbar } from "./module/navbar.js";
loadNavbar()

const userName = localStorage.getItem("userName");
const content = document.createElement("div");
document.body.appendChild(content);

if (!userName) {
    content.innerHTML = `<br>
        <h2 class="text-center">Veuillez vous connecter pour voir vos favoris</h2>
        <br>
        <div class="text-center">
            <a href="connection.html" class="btn btn-primary">Se connecter</a>
        </div>`;
} else {
    content.innerHTML = `<h2>Bienvenue ${userName}! Voici vos favoris :</h2><ul id="favoritesList"></ul>`;

    fetch(`http://localhost:3000/favorites?user_id=${encodeURIComponent(userName)}`)
        .then(response => {
            if (!response.ok) throw new Error("Erreur réseau");
            return response.json();
        })
        .then(data => {
            const favoritesList = document.getElementById("favoritesList");
            if (!favoritesList) {
                console.error("Erreur : L'élément #favoritesList est introuvable !");
                return;
            }
            favoritesList.innerHTML = ""; // je vide la liste avant d'ajouter les favoris
            if (data.length === 0) {
                favoritesList.innerHTML = "<p>Aucun favori enregistré.</p>";
            } else {
                data.forEach(fav => {
                    const li = document.createElement("li");
                    if (fav.mode == "DRIVING")
                        fav.mode = "en voiture";
                    else if (fav.mode == "WALKING")
                        fav.mode = "à pied";
                    else if (fav.mode == "BICYCLING")
                        fav.mode = "à vélo";
                    else if (fav.mode == "TRANSIT")
                        fav.mode = "en transport en commun";
                    li.textContent = `Pour aller de "${fav.start}" à "${fav.arrive}" ${fav.mode}, vous aurez besoin de ${fav.duration} pour effectuer les ${fav.distance}`;
                    favoritesList.appendChild(li);
                });
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des favoris :", error);
        });
}