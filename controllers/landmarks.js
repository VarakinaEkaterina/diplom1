const logger = require("../logger/index");
const { Landmarks } = require("../models/db");
const { ReviewAttractions } = require("../models/db");
const { User } = require("../models/db");
const { ReviewPhoto } = require("../models/db");

exports.list = async (req, res, next) => {
    try {
        const sortType = req.query.sortType || 'default';
        let filterOptions = {};

        if (sortType !== 'default') {
            filterOptions.type = sortType;
        }

        const landmarks = await Landmarks.findAll({
            where: filterOptions,
            include: [{
                model: ReviewAttractions,
                required: false, 
                where: { status: 'approved' }, 
                include: [
                    { model: User, attributes: ['name', 'email'] },
                    { model: ReviewPhoto }
                ]
            }]
        });

        const user = req.user;

        let likedLandmarksIds = [];
        if (user) {
            const likedLandmarks = await user.getLandmarks();
            likedLandmarksIds = likedLandmarks.map(landmark => landmark.id);
        }

        const enhancedLandmarks = landmarks.map(landmark => {
            const reviews = landmark.ReviewAttractions || [];
            const averageRating = reviews.length > 0 ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length : 0;
            const likedByCurrentUser = likedLandmarksIds.includes(landmark.id);

            return {
                ...landmark.toJSON(),
                reviews,
                averageRating,
                likedByCurrentUser
            };
        });

        res.render("attractions", { title: "List", landmarks: enhancedLandmarks, user: user, sortType: sortType });
    } catch (err) {
        logger.error("Ошибка при получении записей:", err);
        res.status(500).send("Ошибка при загрузке страницы");
    }
};





exports.form = (req, res) => {
    logger.warn("Зашли на страницу создания постов");
    res.render("newLandmark", { title: "New Landmark" });
};

exports.submit = async(req, res, next) => {
    try {
        const username = req.user ? req.user.name : null; 
        const userEmail = req.user ? req.user.email : null;

        const data = req.body.newLandmarksForm;
        const file = req.file; 

        const newLandmarksForm = {
            username: userEmail,
            name: data.name,
            type: data.type,
            description: data.description,
            descriptionFull: data.descriptionFull,
            numberOnMap: data.number,
            photo: file ? file.filename : null,
        };

        await Landmarks.create(newLandmarksForm);
        logger.info(`Новая запись создана пользователем ${username}:`, newLandmarksForm);

        res.redirect("/attractions");
    } catch (err) {
        logger.error("Ошибка при создании записи:", err);
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    const landmarksId = req.params.landmarksId;
    try {
        await Landmarks.destroy({ where: { id: landmarksId } });
        logger.info("Landmark successfully deleted.");
        res.redirect("/attractions");
    } catch (err) {
        logger.error("Error deleting landmarks:", err);
        res.status(500).send("Error deleting the landmark.");
    }
};


exports.updateForm = async (req, res) => {
    const landmarksId = req.params.landmarksId;
    try {
        const landmarks = await Landmarks.findByPk(landmarksId); 

        if (!landmarks) {
            logger.error("Ошибка при получении записи для обновления: запись не найдена");
            return res.status(404).send("Landmark not found.");
        }

        res.render("updateLandmarks", { title: "Update Landmark", landmarks: landmarks });
    } catch (err) {
        logger.error("Ошибка при получении записи для обновления:", err);
        res.status(500).redirect("/");
    }
};

exports.updateSubmit = async (req, res) => {
    
    const landmarksId = req.params.landmarksId;
    if (!req.body.newLandmarksForm) {
        console.error('Form data is missing');
        return res.status(400).send('Form data is missing');
    }

    const { name, type, description, descriptionFull, numberOnMap } = req.body.newLandmarksForm;
    const file = req.file; 
    try {
        const updateData = {
            name: name,
            type: type,
            description: description,
            descriptionFull: descriptionFull,
            numberOnMap: numberOnMap,
        };

        if (file) {
            updateData.photo = file.filename;
        }

        const result = await Landmarks.update(updateData, {
            where: { id: landmarksId }
        });

        if (result[0] === 0) { 
            logger.error("No updates performed. Landmark not found.");
            return res.status(404).send("Landmark not found.");
        }

        logger.info("Landmark successfully updated");
        res.redirect("/attractions"); 
    } catch (err) {
        logger.error("Ошибка при обновлении достопримечательности:", err);
        res.status(500).send("Failed to update the landmark");
    }
};



exports.likeLandmarks = async(req, res, next) => {
    try {
        const user = req.user;
        const landmarks = await Landmarks.findByPk(req.params.landmarksId);

        if (!user || !landmarks) {
            return res.status(404).json({ message: 'User or Landmarks not found' });
        }

        await user.addLandmarks(landmarks);
        res.json({ message: 'Landmarks liked!' });
    } catch (error) {
        logger.error("Ошибка при добавлении лайка:", error);
        next(error);
    }
};

exports.unlikeLandmarks = async(req, res, next) => {
    const user = req.user;
    const landmarksId = req.params.landmarksId;
    try {
        const landmarks = await Landmarks.findByPk(landmarksId);
        if (!user || !landmarks) {
            logger.error("User or Landmarks not found");
            return res.status(404).json({ message: 'User or Landmarks not found' });
        }
        await user.removeLandmarks(landmarks);
        logger.info("Landmarks unliked successfully");
        res.json({ message: 'Landmarks unliked!' });
    } catch (error) {
        logger.error("Ошибка при удалении лайка:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
};

exports.show = async(req, res, next) => {
    try {
        const landmarksId = req.params.landmarksId;
        const landmarks = await Landmarks.findByPk(landmarksId, {
            include: [{
                model: ReviewAttractions,
                required: false,  
                where: { status: 'approved' },
                include: [
                    { model: User, attributes: ['name', 'email'] },
                    { model: ReviewPhoto }
                ]
            }]
        });

        if (!landmarks) {
            logger.error("Landmarks not found");
            return res.status(404).json({ message: 'Landmarks not found' });
        }

        const reviews = landmarks.ReviewAttractions || [];
        const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1);

        const formattedDescriptionFull = landmarks.descriptionFull
        .split(/\r?\n/) 
        .filter(line => line.trim().length > 0)  
        .map(line => `<p>${line.trim()}</p>`) 
        .join('');

        res.render("landmarks", { title: "Landmarks", landmarks: landmarks, reviews: reviews, averageRating: averageRating, formattedDescriptionFull: formattedDescriptionFull });

    } catch (error) {
        logger.error("Ошибка при получении записи:", error);
        return next(error);
    }
};