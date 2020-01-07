// Inclusion de modules.
const express = require('express');
const moment = require('moment');
const bcrypt = require('bcrypt');

const router = express.Router(); // Création d'un objet router.
const saltRounds = 10; // Définition du 'facteur de coût' utilisé par bcrypt.
const database = require('../config/database'); // Inclusion du module database.
moment.locale('fr'); // Changement de la langue locale.

// Sous-route pour l'affichage du profil.
router.get('/:id', function(req, res){
    var user = new Object;
    var games = new Object;

    // Vérifie que l'id existe.
    database.query('SELECT * FROM user WHERE user_id = ?', req.params.id, function(err, rows){
        if(err) {
            console.log(err);
        }

        // S'il existe ...
        if (rows.length){
            if (rows[0].sex === "F")
                user.sex = "Femme"
            else if (rows[0].sex === "M")
                user.sex = "Homme"
            else
                user.sex = "N/A"

            user.user_id = rows[0].user_id;
            user.pseudo = rows[0].pseudo;
            user.image = rows[0].profile_image;
            user.description = rows[0].user_description;
            user.date_of_birth = moment(rows[0].date_of_birth).toNow(true);
            user.registration_date = moment(rows[0].registration_date).format('LL');

            // Récupère les jeux favoris de l'utilisateur.
            database.query(`SELECT game_title FROM game AS ga RIGHT JOIN user_favorite_game
            AS us on (ga.game_id = us.game_id) WHERE user_id = ?`, req.params.id, function(err, rows){
                if(err) {
                    console.log(err);
                }

                games = rows;

                res.render('profile', {user: user, games: games});
            });
        }

        // S'il n'existe pas ...
        else {
            console.log("This user doesn't exist"); // Debug.
            res.status(404);
            res.render('error', {error_code: "Erreur 404 !", error_message: "La page n'existe pas"});
        }
    });
});

// Sous-route pour l'affichage du profil.
router.post('/:id', function(req, res){
    if (req.params.id != req.session.user_id) {

        var flag = false;

        // Création d'un objet like.
        var like = {
            'user_liking': req.session.user_id,
            'user_liked': req.params.id
        }

        database.query(`SELECT * FROM user_like WHERE user_liking = ?
            AND user_liked = ?`, [like.user_liking, like.user_liked], function(err, rows){
            if(err) {
                console.log(err);
            }

            if (rows.length > 0){
                flag = true
            }

            // Si l'utilisateur a cliqué sur 'Like' ...
            if (req.body.like){
                // S'il n'a pas déjà aimé cette personne ...
                if (!flag) {
                    database.query(`INSERT INTO user_like SET ?`, like, function(err, rows){
                        if(err) {
                            console.log(err);
                        }

                        res.render('success', {msg: "Modification(s) enregistrée(s)"});
                    });
                }

                else {
                    res.status(409);
                    res.render('error', {error_code: "Erreur 409 !", error_message: "Vous avez déjà aimé cet utilisateur"});
                }
            }

            // Si l'utilisateur a cliqué sur 'Dislike' ...
            else {
                // S'il a déjà "détesté" cette personne ...
                if (flag) {
                    database.query(`DELETE FROM user_like WHERE user_liking = ?
                        AND user_liked = ?`, [like.user_liking, like.user_liked], function(err, rows){
                        if(err) {
                            console.log(err);
                        }

                        res.render('success', {msg: "Modification(s) enregistrée(s)"});
                    });
                }

                else {
                    res.status(409);
                    res.render('error', {error_code: "Erreur 409 !", error_message: "Vous n'avez pas aimé cet utilisateur"});
                }
            }
        });
    }
});

// Sous-route pour la modification du profil.
router.get('/:id/edit', function(req, res){
    if (req.params.id == req.session.user_id) {

        var user = new Object;
        var games = new Object;
        var user_selected_games = new Object;

        database.query('SELECT * FROM user WHERE user_id = ?', req.session.user_id, function(err, rows){
            if(err) {
                console.log(err);
            }

            user.sex = rows[0].sex;
            user.date_of_birth = moment(rows[0].date_of_birth).format("YYYY-MM-DD");
            user.profile_image = rows[0].profile_image;
            user.description = rows[0].user_description;

            database.query('SELECT game_id, game_title FROM game', function(err, rows){
                if(err) {
                    console.log(err);
                }

                games = rows;

                // Récupère les jeux favoris de l'utilisateur.
                database.query(`SELECT game_title FROM game AS ga RIGHT JOIN user_favorite_game
                AS us on (ga.game_id = us.game_id) WHERE user_id = ?`, req.params.id, function(err, rows){
                    if(err) {
                        console.log(err);
                    }

                    user_selected_games = rows;

                    console.log(user_selected_games); // Debug.
                    res.render("edit", {user: user, games: games, user_selected_games: user_selected_games});
                });
            });
        });
    }
    else {
        console.log("The user isn't identified"); // Debug.
        res.status(403);
        res.render('error', {error_code: "Erreur 403 !", error_message: "Accès interdit"});
    }
});

// Sous-route pour la modification du profil.
router.post('/:id/edit', function(req, res){
    const errors = validate(req);

    if (errors.length) {
        console.log(errors);
        res.redirect('/profile/' + req.session.user_id);
    }

    else {
        console.log(req.body); // Debug.

        var password = req.body.password;
        var games_id = req.body.favorite_games;
        var user_id = req.session.user_id;

        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                }

                password = hash; // Mot de passe hashé.

                // Création d'un objet user.
                var user = {
                    'sex': req.body.sex,
                    'password': password,
                    'date_of_birth': req.body.date_of_birth,
                    'profile_image': req.body.profile_image,
                    'user_description': req.body.description
                }

                database.query('UPDATE user SET ? WHERE user_id = ?', [user, user_id], function(err, rows){
                    if (err){
                        console.log(err);
                    }
                });

                database.query('DELETE FROM user_favorite_game WHERE user_id = ?', user_id, function(err, rows){
                    if (err){
                        console.log(err);
                    }

                    // Si l'utilisateur a rentré des jeux ...
                    if (games_id !== undefined) {

                        // S'il y a plusieurs jeux ...
                        if (Array.isArray(games_id)) {
                            // Pour chaque jeu, essayer de l'ajouter à la base de donneées.
                            games_id.forEach(function(item, index){
                                database.query('INSERT INTO user_favorite_game SET ?', {'user_id': user_id, 'game_id': item}, function(err, rows){
                                    if (err){
                                        console.log(err);
                                    }
                                });
                            });
                        }

                        // S'il n'y a qu'un seul jeu ...
                        else {
                            database.query('INSERT INTO user_favorite_game SET ?', {'user_id': user_id, 'game_id': games_id}, function(err, rows){
                                if (err){
                                    console.log(err);
                                }
                            });
                        }
                    }
                });

                res.render('success', {msg: "Modification(s) enregistrée(s)"})
            });
        });
    }
});

// Sous-route pour l'affichage des likes de l'utilisateur.
router.get('/:id/likes', function(req, res){
    if (req.params.id == req.session.user_id) {

        var users_liked = new Object;

        // Requête pour les like.
        database.query(`SELECT user_id, pseudo, profile_image, user_description, registration_date
            FROM user_like AS us_l RIGHT JOIN user AS us ON (us_l.user_liked = us.user_id)
            WHERE user_liking = ?`, req.params.id, function(err, rows){
            if(err) {
                console.log(err);
            }

            users_liked = rows;

            // Si l'utilisateur a déjà liké quelqu'un ...
            if (users_liked.length !== 0) {
                users_liked.forEach(function(item, index){
                        users_liked[index].registration_date = moment(users_liked[index].registration_date).format('LL');
                });

                res.render("likes", {users: users_liked});
            }

            else {
                res.status(404);
                res.render('error', {error_code: "Erreur 404 !", error_message: "Vous n'avez pas encore mis de like"});
            }
        });
    }

    else {
        console.log("The user isn't identified"); // Debug.
        res.status(403);
        res.render('error', {error_code: "Erreur 403 !", error_message: "Accès interdit"});
    }
});

// Sous-route pour l'affichage des matches de l'utilisateur.
router.get('/:id/matches', function(req, res){
    if (req.params.id == req.session.user_id) {

        var users_matched = new Object;

        /* Requête pour les matches :
            l'utilisateur aime une personne et celle-ci doit l'aimer en retour.
        */
        database.query(`SELECT user_id, pseudo, profile_image, user_description, registration_date
            FROM user_like AS us_l RIGHT JOIN user AS us ON (us_l.user_liked = us.user_id)
            WHERE user_liking = ?
            INTERSECT
            SELECT user_id, pseudo, profile_image, user_description, registration_date
            FROM user_like AS us_l LEFT JOIN user AS us ON (us_l.user_liking = user_id)
            WHERE user_liked = ?`, [req.params.id, req.params.id] , function(err, rows){
            if(err) {
                console.log(err);
            }

            users_matched = rows;

            // Si l'utilisateur a des matches ...
            if (users_matched.length !== 0) {
                users_matched.forEach(function(item, index){
                        users_matched[index].registration_date = moment(users_matched[index].registration_date).format('LL');
                });

                res.render("likes", {users: users_matched});
            }

            else {
                res.status(404);
                res.render('error', {error_code: "Erreur 404 !", error_message: "Vous n'avez pas encore de matches"});
            }
        });
    }

    else {
        console.log("The user isn't identified"); // Debug.
        res.status(403);
        res.render('error', {error_code: "Erreur 403 !", error_message: "Accès interdit"});
    }
});

// Sous-route pour la déconnexion.
router.get('/:id/logout', function(req, res){
    if (req.params.id == req.session.user_id) {
        req.session.destroy();
        res.render('success', {msg: "Vous êtes maintenant déconnecté(e)"})
    }
    else {
        console.log("The user isn't identified"); // Debug.
        res.status(403);
        res.render('error', {error_code: "Erreur 403 !", error_message: "Accès interdit"});
    }
});

// Fonction validant les entrées utilisateurs.
function validate(req) {
    const errors = [];

    // Vérification du sexe.
    if (!(req.body.sex === 'F' || req.body.sex === 'M' || req.body.sex === '')){
        errors.push('Invalid sex');
    }

    // Vérification du mot de passe.
    if (!req.body.password || req.body.password !== req.body.password_confirmation){
        errors.push('Invalid password');
    }

    // Vérification de la date de naissance.
    if (!req.body.date_of_birth){
        errors.push('Invalid date of birth');
    }

    // Vérification de l'image de profil.
    if (!req.body.profile_image || req.body.profile_image.length > 255){
        errors.push('Invalid link to profile image');
    }

    // Vérification de la description.
    if (req.body.description.length > 255){
        errors.push('Invalid description');
    }

    return errors;
}

module.exports = router;
