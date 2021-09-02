const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptJs = require('crypto-js');

const User = require('../models/User');

//Inscription
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                //Chiffrement de l'email
                email: cryptJs.HmacSHA512(req.body.email, process.env.TOKEN_JWT).toString(cryptJs.enc.Base64),
                //Hashage du mot de passe
                password: hash
            });
            //Enregistrement de l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

//Connexion
exports.login = (req, res, next) => {
    //Vérifie que l'email ou que le mot de passe a bien été saisi
    if ((!req.body.email || req.body.email.trim().length === 0) || (!req.body.password || req.body.password.trim().length === 0)) {
        return res.status(401).json();
    }

    //Récupérer l'email chiffré dans la variable email
    const email = cryptJs.HmacSHA512(req.body.email, process.env.TOKEN_JWT).toString(cryptJs.enc.Base64);
    //Recherche de l'utilisateur
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            //Vérifie le mot de passe
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    //Toutes les informations sont bonnes :
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id },
                            process.env.TOKEN_JWT, { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};