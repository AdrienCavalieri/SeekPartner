// Inclusion de modules.
const mysql = require('mysql');
const ini = require('ini');
const fs = require('fs');

// Chargement des options depuis config.ini.
const config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'));

// Création de la connexion.
const database = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

// Connexion à la base de données.
database.connect(function(err){
    if(err){
        throw err;
    }
    console.log('Connected to MySQL server');
});

module.exports = database;
