document.addEventListener('DOMContentLoaded', () => {
    console.log("Page chargée, vérification de la navbar...");

    function checkLoginStatus() {
        const authLink = document.getElementById('auth-link');
        if (!authLink) {
            console.error("Élément 'auth-link' introuvable.");
            return;
        }

        const userName = localStorage.getItem('userName');
        console.log("Nom d'utilisateur:", userName);

        if (userName) {
            authLink.textContent = `Se déconnecter (${userName})`;
            authLink.href = '#'; // Pas de redirection ici, juste un lien ancré pour le click

            authLink.addEventListener('click', (e) => {
                e.preventDefault(); // Empêcher le comportement par défaut (navigation)
                console.log("Clique sur le lien de déconnexion");

                // Demander confirmation avant de déconnecter
                const confirmDeconnexion = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
                console.log("Confirmation déconnexion:", confirmDeconnexion);

                if (confirmDeconnexion) {
                    console.log("Déconnexion confirmée");
                    // Si l'utilisateur confirme, on déconnecte
                    localStorage.removeItem('userName');
                    localStorage.removeItem('sessionId');
                    alert('Déconnexion effectuée');
                    window.location.reload(); // Recharger la page pour mettre à jour l'interface
                } else {
                    console.log("Déconnexion annulée");
                }
            });
        } else {
            authLink.textContent = 'Se connecter';
            authLink.href = 'connection.html';
        }
    }

    // Vérifier si la navbar est chargée
    const navbarCheckInterval = setInterval(() => {
        const authLink = document.getElementById('auth-link');
        if (authLink) {
            clearInterval(navbarCheckInterval);
            checkLoginStatus();
        }
    }, 100);
});
