const Sauce = require('../models/sauce');
const fs = require('fs');

//Création d'une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({
            message: 'Sauce enregistrée !'
        }))
        .catch(error => res.status(400).json({
            error
        }));
}

//Modification d'une sauce
exports.modifySauce = (req, res, next) => {
    let sauceObject = {};
    req.file ? (
        Sauce.findOne({
            _id: req.params.id
        }).then((sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlinkSync(`images/${filename}`)
        }),
        sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
        }
    ) : (
        sauceObject = {
            ...req.body
        }
    )
    Sauce.updateOne({
            _id: req.params.id
        }, {
            ...sauceObject,
            _id: req.params.id
        })
        .then(() => res.status(200).json({
            message: 'Sauce modifiée !'
        }))
        .catch((error) => res.status(400).json({
            error
        }))
}

//Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({
                        message: 'Sauce supprimée !'
                    }))
                    .catch(error => res.status(400).json({
                        error
                    }));
            });
        })
        .catch(error => res.status(500).json({
            error
        }));
};

//Récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({
            error
        }));
};

//Récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({
            error
        }));
};

//Système de likes et de dislikes
exports.likeDislike = (req, res, next) => {
    let like = req.body.like
    let userId = req.body.userId
    let sauceId = req.params.id

    //S'il s'agit un like
    if (like === 1) {
        Sauce.updateOne({
                _id: sauceId
            }, {
                $push: {
                    usersLiked: userId
                },
                $inc: {
                    likes: +1
                },
            })
            .then(() => res.status(200).json({
                message: 'j\'aime ajouté !'
            }))
            .catch((error) => res.status(400).json({
                error
            }))
    }
    // S'il s'agit d'un dislike
    if (like === -1) {
        Sauce.updateOne({
                _id: sauceId
            }, {
                $push: {
                    usersDisliked: userId
                },
                $inc: {
                    dislikes: +1
                }, // On incrémente de 1
            })
            .then(() => {
                res.status(200).json({
                    message: 'Dislike ajouté !'
                })
            })
            .catch((error) => res.status(400).json({
                error
            }))
    }
    // Si il s'agit d'annuler un like ou un dislike
    if (like === 0) {
        Sauce.findOne({
                _id: sauceId
            })
            .then((sauce) => {
                // Si il s'agit d'annuler un like
                if (sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({
                            _id: sauceId
                        }, {
                            $pull: {
                                usersLiked: userId
                            },
                            $inc: {
                                likes: -1
                            },
                        })
                        .then(() => res.status(200).json({
                            message: 'Like retiré !'
                        }))
                        .catch((error) => res.status(400).json({
                            error
                        }))
                }
                // Si il s'agit d'annuler un dislike
                if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({
                            _id: sauceId
                        }, {
                            $pull: {
                                usersDisliked: userId
                            },
                            $inc: {
                                dislikes: -1
                            },
                        })
                        .then(() => res.status(200).json({
                            message: 'Dislike retiré !'
                        }))
                        .catch((error) => res.status(400).json({
                            error
                        }))
                }
            })
            .catch((error) => res.status(404).json({
                error
            }))
    }
}