import { loadNavbar } from "./module/navbar.js";
import { loadFooter } from "./module/footer.js";
loadFooter();
loadNavbar()
var modal = document.getElementById("termsModal");
var termBtn = document.getElementById("termsLink");
var policyBtn = document.getElementById("policyLink");
var span = document.getElementsByClassName("close")[0];
var termsContent = document.getElementById("termsContent");

termBtn.onclick = function(event) {
    event.preventDefault(); 
    
    fetch("condition.html")
        .then(response => response.text())
        .then(data => {
            termsContent.innerHTML = data;
            modal.style.display = "flex";
        })
        .catch(error => {
            console.error("Erreur lors du chargement des conditions :", error);
        });
}

policyBtn.onclick = function(event) {
    event.preventDefault(); 
    
    fetch("policy.html")
        .then(response => response.text())
        .then(data => {
            termsContent.innerHTML = data;
            modal.style.display = "flex";
        })
        .catch(error => {
            console.error("Erreur lors du chargement des conditions :", error);
        });
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById("registrationForm").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const termsCheckbox = document.getElementById("terms");
    const policyCheckbox = document.getElementById("policy");
    if (!termsCheckbox.checked) {
        alert("Vous devez accepter les conditions générales d'utilisation pour vous inscrire.");
        return;
    }
    if (!policyCheckbox.checked) {
        alert("Vous devez accepter la politique de confidentialié pour vous inscrire.");
        return;
    }
    const formData = new FormData(event.target);
    const data = {
        name: formData.get("name"),
        username: formData.get("username"),
        mail: formData.get("mail"),
        addresse: formData.get("addresse"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword")
    };

    if (data.password !== data.confirmPassword) {
        return alert("Les mots de passe ne correspondent pas.");
    }

    try {
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
            window.location.href = 'connection.html?status=logged_in';
        } else {
            alert(result.message || "Une erreur est survenue.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
});


