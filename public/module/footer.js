function loadFooter() {
    const footer = document.createElement("footer");
    footer.innerHTML = `
        <div style="background:#090909; color:#fff; padding: 20px; text-align: center;">
            <p>&copy; 2025 - Travel & Found | 
                <a href="#" id="footerTermsLink" style="color:#f2f2f2;">Conditions générales d'utilisation</a>
            </p>
        </div>`;
    document.body.appendChild(footer);
    // Vérifier si la modale existe déjà, sinon l'ajouter
    if (!document.getElementById("termsModal")) {
        const modal = document.createElement("div");
        modal.innerHTML = `
            <div id="termsModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <div id="termsContent">Chargement...</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const style = document.createElement("style");
        style.innerHTML = `
            .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
            .modal-content { background: white; margin: 10% auto; padding: 20px; width: 60%; }
            .close { float: right; font-size: 28px; cursor: pointer; }
        `;
        document.head.appendChild(style);
    }
    // Ajouter l'événement au lien dans le footer
    document.getElementById("footerTermsLink").addEventListener("click", function (event) {
        event.preventDefault();
        fetch("condition.html")
            .then(response => response.text())
            .then(data => {
                document.getElementById("termsContent").innerHTML = data;
                document.getElementById("termsModal").style.display = "block";
            })
            .catch(error => {
                document.getElementById("termsContent").innerHTML = "<p>Erreur de chargement.</p>";
                console.error("Erreur chargement CGU :", error);
            });
    });
    document.querySelector(".close").addEventListener("click", function () { //croix
        document.getElementById("termsModal").style.display = "none";
    });
    window.addEventListener("click", function (event) { //en dehors
        if (event.target == document.getElementById("termsModal")) {
            document.getElementById("termsModal").style.display = "none";
        }
    });
}
export { loadFooter };