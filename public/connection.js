import { loadNavbar } from "./module/navbar.js";
import { loadFooter } from "./module/footer.js";
loadFooter();
loadNavbar();
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêcher la soumission du formulaire par défaut
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('sessionId', data.sessionId);
            localStorage.setItem('userName', data.name);
            window.location.href = 'index.html?status=logged_in';
        } else {
            alert(data.message || "Erreur lors de la connexion.");
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
});