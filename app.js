const express = require('express');
const path = require('path');
const favicon = require("express-favicon");
const app = express();
const session = require("express-session");
const myRoutes = require("./routers/index_routers");
const userSession = require("./middleware/user_session");
const winston = require("winston");
const passport = require("passport");
const { sequelize, Main, Routes } = require("./models/db");
const messages = require("./middleware/messages");

const passportFunctionYandex = require("./middleware/passport_yandex");
const passportFunctionGoogle = require("./middleware/passport_go");
const passportFunctionGitHub = require("./middleware/passport_git");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ]
});

const port = process.env.PORT || 3000;

require("dotenv").config();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/js', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules', 'wow.js', 'dist')));
app.use('/css', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/icons', express.static(path.join(__dirname, 'node_modules', 'bootstrap-icons', 'icons')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules', 'bootstrap-icons', 'font')));
app.use('/font', express.static(path.join(__dirname, 'public', 'fonts')));
app.use('/scripts', express.static(__dirname + '/node_modules'));

app.use(express.static('public'));

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(
    session({
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true,
    })
);

passportFunctionYandex(passport);
passportFunctionGoogle(passport);
passportFunctionGitHub(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(messages);
app.use(userSession);
app.use(myRoutes);

app.use(function(req, res, next) {
    const err = new Error("NO FOUND ERROR");
    err.code = 404;
    next(err);
});

if (app.get("env") != "development") {
    app.use(function(err, req, res, next) {
        err.status = 404;
        res.render("error");
    });
} 

app.listen(port, async function() {
    await sequelize.sync({ force: false });
    logger.info("Сервер запущен. Порт: " + port + ", все базы данных синхронизированы");
});
