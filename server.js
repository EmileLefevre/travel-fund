const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@googlemaps/google-maps-services-js');
const path = require('path');
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const session = require('express-session'); 
const { createDecipheriv } = require('crypto');
const multer = require('multer');
// require('dotenv').config({ path: '/custom/path/to/.env' })
const myObject = {}
require('dotenv').config({ processEnv: myObject })




const app = express();
const googleMapsClient = new Client({});

app.use(bodyParser.json());
app.use(cookieParser());

const API_KEY = myObject.GOOGLE_MAPS_API_KEY;

const db = mysql.createConnection({
    host: myObject.HOST,
    user:myObject.USERNAME,
    password: myObject.PASSWORD_DB,
    database: myObject.NAME_BD,
    port: myObject.PORT,
});

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

let userSessions = {};

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя для файла
    },
});
const upload = multer({ storage: storage });

// Маршрут для добавления комментария с изображением
app.post('/submit-comment', upload.single('commentImage'), (req, res) => {
    console.log(req.body, req.file);
    const { commentText, author } = req.body;  // Добавляем author
    const image = req.file ? req.file.filename : null;

    if (!commentText || !author) {  // Проверяем, что автор тоже указан
        return res.status(400).json({ success: false, message: "Veuillez entrer un commentaire et un auteur." });
    }

    const query = 'INSERT INTO comments (author, text, image) VALUES (?, ?, ?)';
    db.query(query, [author, commentText, image], (err, result) => {  // Передаем корректные данные
        if (err) {
            console.error('Erreur lors de l\'ajout du commentaire:', err);
            return res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout du commentaire.' });
        }

        res.json({ success: true, message: 'Commentaire ajouté avec succès !' });
    });
});

// Маршрут для получения комментариев
app.get('/get-comments', (req, res) => {
    const query = 'SELECT * FROM comments ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors du chargement des commentaires:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
        }

        const comments = results.map(row => ({
            author: row.author,
            text: row.text,
            image: row.image ? `/uploads/${row.image}` : null,
        }));

        res.json({ comments });
    });
});

// Загрузка комментариев на страницу (можно сделать это через фронтенд)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // Статическая папка для изображений



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
    // console.log("Google Maps API Key: ", API_KEY);
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

// Статические файлы из папки 'uploads' (для изображений)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});


// const express = require('express');
// const bodyParser = require('body-parser');
// const { Client } = require('@googlemaps/google-maps-services-js');
// const path = require('path');
// const mysql = require('mysql2');
// const bcrypt = require('bcrypt');
// const cookieParser = require('cookie-parser');
// const session = require('express-session');
// const multer = require('multer');
// const myObject = {}
// require('dotenv').config({ processEnv: myObject })




// const app = express();
// const googleMapsClient = new Client({});

// app.use(bodyParser.json());
// app.use(cookieParser());

// const API_KEY = myObject.GOOGLE_MAPS_API_KEY;

// const db = mysql.createConnection({
//     host: myObject.HOST,
//     user:myObject.USERNAME,
//     password: myObject.PASSWORD_DB,
//     database: myObject.NAME_BD,
//     port: myObject.PORT,
// });

// // Подключаемся к базе данных
// db.connect((err) => {
//     if (err) {
//         console.error('Ошибка подключения к базе данных:', err);
//         process.exit(1);
//     } else {
//         console.log('✅ Подключено к базе данных MySQL');
//     }
// });

// // Настройка хранения сессий пользователей
// let userSessions = {};

// // Настройка Multer для загрузки изображений
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     },
// });
// const upload = multer({ storage: storage });

// // ✅ Маршрут для добавления комментария с изображением
// app.post('/submit-comment', upload.single('commentImage'), (req, res) => {
//     console.log(req.body, req.file); // Для отладки

//     const { commentText, author } = req.body;
//     const image = req.file ? req.file.filename : null;

//     if (!commentText || !author) {
//         return res.status(400).json({ success: false, message: 'Veuillez entrer un commentaire et un auteur.' });
//     }

//     const query = 'INSERT INTO comments (author, text, image) VALUES (?, ?, ?)';
//     db.query(query, [author, commentText, image], (err, result) => {
//         if (err) {
//             console.error('Erreur lors de l\'ajout du commentaire:', err);
//             return res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout du commentaire.' });
//         }

//         res.json({ success: true, message: 'Commentaire ajouté avec succès !' });
//     });
// });

// // ✅ Маршрут для получения комментариев
// app.get('/get-comments', (req, res) => {
//     const query = 'SELECT * FROM comments ORDER BY created_at DESC';
//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('Erreur lors du chargement des commentaires:', err);
//             return res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
//         }

//         const comments = results.map((row) => ({
//             author: row.author,
//             text: row.text,
//             image: row.image ? `/uploads/${row.image}` : null,
//         }));

//         res.json({ comments });
//     });
// });

// // ✅ Регистрация пользователя
// app.post('/register', async (req, res) => {
//     const { username, name, mail, addresse, password } = req.body;

//     if (!username || !name || !mail || !addresse || !password) {
//         return res.status(400).json({ success: false, message: 'Champs manquants.' });
//     }

//     try {
//         const query = 'SELECT * FROM users WHERE username = ?';
//         db.query(query, [username], async (err, results) => {
//             if (err) {
//                 console.error('Erreur lors de la requête :', err);
//                 return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
//             }

//             if (results.length > 0) {
//                 return res.status(400).json({ success: false, message: "Nom d'utilisateur déjà pris." });
//             }

//             const hashedPassword = await bcrypt.hash(password, 10);

//             const insertQuery = 'INSERT INTO users (username, name, mail, addresse, password) VALUES (?, ?, ?, ?, ?)';
//             db.query(insertQuery, [username, name, mail, addresse, hashedPassword], (err, result) => {
//                 if (err) {
//                     console.error("Erreur lors de l'insertion :", err);
//                     return res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement." });
//                 }
//                 res.status(201).json({ success: true, message: "Utilisateur enregistré avec succès !" });
//             });
//         });
//     } catch (error) {
//         console.error('Erreur :', error);
//         res.status(500).json({ success: false, message: 'Erreur interne.' });
//     }
// });

// // ✅ Логин
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).json({ success: false, message: 'Champs manquants.' });
//     }

//     try {
//         const query = 'SELECT * FROM users WHERE username = ?';
//         db.query(query, [username], async (err, results) => {
//             if (err) {
//                 console.error('Erreur lors de la requête :', err);
//                 return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
//             }

//             if (results.length === 0) {
//                 return res.status(401).json({ success: false, message: 'Utilisateur introuvable.' });
//             }

//             const user = results[0];
//             const match = await bcrypt.compare(password, user.password);

//             if (!match) {
//                 return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });
//             }

//             req.session.user = { username: user.username, name: user.name };
//             res.json({ success: true, message: 'Connexion réussie !', name: user.name });
//         });
//     } catch (error) {
//         console.error('Erreur :', error);
//         res.status(500).json({ success: false, message: 'Erreur interne.' });
//     }
// });

// // ✅ Проверка авторизации
// app.get('/check-login', (req, res) => {
//     if (req.session.user) {
//         res.json({ loggedIn: true, username: req.session.user.username, name: req.session.user.name });
//     } else {
//         res.json({ loggedIn: false });
//     }
// });

// // ✅ Запускаем сервер
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
// });
