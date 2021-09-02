const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const helmet = require('helmet');
const nocache = require('nocache');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

//Utilisation du module 'dotenv' pour masquer les informations de connexion à la base de données grâce à une variable d'environnement
require('dotenv').config();

//Connection à la base de données tout en cachant les informations de connexion
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.2fidz.mongodb.net/${process.env.NAMESPACE_NAME}?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


//Création application express
const app = express();

//CORS
app.use(cors());

//Ajoute une limite de requêtes
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Vous avez réalisé trop de requêtes !"
})

//Remplacer le body-parser : transforme les données arrivant à la requête POST en un objet JSON facilement exploitable
app.use(express.json());

//Sécuriser Express en définissant divers en-têtes HTTP
app.use(helmet());

//Désactive la mise en cache du navigateur
app.use(nocache());

//Gérer les images
app.use('/images', express.static(path.join(__dirname, 'images')));

//Ajoute une limite de requêtes maximale par @IP
app.use('/api', limiter);

//Permet de se protéger contre les injections
app.use(mongoSanitize());

//Permet de se protéger contre les attaques XSS
app.use(xssClean());

//Routes
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

//Export de l'application express pour déclaration dans server.js
module.exports = app;