const express = require('express')
const router = express.Router();
const activateBot = require('../controllers')

router.get('/:username', activateBot)

module.exports = router;