const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ForgetPasswordRequests = sequelize.define('forgetPasswordRequests', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    userId: Sequelize.INTEGER,
    isActive: Sequelize.BOOLEAN
});

module.exports = ForgetPasswordRequests;