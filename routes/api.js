const express = require("express");
const router = express.Router();
const { activateBot, testWatson } = require("../controllers");

router.get("/:username", activateBot);

router.get("/test", testWatson);

module.exports = router;
