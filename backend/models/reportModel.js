const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Report = sequelize.define('report', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
    }
});

module.exports = Report;