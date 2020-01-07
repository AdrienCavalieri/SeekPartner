$(document).ready(function(){

    // Calcul de la date minimale et maximale
    var today = new Date();

    var day = today.getDate();
    var month = today.getMonth() + 1; // Ajoute 1 car la numérotation des mois commence à 0.
    var year = today.getFullYear();

    if (month < 10) // Ajoute un 0 aux jours et aux mois inférieurs à 10 pour correspondra au format.
        month = '0' + month.toString();

    if (day < 10)
    day = '0' + day.toString();

    var minDate = year - 100 + '-' + month + '-' + day; // Age maximal.
    var maxDate = year - 13 + '-' + month + '-' + day; // Age minimal.

    // Affiche ou cache le mot de passe.
    $("form input[name=show_password]").on("input", function(){
        if ($("form input[name=password], form input[name=password_confirmation]").attr("type") === "password")
            $("form input[name=password], form input[name=password_confirmation]").attr("type", "text");
        else
            $("form input[name=password], form input[name=password_confirmation]").attr("type", "password");
    });

    // Change dynamiquement la date requise.
    $('form input[name=date_of_birth]').attr({
        'min': minDate,
        'max': maxDate
    });
});
