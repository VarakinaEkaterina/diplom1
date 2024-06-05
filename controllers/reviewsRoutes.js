const logger = require("../logger/index");
const { Routes, ReviewRoutes, ReviewRoutePhoto, Feedback ,ReviewPhoto, ReviewAttractions, Landmarks, User, sequelize } = require("../models/db");


exports.formRoutes = async(req, res, next) => {
    try {
        const routes = await Routes.findAll({
            attributes: ['id', 'name']
        });
        const selectedRouteId = req.query.routeId; 

        res.render("reviewsRoute", {
            title: "Reviews Route",
            routes: routes,
            selectedRouteId: selectedRouteId 
        });
    } catch (error) {
        logger.error("Ошибка при загрузке формы для отзывов маршрутов", error);
        next(error);
    }
};


exports.submitRoutes = async(req, res, next) => {
    const t = await sequelize.transaction(); 

    try {
        const userId = req.user.id; 
        const { route, rating, message } = req.body.reviewsRouteForm; 
        const files = req.files; 

        const newReviewRoute = {
            userId: userId,
            routeId: parseInt(route, 10),
            rating: parseFloat(rating),
            message: message,
            status: 'pending'
        };

        const createdReviewRoute = await ReviewRoutes.create(newReviewRoute, { transaction: t });
        logger.info(`Новый отзыв создан пользователем ${userId}:`, createdReviewRoute);

        if (files && files.length > 0) {
            const photoPromises = files.map(file => {
                return ReviewRoutePhoto.create({
                    reviewRouteId: createdReviewRoute.id, 
                    path: file.filename
                }, { transaction: t });
            });
            await Promise.all(photoPromises);
        }

        await t.commit(); 
        res.redirect("/contacts");
    } catch (err) {
        await t.rollback(); 
        logger.error("Ошибка при отправке отзыва о маршруте:", err);
        next(err);
    }
};

exports.approveReview = async(req, res) => {
    try {
        await ReviewRoutes.update({ status: 'approved' }, {
            where: { id: req.params.reviewId }
        });
        res.redirect('/profile'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка обновления статуса комментария');
    }
};

exports.rejectReview = async(req, res) => {
    try {
        await ReviewRoutes.update({ status: 'rejected' }, {
            where: { id: req.params.reviewId }
        });
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка обновления статуса комментария');
    }
};


exports.deleteReview = async (req, res) => {
    try {
        await ReviewRoutes.destroy({ where: { id: req.params.reviewId } });
        res.redirect('back'); 
    } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
        res.status(500).send('Не удалось удалить комментарий');
    }
};


exports.editReviewForm = async (req, res) => {
    try {
        const review = await ReviewRoutes.findByPk(req.params.reviewId, {
            include: [ReviewRoutePhoto]
        });

        if (!review) {
            return res.status(404).send('Отзыв не найден');
        }

        const routes = await Routes.findAll({
            attributes: ['id', 'name']
        });

        const selectedRouteId = req.query.routeId;

        res.render('editReviewRoutes', {
            review: review,
            routes: routes,
            selectedRouteId: selectedRouteId
        });
    } catch (error) {
        console.error('Ошибка при загрузке формы редактирования отзыва:', error);
        res.status(500).send('Не удалось загрузить форму редактирования отзыва');
    }
};


exports.updateReview = async (req, res) => {
    if (!req.body.reviewsRouteForm) {
        console.error('Form data is missing');
        return res.status(400).send('Form data is missing');
    }

    const { rating, message } = req.body.reviewsRouteForm;
    const reviewId = req.params.reviewId;

    try {
        await ReviewRoutes.update({
            rating: parseFloat(rating),
            message: message,
            status: 'pending'
        }, { where: { id: reviewId } });

        if (req.files && req.files.length > 0) {
            await ReviewRoutePhoto.destroy({ where: { reviewRouteId: reviewId } });

            const photoPromises = req.files.map(file => {
                const filename = file.filename;
                return ReviewRoutePhoto.create({
                    reviewRouteId: reviewId,
                    path: filename
                });
            });
            await Promise.all(photoPromises);
        }

        res.redirect('/profile');
    } catch (error) {
        console.error('Ошибка при обновлении отзыва:', error);
        res.status(500).send('Не удалось обновить отзыв');
    }
};

