const logger = require("../logger/index");
require("dotenv").config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'base.db',
    logging: false,
});

//************ORM class User********* */

const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    appId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
    age: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    role: {
        type: Sequelize.STRING,
        defaultValue: 'user'
    },
    timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    timestamps: false
});

//************ORM class Landmarks********* */

const Landmarks = sequelize.define("Landmarks", {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        allowNull: true
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    descriptionFull: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    photo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
}, { timestamps: false });

User.belongsToMany(Landmarks, { through: 'UserLandmarks' });
Landmarks.belongsToMany(User, { through: 'UserLandmarks' });


//************ORM class ReviewAttractions********* */

const ReviewAttractions = sequelize.define("ReviewAttractions", {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    landmarksId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Landmarks',
            key: 'id'
        }
    },
    rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'pending', 
        allowNull: false
    },
}, {
    timestamps: true
});


User.hasMany(ReviewAttractions, { foreignKey: 'userId' });
ReviewAttractions.belongsTo(User, { foreignKey: 'userId' });

Landmarks.hasMany(ReviewAttractions, { foreignKey: 'landmarksId' });
ReviewAttractions.belongsTo(Landmarks, { foreignKey: 'landmarksId' });



//************ORM class ReviewPhoto********* */

const ReviewPhoto = sequelize.define('ReviewPhoto', {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    reviewAttractionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'ReviewAttractions',
            key: 'id'
        }
    },
    path: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

ReviewAttractions.hasMany(ReviewPhoto, { foreignKey: 'reviewAttractionId' });
ReviewPhoto.belongsTo(ReviewAttractions, { foreignKey: 'reviewAttractionId' });


//************ORM class Feedback********* */

const Feedback = sequelize.define("Feedback", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5 
        }
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    timestamps: true 
});


//************ORM class Routes********* */

const Routes = sequelize.define("Routes", {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    descriptionFull: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    iframeCode: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    photo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
}, { timestamps: false });

User.belongsToMany(Routes, { through: 'UserRoutes' });
Routes.belongsToMany(User, { through: 'UserRoutes' });

//************ORM class ReviewRoutes********* */

const ReviewRoutes = sequelize.define("ReviewRoutes", {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    routeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Routes',
            key: 'id'
        }
    },
    rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'pending', 
        allowNull: false
    },
}, {
    timestamps: true
});

User.hasMany(ReviewRoutes, { foreignKey: 'userId' });
ReviewRoutes.belongsTo(User, { foreignKey: 'userId' });

Routes.hasMany(ReviewRoutes, { foreignKey: 'routeId' });
ReviewRoutes.belongsTo(Routes, { foreignKey: 'routeId' });

//************ORM class ReviewRoutePhoto********* */

const ReviewRoutePhoto = sequelize.define('ReviewRoutePhoto', {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    reviewRouteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'ReviewRoutes',
            key: 'id'
        }
    },
    path: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

ReviewRoutes.hasMany(ReviewRoutePhoto, { foreignKey: 'reviewRouteId' });
ReviewRoutePhoto.belongsTo(ReviewRoutes, { foreignKey: 'reviewRouteId' });

//************ORM class Main********* */

const Main = sequelize.define('Main', {
    carouselPhoto1: {
        type: Sequelize.STRING,
        allowNull: false
    },
    carouselTitle1: {
        type: Sequelize.STRING,
        allowNull: false
    },
    carouselSubtitle1: {
        type: Sequelize.STRING,
        allowNull: false
    },
    carouselPhoto2: {
        type: Sequelize.STRING,
        allowNull: false
    },
    carouselTitle2: {
        type: Sequelize.STRING,
        allowNull: false
    },
    carouselSubtitle2: {
        type: Sequelize.STRING,
        allowNull: false
    },
    carouselPhoto3: {
        type: Sequelize.STRING,
        allowNull: false
    },
    carouselTitle3: {
        type: Sequelize.STRING,
        allowNull: false
    },
    carouselSubtitle3: {
        type: Sequelize.STRING,
        allowNull: false
    },
    routeCard1Id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Routes',
            key: 'id'
        }
    },
    routeCard2Id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Routes',
            key: 'id'
        }
    },
    routeCard3Id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Routes',
            key: 'id'
        }
    }
}, {
    timestamps: false
});



// Синхронизация моделей с базой данных
sequelize.sync().then(() => {
    logger.info("Tables have been created if they did not already exist.");
}).catch((error) => {
    logger.error("Failed to synchronize the database:", error);
});

module.exports = { Main,Routes, ReviewRoutes, ReviewRoutePhoto, Feedback ,ReviewPhoto, ReviewAttractions, Landmarks, User, sequelize }