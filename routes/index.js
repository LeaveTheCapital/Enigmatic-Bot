const express = require("express");
const router = express.Router();
const { activateBot, testInsights } = require("../controllers");

router.get("/", activateBot);

router.get("/test", testInsights);

module.exports = router;
