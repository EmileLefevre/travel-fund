document.addEventListener('DOMContentLoaded', () => {
    function checkLoginStatus() {
        const authLink = document.getElementById('auth-link');
        if (!authLink) {
            console.error("Élément 'auth-link' introuvable.");
            return;
        }

        const userName = localStorage.getItem('userName');
        if (userName) {
            authLink.textContent = `Se déconnecter (${userName})`;
            authLink.href = '#';

            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                const confirmDeconnexion = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
                console.log("Confirmation déconnexion:", confirmDeconnexion);

                if (confirmDeconnexion) {
                    console.log("Déconnexion confirmée");
                    localStorage.removeItem('userName');
                    localStorage.removeItem('sessionId');
                    alert('Déconnexion effectuée');
                    window.location.reload();
                } else {
                    console.log("Déconnexion annulée");
                }
            });
        } else {
            authLink.textContent = 'Se connecter';
            authLink.href = 'connection.html';
        }
    }
    const navbarCheckInterval = setInterval(() => {
        const authLink = document.getElementById('auth-link');
        if (authLink) {
            clearInterval(navbarCheckInterval);
            checkLoginStatus();
        }
    }, 100);
});
