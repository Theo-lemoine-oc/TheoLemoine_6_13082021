const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const helmet = require('helmet');
const nocache = require('nocache');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

// utilisation du module 'dotenv' pour masquer les informations de connexion à la base de données à l'aide de variables d'environnement
require('dotenv').config();

//Connection à la base de données
mongoose.connect('mongodb+srv://proph:jorlobcr121233@cluster0.2fidz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


//Création application express
const app = express();

//CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


//Remplacer le body-parser : transforme les données arrivant à la requête POST en un objet JSON facilemnet exploitable
app.use(express.json());

// Sécuriser Express en définissant divers en-têtes HTTP - https://www.npmjs.com/package/helmet#how-it-works
// On utilise helmet pour plusieurs raisons notamment la mise en place du X-XSS-Protection afin d'activer le filtre de script intersites(XSS) dans les navigateurs web
app.use(helmet());

//Désactive la mise en cache du navigateur
app.use(nocache());

//Gérer les images
app.use('/images', express.static(path.join(__dirname, 'images')));

//Routes
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);


//Export de l'application express pour déclaration dans server.js
module.exports = app;