const express = require('express');

const expenseController = require('../controllers/expense.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

router.post('/addExpense', auth.authenticate, expenseController.addExpense);

router.get('/getExpenses', auth.authenticate , expenseController.getExpenses);

router.post('/deleteExpense/:id', auth.authenticate , expenseController.deleteExpense);

router.get('/download', auth.authenticate, expenseController.downloadExpenses);

router.post('/saveURL', auth.authenticate, expenseController.saveURL);

router.get('/showHistory', auth.authenticate, expenseController.getHistory);

module.exports = router;