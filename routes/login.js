// Inclusion de modules.
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router(); // Création d'un objet router.
const database = require('../config/database'); // Inclusion du module database.

router.get('/', function(req, res){
    if (typeof req.session.user_id == 'undefined') {
        res.render('login');
    }

    else {
        res.status(403);
        res.render('error', {error_code: "Erreur 403 !", error_message: "Accès interdit"});
    }
});

router.post('/', function(req, res){
    const errors = validate(req);

    console.log(req.body); // Debug.

    if (errors.length) {
        console.log(errors); // Debug.
        res.redirect('/login');
    }

    else {

        // Création d'un objet user.
        var user = {
            'pseudo': req.body.pseudo,
            'password': req.body.password
        };

        // Vérifie que le pseudonyme existe.
        database.query('SELECT * FROM user WHERE pseudo = ?', user.pseudo, function(err, rows){
            if(err) {
                console.log(err);
            }

            // S'il existe ...
            if (rows.length){
                bcrypt.compare(user.password, rows[0].password, function(err, result) {
                    if (err) {
                        console.log(err);
                    }

                    if (result) {
                        req.session.user_id = rows[0].user_id;
                        console.log('User connected'); // Debug.
                        res.render('success', {msg: "Vous êtes maintenant connecté(e)"})
                    }

                    else {
                        console.log('Wrong password'); // Debug.
                        res.redirect('/login');
                    }
                });
            }

            // S'il n'existe pas ou que les hash ne correspondent pas ...
            else {
                console.log("This user doesn't exist"); // Debug.
                res.redirect('/login');
            }

        });
    }
});

// Fonction validant les entrées utilisateurs.
function validate(req) {
    const errors = [];

    // Vérification du pseudo.
    if (!req.body.pseudo){
        errors.push('Invalid pseudo');
    }

    // Vérification du mot de passe.
    if (!req.body.password){
        errors.push('Invalid password');
    }

    return errors;
}

module.exports = router;
