// Inclusion de modules.
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const bodyParser = require('body-parser');

const serv = express(); // Création d’un objet express.
const port = 8080; // Définition du port d'écoute.

serv.set('view engine', 'ejs'); // Association d'ejs en tant que view engine
serv.use(express.static('public')); // Spécification du répertoire statique.
serv.use(session({
    store: new MemoryStore({
      checkPeriod: 86400000
    }),
    secret: 'topsecret',
    proxy: true,
    resave: true,
    saveUninitialized: true
})) // Configuration de la session en utilisant MemoryStore.

serv.use(bodyParser.urlencoded({extended: false}));
//serv.use(bodyParser.json());

// Routage.
serv.use(function(req, res, next){
  res.locals.user_id = req.session.user_id;
  next();
});

serv.get('/', function(req, res){
    res.render('home');
});

serv.use('/register', require('./routes/register'));
serv.use('/login', require('./routes/login'));
serv.use('/profile', require('./routes/profile'));
serv.use('/meet', require('./routes/meet'));

serv.all('*', function(req, res){
    res.status(404);
    res.render('error', {error_code: "Erreur 404 !", error_message: "La page n'a pas été trouvée"});
});

serv.listen(port);
