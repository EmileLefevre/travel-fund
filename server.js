const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@googlemaps/google-maps-services-js');
const path = require('path');
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const session = require('express-session'); 
require('dotenv').config();
let userSessions = {};
const app = express();
const googleMapsClient = new Client({});
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
app.use(cookieParser());
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "travel_found",
    port: 8889,
});
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'votre_clé_secrète',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    const sessionId = req.cookies.authToken;

    if (sessionId && userSessions[sessionId]) {
        req.user = userSessions[sessionId];
    }
    next();
});

db.connect((err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données :", err);
        process.exit(1);
    } else {
        console.log("Connecté à la base de données MySQL");
    }
});

app.post('/addFavorite', (req, res) => {
    const { user_id, mode, duration, distance } = req.body;

    if (!user_id || !mode || !duration || !distance) {
        return res.status(400).json({ error: "Données manquantes" });
    }
    const sql = "INSERT INTO favoris (user_id, mode, duration, distance) VALUES (?, ?, ?, ?)";
    db.query(sql, [user_id, mode, duration, distance], (err, result) => {
        if (err) {
            console.error("Erreur SQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json({ success: true, message: "Favori ajouté !" });
    });
});


app.get('/favorites', (req, res) => {
    const userId = req.query.user_id;  // Récupère user_id de la query string
    console.log("Paramètre user_id reçu :", userId); // Affiche user_id pour debug

    if (!userId) {
        return res.status(400).json({ error: "ID utilisateur requis" });
    }

    // Effectue la requête pour récupérer les favoris de l'utilisateur
    const sql = 'SELECT mode, duration, distance FROM favoris WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des favoris" });
        }
        res.json(results); // Renvoie les favoris en format JSON
    });
});


app.post("/register", async (req, res) => {
    const { username, name, mail, addresse, password } = req.body;

    if (!username || !name || !mail || !addresse || !password) {
        return res.status(400).json({ success: false, message: "Champs manquants." });
    }

    try {
        const query = "SELECT * FROM users WHERE username = ?";
        db.query(query, [username], async (err, results) => {
            if (err) {
                console.error("Erreur lors de la requête :", err);
                return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
            }

            if (results.length > 0) {
                return res.status(400).json({ success: false, message: "Nom d'utilisateur déjà pris." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = "INSERT INTO users (username, name, mail, addresse, password) VALUES (?, ?, ?, ?, ?)";
            db.query(insertQuery, [username, name, mail, addresse, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Erreur lors de l'insertion :", err);
                    return res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement." });
                }
                res.status(201).json({ success: true, message: "Utilisateur enregistré avec succès !" });
            });
        });
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).json({ success: false, message: "Erreur interne." });
    }
});


app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Champs manquants." });
    }

    try {
        const query = "SELECT * FROM users WHERE username = ?";
        db.query(query, [username], async (err, results) => {
            if (err) {
                console.error("Erreur lors de la requête :", err);
                return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
            }

            if (results.length === 0) {
                return res.status(401).json({ success: false, message: "Utilisateur introuvable." });
            }

            const user = results[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
            }

            const sessionId = 'some_unique_token'; 
            userSessions[sessionId] = { username: user.username, name: user.name };

            res.cookie('authToken', sessionId, { httpOnly: true, secure: false, maxAge: 3600000 }); 

            res.json({
                success: true,
                message: "Connexion réussie !",
                sessionId: sessionId,
                name: user.name 
            });
        });
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).json({ success: false, message: "Erreur interne." });
    }
});


app.post("/logout", (req, res) => {
    res.clearCookie('authToken');

    res.json({ success: true, message: "Déconnexion réussie !" });
});

app.get("/check-login", (req, res) => {
    const sessionId = req.cookies.authToken; 
    if (sessionId && userSessions[sessionId]) {
        res.json({ loggedIn: true, username: userSessions[sessionId].username, name: userSessions[sessionId].name });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/get-user-name', (req, res) => {
    if (req.session.user) {
        res.json({ name: req.session.user.name });
    } else {
        res.json({ name: null });
    }
});

app.get('/api/google-maps-key', (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ error: 'Clé API Google Maps non configurée.' });
    }
    res.json({ apiKey: API_KEY });
});

app.post('/search', async (req, res) => {
    const { date, heure, adresse } = req.body;

    if (!date || !heure || !adresse) {
        return res.status(400).json({ error: 'Veuillez fournir une date, une heure et une adresse.' });
    }

    try {
        const geoResponse = await googleMapsClient.geocode({
            params: {
                address: adresse,
                key: API_KEY,
            },
        });

        const results = geoResponse.data.results;
        const coordinates = results[0].geometry.location;

        res.status(201).json({
            message: 'recherche effectué avec succès !',
            date,
            heure,
            adresse,
            coordinates,
        });
    } catch (error) {
        console.error('Erreur lors de la géolocalisation :', error.message);
        res.status(500).json({ error: 'Erreur lors de la géolocalisation. Veuillez réessayer plus tard.' });
    }
});


app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

