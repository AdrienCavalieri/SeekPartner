// Inclusion de modules.
const express = require('express');

const router = express.Router(); // Création d'un objet router.
const database = require('../config/database'); // Inclusion du module database.

router.get('/', function(req, res){
    database.query('SELECT user_id FROM user', function(err, rows){
        if(err) {
            console.log(err);
        }

        // Redirige vers un profil totalement au hasard.
        numRows = rows.length;
        randomID = Math.floor(Math.random() * numRows + 1);
        res.redirect("/profile/" + randomID);
    });
});

module.exports = router;
