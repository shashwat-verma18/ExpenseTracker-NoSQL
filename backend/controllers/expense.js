const Expense = require('../models/expenseModel');
const Report = require('../models/reportModel');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');

exports.addExpense = async (req, res, next) => {

    const t = await sequelize.transaction();

    const amount = req.body.amount;
    const description = req.body.des;
    const category = req.body.cat;
    const userId = req.user.id;
    

    try {
        const expense = await Expense.create({ amount, description, category, userId }, { transaction: t });

        // const user = await User.findOne({ where: { id: userId } });

        var total = req.user.total_amount || 0;
        total = +total + +amount;

        await req.user.update({ total_amount: total }, { transaction: t });

        await t.commit();

        res.status(200).json({ expense, success: true });
    } catch (err) {
        await t.rollback();
        console.log(err.toString());
        res.status(500).json({ error: err, success: false });
    }

};

exports.getExpenses = async (req, res, next) => {

    const page = req.query.page || 1;
    const perPageLimit = req.query.perPage;
    const perPage = Number(`${perPageLimit}`);
    

    try {

        const total = await Expense.count({where : {userId: req.user.id}});

        const expenses = await Expense.findAll({ 
            where: { userId: req.user.id },
            offset: (page-1) * 10,
            limit: perPage
        });
        res.status(200).json({ 
            expenses,
            currentPage: page,
            hasNextPage: perPage*page < total,
            nextPage: +page + 1,
            hasPreviousPage: page > 1,
            previousPage: +page-1,
            lastPage: Math.ceil(total / perPage),
            success: true 
        });
    } catch (err) {
        res.status(500).json({ error: err, success: false });
    }

}

exports.deleteExpense = async (req, res, next) => {

    const t = await sequelize.transaction();

    const id = req.params.id;
    const userId = req.user.id;

    try {

        var amt = await Expense.findOne({ where: { id: id, userId: userId }, attributes: ['amount'] });

        console.log(req.user.total_amount);
        console.log(amt.amount);

        var total = req.user.total_amount - +amt.amount;

        await req.user.update({ total_amount: total }, { transaction: t });

        const exp = await Expense.destroy({
            where: {
                id: id,
                userId: userId
            },
            transaction: t
        });

        await t.commit();

        res.status(200).json({ success: true });

    } catch (err) {
        await t.rollback();
        console.log(err);
    }
}

exports.downloadExpenses = async (req, res) =>{ 
    try{
        const expenses = await req.user.getExpenses();
        const stringifiedExpenses = JSON.stringify(expenses)
        
        const userId = req.user.id;

        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await uploadToS3(stringifiedExpenses, filename);

        res.status(200).json({fileURL, success:true});
    }catch(err){
        console.log(err);
    }
}

function uploadToS3(data, filename){
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    });

    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if(err){
                console.log("Somwthing went wrong ",err);
                reject(err);
            }else{
                console.log('success ',s3response);
                resolve(s3response.Location);
            }
        })
    });
    
}

exports.saveURL = async (req, res, next) => {
    
    const userId = req.user.id;
    const url = req.body.url;
    

    try {
        const report = await Report.create({ userId, url});

        res.status(200).json({ report, success: true });
    } catch (err) {
        console.log(err.toString());
    }

}

exports.getHistory = async (req, res) => {
    console.log('getHistory');

    try {
        const history = await Report.findAll({ where: { userId: req.user.id } });
        res.status(200).json({ history, success: true });
    } catch (err) {
        res.status(500).json({ error: err, success: false });
    }
}

