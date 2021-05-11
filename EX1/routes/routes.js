const express = require('express');

const appController = require('../controllers/entry');
const router = express.Router();


//POST /entry
router.post('/entry',appController.entry);

//Post /exit
router.post('/exit',appController.exit);

module.exports = router;