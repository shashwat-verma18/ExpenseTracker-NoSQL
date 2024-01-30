const express = require('express');

const userController = require('../controllers/user.js');
// const passwordController = require('../controllers/password.js');


const router = express.Router();

router.post('/addUser', userController.addUser);

router.post('/loginUser', userController.loginUser);

// router.post('/password/forgotPassword', passwordController.resetPassword);

// router.get('/password/resetPassword/:id', passwordController.viewPage);

// router.post('/password/updatePassword', passwordController.updatePassword);

module.exports = router;