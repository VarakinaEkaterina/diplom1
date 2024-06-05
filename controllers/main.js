const { Main, Routes } = require('../models/db');

exports.getMainPage = async (req, res) => {
    try {
        const mainPage = await Main.findOne();
        const routesIds = [
            mainPage?.routeCard1Id ?? null,
            mainPage?.routeCard2Id ?? null,
            mainPage?.routeCard3Id ?? null
        ].filter(id => id !== null);

        const routes = routesIds.length > 0 ? await Routes.findAll({
            where: {
                id: routesIds
            }
        }) : [];

        const routesMap = routes.reduce((acc, route) => {
            acc[route.id] = route;
            return acc;
        }, {});

        const routesArray = [
            routesMap[mainPage?.routeCard1Id] || null,
            routesMap[mainPage?.routeCard2Id] || null,
            routesMap[mainPage?.routeCard3Id] || null
        ];

        res.render('index', {
            mainPage: mainPage || {},
            routes: routesArray
        });
    } catch (error) {
        console.error("Failed to load the main page:", error);
        res.status(500).send("Failed to load the main page.");
    }
};

exports.editMainPage = async (req, res) => {
    try {
        const mainPage = await Main.findOne();
        const routes = await Routes.findAll();

        res.render('editMainPage', {
            mainPage,
            routes
        });
    } catch (error) {
        console.error("Failed to load the edit main page form:", error);
        res.status(500).send("Failed to load the edit main page form.");
    }
};

exports.submitMainPage = async (req, res) => {
    try {
        const { carouselTitle1, carouselSubtitle1, carouselTitle2, carouselSubtitle2, carouselTitle3, carouselSubtitle3, routeCard1Id, routeCard2Id, routeCard3Id } = req.body;
        
        const mainPage = await Main.findOne();
        const updateData = {
            carouselTitle1,
            carouselSubtitle1,
            carouselTitle2,
            carouselSubtitle2,
            carouselTitle3,
            carouselSubtitle3,
            routeCard1Id,
            routeCard2Id,
            routeCard3Id
        };

        if (req.files.carouselPhoto1) {
            updateData.carouselPhoto1 = req.files.carouselPhoto1[0].filename;
        }
        if (req.files.carouselPhoto2) {
            updateData.carouselPhoto2 = req.files.carouselPhoto2[0].filename;
        }
        if (req.files.carouselPhoto3) {
            updateData.carouselPhoto3 = req.files.carouselPhoto3[0].filename;
        }

        if (mainPage) {
            await mainPage.update(updateData);
        } else {
            await Main.create(updateData);
        }

        res.redirect('/');
    } catch (error) {
        console.error("Failed to submit the main page data:", error);
        res.status(500).send("Failed to submit the main page data.");
    }
};
