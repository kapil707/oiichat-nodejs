const express = require("express");
const {fetchOldMessages} = require("../controllers/chatController");

const router = express.Router();

router.route("/fetchOldMessages").post(fetchOldMessages);

module.exports = router;