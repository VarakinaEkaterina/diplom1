const { Routes, ReviewRoutes, ReviewRoutePhoto, Feedback ,ReviewPhoto, ReviewAttractions, Landmarks, User } = require("../models/db");
const logger = require("../logger/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config();

exports.form = async(req, res) => {
    logger.info("Зашли на страницу профиля");

    let userLandmarks = [];
    let userRoutes = [];
    let userReviews = [];
    let userRouteReviews = [];
    let adminReviews = [];
    let adminRouteReviews = [];
    let adminFeedback = [];
    let validationError = req.session.validationError || null;

    if (req.user) {
        try {
            userLandmarks = await req.user.getLandmarks();
            userRoutes = await req.user.getRoutes();  

            userLandmarks.forEach(lm => lm.type = 'landmark');
            userRoutes.forEach(rt => rt.type = 'route');

            if (req.user.role === 'admin') {
                adminReviews = await ReviewAttractions.findAll({
                    where: { status: 'pending' },
                    include: [
                        { model: Landmarks },
                        { model: User, attributes: ['id', 'name', 'email'] },
                        { model: ReviewPhoto }
                    ],
                    order: [['createdAt', 'DESC']]
                });

                adminRouteReviews = await ReviewRoutes.findAll({
                    where: { status: 'pending' },
                    include: [
                        { model: Routes },
                        { model: User, attributes: ['id', 'name', 'email'] },
                        { model: ReviewRoutePhoto }
                    ],
                    order: [['createdAt', 'DESC']]
                });

                adminFeedback = await Feedback.findAll({
                    attributes: ['name', 'email', 'rating', 'message']
                });
            } else {
                userReviews = await ReviewAttractions.findAll({
                    where: { userId: req.user.id },
                    include: [
                        { model: Landmarks, as: 'Landmark' },
                        { model: ReviewPhoto }
                    ]
                });

                userRouteReviews = await ReviewRoutes.findAll({
                    where: { userId: req.user.id },
                    include: [
                        { model: Routes, as: 'Route' },
                        { model: ReviewRoutePhoto }
                    ]
                });
            }
            
            res.render("profile", {
                title: "Profile",
                user: req.user,
                landmarks: userLandmarks,
                routes: userRoutes,
                userReviews: userReviews,
                userRouteReviews: userRouteReviews,
                adminReviews: adminReviews,
                adminRouteReviews: adminRouteReviews,
                adminFeedback: adminFeedback,
                validationError: validationError
            });
        } catch (error) {
            logger.error("Ошибка при загрузке данных пользователя:", error);
            res.status(500).render("profile", {
                title: "Profile",
                user: req.user,
                landmarks: [],
                routes: [],
                userReviews: [],
                userRouteReviews: [],
                adminReviews: [],
                adminRouteReviews: [],
                adminFeedback: [],
                validationError: validationError,
                error: "Произошла ошибка при загрузке данных"
            });
        }
    } else {
        res.render("profile", {
            title: "Profile",
            user: null,
            landmarks: [],
            routes: [],
            userReviews: [],
            userRouteReviews: [],
            adminReviews: [],
            adminRouteReviews: [],
            adminFeedback: [],
            validationError: validationError,
            error: "Вы не авторизованы"
        });
    }
};




async function authenticate(dataForm, cb) {
    try {
        const user = await User.findOne({ where: { email: dataForm.email } });
        if (!user) return cb();
        const result = await bcrypt.compare(dataForm.password, user.password)

        if (result) return cb(null, user);
        return cb();

    } catch (err) {
        return cb(error);
    }
}



exports.submit = (req, res, next) => {
    authenticate(req.body.loginForm, (err, data) => {
        if (err) {
            logger.error("Ошибка аутентификации пользователя:", err);
            return next(err);
        }
        if (!data) {
            logger.warn("Неверный логин или пароль");
            return res.render("profile", {
                title: "profile",
                validationError: { field: 'password', message: 'Неверный логин или пароль. Пожалуйста, зарегистрируйтесь, если у Вас еще нет профиля.' },
                formData: req.body.loginForm
            });
        } else {
            req.session.userEmail = data.email;
            req.session.userName = data.name;
            logger.info(`Пользователь ${data.name} успешно вошел в систему:`, { email: data.email, name: data.name });

            //генерация jvt
            const jwt_time = process.env.JWTTIME;
            const token = jwt.sign({
                    name: data.email
                },
                process.env.JWTTOKENSECRET, {
                    expiresIn: 60 * 60
                }
            );
            //создание cookie для пользователя
            res.cookie("jwt", token, { maxAge: jwt_time, httpOnly: true });
            logger.info("Токен подготовлен: " + token);
            res.redirect("/profile");
        }
    });
};

exports.logout = function(req, res) {
    logger.info(`Пользователь ${req.session.userName} вышел из системы:`, { email: req.session.userEmail, name: req.session.userName });
    res.clearCookie("jwt");
    res.clearCookie("connect.sid");
    req.session.destroy((err) => {
        if (err) {
            logger.error("Ошибка при выходе пользователя:", err);
            return next(err);
        }
        res.redirect("/");
    });
};