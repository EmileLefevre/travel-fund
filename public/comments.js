import { loadNavbar } from "./module/navbar.js";
import { loadFooter } from "./module/footer.js";


document.addEventListener('DOMContentLoaded', function () {
    loadNavbar()
    loadFooter();
    console.log("Page chargée, vérification des éléments...");

    function checkLoginStatus() {
        const authLink = document.getElementById('auth-link');
        const commentData = document.getElementById('comment-data');
        const commentForm = document.getElementById('comment-form');



        const userName = localStorage.getItem('userName');
        console.log("Nom d'utilisateur:", userName);

        if (userName) {
            

            // Показываем секцию комментариев и форму
            if (commentData && commentForm) {
                commentData.style.display = 'block';
                commentForm.style.display = 'block';
                loadComments();
            }
        } else {
            authLink.textContent = 'Se connecter';
            authLink.href = 'connection.html';

            // Скрываем секцию комментариев и форму
            if (commentData && commentForm) {
                commentData.style.display = 'none';
                commentForm.style.display = 'none';
            }
        }
    }

    function loadComments() {
        fetch("/get-comments")
            .then(response => response.json())
            .then(data => {
                const commentData = document.getElementById('comment-data');
                commentData.innerHTML = "";

                if (data && data.comments && Array.isArray(data.comments)) {
                    data.comments.forEach(comment => {
                        const commentElement = document.createElement("div");
                        commentElement.classList.add("comment", "mb-3");

                        const commentContent = `
                            <p><strong>${comment.author}</strong> a écrit :</p>
                            <p>${comment.text}</p>
                            <p><small>${new Date(comment.created_at).toLocaleString()}</small></p>
                        `;

                        commentElement.innerHTML = commentContent;

                        if (comment.image) {
                            const imageElement = document.createElement("img");
                            imageElement.src = comment.image;
                            imageElement.alt = "Image du commentaire";
                            imageElement.style.width = "100%";
                            imageElement.style.maxWidth = "200px";
                            imageElement.style.marginTop = "10px";
                            imageElement.style.borderRadius = "8px";
                            commentElement.appendChild(imageElement);
                        }

                        commentData.appendChild(commentElement);
                    });
                } else {
                    commentData.innerHTML = "<p>Aucun commentaire à afficher.</p>";
                }
            })
            .catch(error => {
                console.error("Erreur lors du chargement des commentaires:", error);
            });
    }

    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const commentText = document.getElementById('comment-text').value;
            const commentImage = document.getElementById('comment-image').files[0];

            if (!commentText) {
                alert("Veuillez entrer un commentaire.");
                return;
            }

            const formData = new FormData();
            formData.append("commentText", commentText);

            if (commentImage) {
                formData.append("commentImage", commentImage);
            }

            fetch("/submit-comment", {
                method: "POST",
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Commentaire ajouté avec succès !");
                    loadComments();
                    commentForm.reset();
                } else {
                    alert("Erreur lors de l'ajout du commentaire.");
                }
            })
            .catch(error => {
                console.error("Erreur:", error);
                alert("Erreur lors de l'envoi du commentaire.");
            });
        });
    }

    checkLoginStatus();
});

  