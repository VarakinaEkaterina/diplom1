const express = require("express");
const router = express.Router();
const path = require('path');

const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');
const landmarks = require('../controllers/landmarks');
const reviews = require('../controllers/reviews');
const route = require('../controllers/route');
const reviewsRoutes = require('../controllers/reviewsRoutes');
const main = require('../controllers/main');
const messages = require("../middleware/messages");
const passport = require("passport");
const ensureAuthenticated = require("../middleware/isAuthenticated");
const ensureAdmin = require("../middleware/isAdmin");

const multer = require('multer');
const { ReviewRoutes } = require("../models/db");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads'); 
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const fileName = 'photo-' + Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Только изображения разрешены!'), false);
    }
};

const limits = {
    fileSize: 5 * 1024 * 1024, 
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});


router.get("/auth/yandex", passport.authenticate("yandex"), function(req, res) {});
router.get("/auth/yandex/callback",
    passport.authenticate("yandex", { failureRedirect: "/login" }),
    function(req, res) { res.redirect("/profile") });

router.get("/auth/google", passport.authenticate("google", { scope: ['profile', 'email'] }));
router.get("/auth/google/callback",
    passport.authenticate("google", { successRedirect: "/profile", failureRedirect: "/login" }));

router.get("/auth/github",
    passport.authenticate("github", { scope: ['user:email'] }));
router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: "/login" }),
    function(req, res) {
        res.redirect('/profile');
    }
);




router.get('/', main.getMainPage);
router.get('/admin/editMainPage', ensureAuthenticated, ensureAdmin, main.editMainPage);
router.post('/admin/editMainPage', ensureAuthenticated, ensureAdmin, upload.fields([
  { name: 'carouselPhoto1', maxCount: 1 },
  { name: 'carouselPhoto2', maxCount: 1 },
  { name: 'carouselPhoto3', maxCount: 1 }
]), main.submitMainPage);


router.get('/questions', (req, res) => {
    res.render('questions');
});





router.get('/tours', route.listRoutes);
router.get('/newRoute',ensureAuthenticated, ensureAdmin, route.form);
router.post("/newRoute", ensureAuthenticated, ensureAdmin, upload.single('photo'), route.submitRoute);
router.get("/routes/:routeId", route.showRoute);
router.post("/deleteRoute/:routeId", ensureAdmin, route.deleteRoute);
router.get("/editRoute/:routeId", ensureAdmin, route.updateRouteForm);
router.post("/editRoute/:routeId", ensureAdmin, upload.single('photo'), route.updateRouteSubmit);
router.post('/like-route/:routeId', route.likeRoute);
router.delete('/unlike-route/:routeId', route.unlikeRoute);

router.get("/attractions", messages, landmarks.list);
router.get("/newLandmarks", ensureAuthenticated, ensureAdmin, landmarks.form);
router.post("/newLandmarks", ensureAuthenticated, ensureAdmin, upload.single('photo'), landmarks.submit);
router.get("/landmarks/:landmarksId", landmarks.show);
router.post("/delete/:landmarksId", ensureAdmin, landmarks.delete);
router.get("/edit/:landmarksId", ensureAdmin, landmarks.updateForm);
router.post("/edit/:landmarksId", ensureAdmin, upload.single('photo'), landmarks.updateSubmit);
router.post('/like-landmarks/:landmarksId', landmarks.likeLandmarks);
router.delete('/unlike-landmarks/:landmarksId', landmarks.unlikeLandmarks);

router.get("/profile", loginController.form);
router.post("/profile", loginController.submit);
router.get("/logout", loginController.logout);
router.get("/profile/register", registerController.form);
router.post("/profile/register", registerController.submit);

router.get('/contacts', reviews.list);
router.get('/contacts/feedback', reviews.formFeedback);
router.post('/contacts/feedback', reviews.submitFeedback);
router.get('/contacts/reviews', ensureAuthenticated, reviews.show);

router.get('/reviews/reviewsAttraction', ensureAuthenticated, reviews.formAttraction);
router.post('/reviews/reviewsAttraction', ensureAuthenticated, upload.array('photos', 5), reviews.submitAttraction);
router.post('/reviews/delete/landmarks/:reviewId', reviews.deleteReview);
router.get('/reviews/edit/landmarks/:reviewId', reviews.editReviewForm);
router.post('/reviews/edit/landmarks/:reviewId', upload.array('photos', 5), reviews.updateReview);
router.post('/reviews/approve/landmarks/:reviewId', ensureAdmin, reviews.approveReview);
router.post('/reviews/reject/landmarks/:reviewId', ensureAdmin, reviews.rejectReview);

router.get('/reviews/reviewsRoutes', ensureAuthenticated, reviewsRoutes.formRoutes);
router.post('/reviews/reviewsRoutes', ensureAuthenticated, upload.array('photos', 5), reviewsRoutes.submitRoutes);

router.post('/reviews/delete/routes/:reviewId', reviewsRoutes.deleteReview);
router.get('/reviews/edit/routes/:reviewId', reviewsRoutes.editReviewForm);
router.post('/reviews/edit/routes/:reviewId', upload.array('photos', 5), reviewsRoutes.updateReview);
router.post('/reviews/approve/routes/:reviewId', ensureAdmin, reviewsRoutes.approveReview);
router.post('/reviews/reject/routes/:reviewId', ensureAdmin, reviewsRoutes.rejectReview);

module.exports = router;