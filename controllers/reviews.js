const { log } = require("winston");
const path = require("path");
const logger = require("../logger/index");
const { ReviewAttractions, Landmarks, User, ReviewPhoto, Feedback, sequelize } = require("../models/db");


exports.list = (req, res) => {
    res.render("contacts", { title: "Contacts" });
};

exports.show = (req, res) => {
    res.render("reviews", { title: "Reviews" });
};

exports.formAttraction = async(req, res, next) => {
    try {
        const landmarks = await Landmarks.findAll({
            attributes: ['id', 'name']
        });
        const selectedLandmarkId = req.query.landmarkId; 

        res.render("reviewsAttraction", {
            title: "Reviews Attraction",
            landmarks: landmarks,
            selectedLandmarkId: selectedLandmarkId 
        });
    } catch (error) {
        logger.error("Ошибка при загрузке формы", error);
        next(error);
    }
};


exports.submitAttraction = async(req, res, next) => {
    const t = await sequelize.transaction(); 

    try {
        const userId = req.user.id; 
        const { attraction, rating, message } = req.body.reviewsAttractionForm; 
        const files = req.files; 

        const newReviewAttraction = {
            userId: userId,
            landmarksId: parseInt(attraction, 10),
            rating: parseFloat(rating),
            message: message,
            status: 'pending'
        };

        const createdReviewAttraction = await ReviewAttractions.create(newReviewAttraction, { transaction: t });
        logger.info(`Новая запись создана пользователем ${userId}:`, createdReviewAttraction);

        if (files && files.length > 0) {
            const photoPromises = files.map(file => {
                return ReviewPhoto.create({
                    reviewAttractionId: createdReviewAttraction.id, 
                    path: file.filename
                }, { transaction: t });
            });
            await Promise.all(photoPromises);
        }

        await t.commit(); 
        res.redirect("/contacts");
    } catch (err) {
        await t.rollback(); 
        logger.error("Ошибка при отправке комментария:", err);
        next(err);
    }
};


exports.formFeedback = async(req, res, next) => {
    try {
        res.render("Feedback", {
            title: "Reviews Feedback",
        });
    } catch (error) {
        logger.error("Ошибка при загрузке формы", error);
        next(error);
    }
};

exports.submitFeedback = async (req, res, next) => {
    try {
        const { name, email, rating, message } = req.body;
        await Feedback.create({
            name: name,
            email: email,
            rating: rating,
            message: message
        });
        res.redirect('/contacts'); 
    } catch (error) {
        console.error('Ошибка при сохранении обратной связи:', error);
        res.status(500).send('Ошибка при обработке вашего запроса');
    }
};


exports.approveReview = async(req, res) => {
    try {
        await ReviewAttractions.update({ status: 'approved' }, {
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
        await ReviewAttractions.update({ status: 'rejected' }, {
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
        await ReviewAttractions.destroy({ where: { id: req.params.reviewId } });
        res.redirect('back'); 
    } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
        res.status(500).send('Не удалось удалить комментарий');
    }
};

exports.editReviewForm = async (req, res) => {
    const review = await ReviewAttractions.findByPk(req.params.reviewId, {
        include: [ReviewPhoto]
      });
    const landmarks = await Landmarks.findAll({
        attributes: ['id', 'name']
    });
    const selectedLandmarkId = req.query.landmarkId; 
    res.render('editReview', { 
        review: review,             
        landmarks: landmarks,
        selectedLandmarkId: selectedLandmarkId 
    });
};

exports.updateReview = async (req, res) => {
    if (!req.body.reviewsAttractionForm) {
        console.error('Form data is missing');
        return res.status(400).send('Form data is missing');
    }

    const { rating, message } = req.body.reviewsAttractionForm;
    const reviewId = req.params.reviewId;

    try {
        await ReviewAttractions.update({
            rating: parseFloat(rating), 
            message: message,
            status: 'pending' 
        }, { where: { id: reviewId } });

        if (req.files && req.files.length > 0) {
            await ReviewPhoto.destroy({ where: { reviewAttractionId: reviewId } });

            const photoPromises = req.files.map(file => {
                const filename = file.filename; 
                return ReviewPhoto.create({
                    reviewAttractionId: reviewId,
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

