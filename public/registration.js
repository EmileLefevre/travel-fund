function loadNavbar() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
        })
        .catch(error => console.error('Erreur lors du chargement de la barre de navigation :', error));
}

var modal = document.getElementById("termsModal");
var btn = document.getElementById("termsLink");
var span = document.getElementsByClassName("close")[0];
var termsContent = document.getElementById("termsContent");

btn.onclick = function(event) {
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
    if (!termsCheckbox.checked) {
        alert("Vous devez accepter les conditions générales d'utilisation pour vous inscrire.");
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
            alert("Inscription réussie !");
        } else {
            alert(result.message || "Une erreur est survenue.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
});

function init() {
    loadNavbar();
}

init();
