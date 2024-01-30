const User = require('../models/userModel');
const Expense = require('../models/expenseModel');
const sequelize = require('../util/database');

exports.showLeaderboard = async (req, res) => {

    try {

        const userLeaderboard = await User.findAll({
            attribute: ['id', 'name', 'total_amount'],
            order: [['total_amount', 'DESC']]
        });

        res.status(200).json({ userLeaderboard });

    } catch (err) {
        console.log(err);
    }
}