// Inclusion de modules.
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router(); // Création d'un objet router.
const saltRounds = 10; // Définition du 'facteur de coût' utilisé par bcrypt.
const database = require('../config/database'); // Inclusion du module database.

router.get('/', function(req, res){
    if (typeof req.session.user_id == 'undefined') {
        res.render('register');
    }

    else {
        res.status(403);
        res.render('error', {error_code: "Erreur 403 !", error_message: "Accès interdit"});
    }
});

router.post('/', function(req, res){
    const errors = validate(req);

    if (errors.length) {
        console.log(errors);
        res.redirect('/register');
    }

    else {
        console.log(req.body); // Debug.

        var password = req.body.password;

        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                }

                password = hash; // Mot de passe hashé.

                // Création d'un objet user.
                var user = {
                    'sex': req.body.sex,
                    'pseudo': req.body.pseudo,
                    'password': password,
                    'date_of_birth': req.body.date_of_birth,
                    'registration_date': new Date()
                }

                // Vérifie que le pseudonyme n'existe pas.
                database.query('SELECT * FROM user WHERE pseudo = ?', user.pseudo, function(err, rows){
                    if(err) {
                        console.log(err);
                    }

                    // S'il n'existe pas ...
                    if (!rows.length)
                    {
                        database.query('INSERT INTO user SET ?', user, function(err, res){
                            if (err){
                                console.log(err);
                            }
                        });

                        console.log('The user is registered'); // Debug.
                        res.render('success', {msg: "Vous êtes maintenant enregistré(e)"});
                    }

                    // S'il existe ...
                    else {
                        console.log('The user already exist'); // Debug.
                        res.redirect('/register');
                    }
                });
            });
        });
    }
});

// Fonction validant les entrées utilisateurs.
function validate(req) {
    const errors = [];

    // Vérification du sexe.
    if (!(req.body.sex === 'F' || req.body.sex === 'M' || req.body.sex === '')){
        errors.push('Invalid sex');
    }

    // Vérification du pseudo.
    if (!req.body.pseudo || req.body.pseudo.length < 3 || req.body.pseudo.length > 15){
        errors.push('Invalid pseudo');
    }

    // Vérification du mot de passe.
    if (!req.body.password || req.body.password !== req.body.password_confirmation){
        errors.push('Invalid password');
    }

    // Vérification de la date de naissance.
    if (!req.body.date_of_birth){
        errors.push('Invalid date of birth');
    }

    return errors;
}

module.exports = router;
