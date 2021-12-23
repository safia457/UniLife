// Express
const express = require('express');
const app = express();

// Body-Parser
app.use(express.urlencoded({extended: true}));

// EJS
app.engine('.ejs', require('ejs').__express);
app.set('view engine', 'ejs');

// SQLite3
const sqlite3 = require('sqlite3').verbose();
const DATABASE = 'Benutzer.db';
const feedbackDB = 'Feedback.db'
const db = new sqlite3.Database(DATABASE);
const db2 = new sqlite3.Database(feedbackDB);

// Cookie-Parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Express-Session
const session = require('express-session');
app.use(session({
secret: 'YOURSECRETCODE',
saveUninitialized: false,
resave: false
}));

//Server-starten
app.listen(3000, function()
{
console.log('listening on port 3000');
});

//Ordner freigeben
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

//GET-Request

app.get(['/', '/startseite','/home'], function(req, res){
    res.render(__dirname + "/views/home.ejs", {session: req.session.sessionValue});
});

app.get('/about', function(req, res){
    res.render(__dirname + "/views/about.ejs", {session: req.session.sessionValue});
});

app.get('/signup', function(req, res){
    res.render(__dirname + "/views/signup.ejs", {session: req.session.sessionValue});
});

app.get('/login', function(req, res){
    res.render(__dirname + "/views/login.ejs");
});

app.get('/contact', function(req, res){
    res.render(__dirname + "/views/contact.ejs", {session: req.session.sessionValue});
});

app.get("/calendar", function(req, res){
    res.render(__dirname + "/views/calendar/index.ejs", {session: req.session.sessionValue});
});

app.get("/schedule", function(req, res){
    res.render(__dirname + "/views/schedule.ejs", {session: req.session.sessionValue});
});

app.get(['/game', '/mini-game','/snake'], function(req, res){
    res.render(__dirname + "/views/snake.ejs", {session: req.session.sessionValue})
});

app.get("/profile", function(req, res){
    res.render(__dirname + "/views/profile.ejs", {session: req.session.sessionValue});
});

app.get("/test", function(req, res){
    res.render(__dirname + "/views/test.ejs", {session: req.session.sessionValue});
});


// Abmelden

app.get("/logout", function(req, res){
    req.session.destroy();

    res.redirect("/home");
});

// Login

app.post("/login_auswertung", function(req, res){
    const param_name = req.body.username;
    const param_psw = req.body.password;
    //Wert aus dem Formular lesen
    const param_sessionValue = req.body.username;

    db.all(
        `SELECT * FROM benutzer`,
        function(err, rows) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].username == param_name && rows[i].password == param_psw) {
                    //Sessionvariable setzen
                    req.session.sessionValue = param_sessionValue;
                    return res.render("login_erfolgreich", {session: req.session.sessionValue});
                }
            }
            return res.render("login_fehlgeschlagen");  
        }
    );

});

//Registrierung

app.post("/signup_form", function(req, res){
    const param_username = req.body.username;
    const param_password = req.body.psw;
    const param_wdhpw = req.body.wdhpassword;

    db.all(
        `SELECT * FROM benutzer`,
        function(err, rows) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].username == param_username) {
                    return res.render("signup_fehlgeschlagen", {"username": param_username});
                }
            }
            passwortUeberpruefen(param_password, param_wdhpw);  
        }
    );

   function passwortUeberpruefen(param_password, param_wdhpw){
    if (! (param_password == param_wdhpw)){
        return res.render("signup_fehlgeschlagen(password)")
    }

    db.run(
        `INSERT INTO benutzer(username, password) VALUES ("${param_username}", "${param_password}")`,
        function(err){
            return res.render("signup_erfolgreich", {"username": param_username});
        }
    )
}
});

// Feedback

app.post("/feedback", function(req, res){
    const param_name = req.body.name;
    const param_email = req.body.email;
    const param_feedback = req.body.feedback;

    db2.run(
        `INSERT INTO feedback(name, email, feedback) VALUES ("${param_name}", "${param_email}", "${param_feedback}")`,
        function(err){
            return res.render("feedback_submitted");
        }
    )

});