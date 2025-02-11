// Fonction pour charger la navbar depuis navbar.html
import { loadNavbar } from "./module/navbar.js";
loadNavbar()
// Fonction pour gérer la soumission du formulaire
document.getElementById("registrationForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Empêche l'envoi classique du formulaire

    // Récupérer les valeurs du formulaire
    const formData = new FormData(event.target);
    const data = {
        name: formData.get("name"),
        username: formData.get("username"),
        mail: formData.get("mail"),
        addresse: formData.get("addresse"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword")
    };

    // Vérifier si les mots de passe sont identiques
    if (data.password !== data.confirmPassword) {
        return alert("Les mots de passe ne correspondent pas.");
    }

    try {
        // Envoyer les données au serveur via fetch (POST)
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: data.username,
                name: data.name,
                mail: data.mail,
                addresse: data.addresse,
                password: data.password
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Inscription réussie !");
        } else {
            alert(result.message || "Une erreur est survenue.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
});

