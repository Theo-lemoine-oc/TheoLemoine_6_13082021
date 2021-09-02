const passwordSchema = require('../models/password');


module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        return res.status(400).json({
            message: 'Mauvais mot de passe ! Veuillez utiliser une majuscule, une minuscule, des chiffres et un miniumm de 8 caractères.'
        });
    } else {
        next();
    }
};