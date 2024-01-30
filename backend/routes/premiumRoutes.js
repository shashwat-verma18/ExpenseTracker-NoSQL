const express = require('express');

const premiumController = require('../controllers/premium.js');
const premiumFeatureController = require('../controllers/premiumFeatures.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

router.get('/premiumMembership', auth.authenticate, premiumController.purchasePremium);

router.post('/updateTransactionStatus', auth.authenticate, premiumController.updatePrmium);

router.get('/showLeaderboard', auth.authenticate, premiumFeatureController.showLeaderboard);

module.exports = router;