const logger = require("../logger/index");
const { ReviewRoutes, Routes, User, ReviewRoutePhoto } = require("../models/db");

exports.listRoutes = async (req, res, next) => {
    try {
        const routes = await Routes.findAll({
            include: [{
                model: ReviewRoutes,
                required: false, 
                where: { status: 'approved' }, 
                include: [
                    { model: User, attributes: ['name', 'email'] }, 
                    { model: ReviewRoutePhoto } 
                ]
            }]
        });

        const user = req.user;

        let likedRoutesIds = [];
        if (user) {
            const likedRoutes = await user.getRoutes();
            likedRoutesIds = likedRoutes.map(route => route.id);
        }

        const enhancedRoutes = routes.map(route => {
            const reviews = route.ReviewRoutes || [];
            const averageRating = reviews.length > 0 ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length : 0;
            const likedByCurrentUser = likedRoutesIds.includes(route.id);

            return {
                ...route.toJSON(),
                reviews,
                averageRating,
                likedByCurrentUser
            };
        });

        res.render("routes", { title: "List of Routes", routes: enhancedRoutes, user: user });
    } catch (err) {
        logger.error("Ошибка при получении записей маршрутов:", err);
        res.status(500).send("Ошибка при загрузке страницы маршрутов");
    }
};

exports.form = (req, res) => {
    logger.warn("Зашли на страницу создания постов");
    res.render("newRoute", { title: "New Route" });
};

exports.submitRoute = async(req, res, next) => {
    try {
        const username = req.user ? req.user.name : null; 
        const userEmail = req.user ? req.user.email : null; 

        const data = req.body.newRouteForm;
        const file = req.file; 

        const newRoute = {
            username: userEmail, 
            name: data.name,
            description: data.description,
            descriptionFull: data.descriptionFull,
            iframeCode: data.iframeCode,
            externalLink: data.externalLink,
            photo: file ? file.filename : null, 
        };

        await Routes.create(newRoute);
        logger.info(`Новый маршрут создан пользователем ${username}:`, newRoute);

        res.redirect("/tours");
    } catch (err) {
        logger.error("Ошибка при создании маршрута:", err);
        next(err); 
    }
};


exports.showRoute = async(req, res, next) => {
    try {
        const routeId = req.params.routeId;
        const route = await Routes.findByPk(routeId, {
            include: [{
                model: ReviewRoutes,
                required: false,  
                where: { status: 'approved' },
                include: [
                    { model: User, attributes: ['name', 'email'] },
                    { model: ReviewRoutePhoto }
                ]
            }]
        });

        if (!route) {
            logger.error("Route not found");
            return res.status(404).json({ message: 'Route not found' });
        }

        const reviews = route.ReviewRoutes || [];
        const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1);

        const formattedDescriptionFull = route.descriptionFull
        .split(/\r?\n/) 
        .filter(line => line.trim().length > 0)  
        .map(line => `<p>${line.trim()}</p>`) 
        .join('');

        res.render("route", { title: "Route Details", routes: route, reviews: reviews, averageRating: averageRating, formattedDescriptionFull: formattedDescriptionFull });

    } catch (error) {
        logger.error("Ошибка при получении записи маршрута:", error);
        return next(error);
    }
};


exports.deleteRoute = async (req, res, next) => {
    const routeId = req.params.routeId;
    try {
        await Routes.destroy({ where: { id: routeId } });
        logger.info("Route successfully deleted.");
        res.redirect("/tours");
    } catch (err) {
        logger.error("Error deleting route:", err);
        res.status(500).send("Error deleting the route.");
    }
};

exports.updateRouteForm = async (req, res) => {
    const routeId = req.params.routeId;
    try {
        const route = await Routes.findByPk(routeId); 

        if (!route) {
            logger.error("Ошибка при получении записи для обновления: запись не найдена");
            return res.status(404).send("Route not found.");
        }

        res.render("updateRoute", { title: "Update Route", route: route });
    } catch (err) {
        logger.error("Ошибка при получении записи для обновления:", err);
        res.status(500).redirect("/");
    }
};


exports.updateRouteSubmit = async (req, res) => {
    const routeId = req.params.routeId;
    if (!req.body.newRouteForm) {
        console.error('Form data is missing');
        return res.status(400).send('Form data is missing');
    }

    const { name, description, descriptionFull, iframeCode, externalLink } = req.body.newRouteForm;
    const file = req.file; 

    try {
        const existingRoute = await Routes.findByPk(routeId);
        if (!existingRoute) {
            console.error(`No route found with ID: ${routeId}`);
            return res.status(404).send("Route not found.");
        }

        const updateData = {
            name: name,
            description: description,
            descriptionFull: descriptionFull,
            iframeCode: iframeCode,
            externalLink: externalLink
        };

        if (file) {
            updateData.photo = file.filename;
        }

        await Routes.update(updateData, {
            where: { id: routeId }
        });

        console.info("Route successfully updated with ID: " + routeId);
        res.redirect("/tours");
    } catch (err) {
        console.error("Error updating route:", err);
        res.status(500).send("Failed to update the route");
    }
};


exports.likeRoute = async(req, res, next) => {
    try {
        const user = req.user;
        const route = await Routes.findByPk(req.params.routeId);

        if (!user || !route) {
            return res.status(404).json({ message: 'User or Route not found' });
        }

        await user.addRoute(route);
        res.json({ message: 'Route liked!' });
    } catch (error) {
        logger.error("Ошибка при добавлении лайка к маршруту:", error);
        next(error);
    }
};

exports.unlikeRoute = async(req, res, next) => {
    const user = req.user;
    const routeId = req.params.routeId;
    try {
        const route = await Routes.findByPk(routeId);
        if (!user || !route) {
            logger.error("User or Route not found");
            return res.status(404).json({ message: 'User or Route not found' });
        }
        await user.removeRoute(route);
        logger.info("Route unliked successfully");
        res.json({ message: 'Route unliked!' });
    } catch (error) {
        logger.error("Ошибка при удалении лайка с маршрута:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
};

