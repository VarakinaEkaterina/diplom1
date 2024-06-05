const { User } = require("../models/db");
const bcrypt = require("bcrypt");
const logger = require("../logger/index");
const jwt = require("jsonwebtoken");

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

exports.form = (req, res) => {
    logger.info("Зашли на страницу регистрации");
    res.render("register", {
        title: "Register",
        validationError: null,
        formData: {}
    });
};

exports.submit = async (req, res, next) => {
    const { email, name, password, confirm_password, age, role } = req.body.dataForm;

    let validationError = null;

    if (!password || password.trim().length < 6) {
        logger.warn("Пароль должен содержать минимум 6 символов");
        validationError = { field: 'password', message: 'Пароль должен содержать минимум 6 символов' };
    } else if (password !== confirm_password) {
        logger.warn("Пароли не совпадают");
        validationError = { field: 'confirm_password', message: 'Пароли не совпадают' };
    } else {
        try {
            const user = await User.findOne({ where: { email } });
            if (user) {
                logger.warn("Такой пользователь уже существует");
                validationError = { field: 'email', message: 'Такой пользователь уже существует' };
            } else {
                const SALT = Number(process.env.SALT);
                const salt = await bcrypt.genSalt(SALT);
                const hash = await bcrypt.hash(password, salt);

                await User.create({ name, email, password: hash, age, role });

                req.session.userEmail = email;
                req.session.userName = name;
                logger.info("Новый пользователь успешно зарегистрирован:", { email, name, age });

                const jwt_time = process.env.JWTTIME;
                const token = jwt.sign(
                    { name: email },
                    process.env.JWTTOKENSECRET,
                    { expiresIn: 60 * 60 }
                );
                res.cookie("jwt", token, { maxAge: jwt_time, httpOnly: true });
                logger.info("Токен подготовлен: " + token);
                return res.redirect("/profile");
            }
        } catch (err) {
            return next(err);
        }
    }

    if (validationError) {
        return res.render("register", {
            title: "Register",
            validationError,
            formData: req.body.dataForm
        });
    }
};
