const validatePassword = (req, res, next) => {
    const { password } = req.body.dataForm;

    if (!password || password.trim().length < 6) {
        return res.render("register", {
            title: "Register",
            validationError: { field: 'password', message: 'Пароль должен содержать минимум 6 символов' },
            formData: req.body.dataForm
        });
    }

    next();
};

module.exports = validatePassword;