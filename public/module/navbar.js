
function loadNavbar() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;

            const authLink = document.getElementById('auth-link');

            const commentSection = document.getElementById('comment-section');
        
            // if (!authLink) {
            //     console.error("Élément 'auth-link' introuvable.");
            //     return;
            // }
        
            const userName = localStorage.getItem('userName');
            console.log("Nom d'utilisateur:", userName);
            if (userName) {
                authLink.textContent = `Se déconnecter (${userName})`;
                authLink.href = '#';
                commentSection.classList.add("show")
                commentSection.classList.remove("hidden")
                authLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log("Clique sur le lien de déconnexion");
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
                commentSection.classList.remove("show")
                commentSection.classList.add("hidden")
            }
        
           
        })
        .catch(error => console.error('Erreur lors du chargement de la barre de navigation :', error));
}


export {loadNavbar}