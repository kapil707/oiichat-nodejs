const express = require("express");
const {fetchOldMessages,getAllUser} = require("../controllers/chatController");

const router = express.Router();

router.route("/fetchOldMessages").post(fetchOldMessages);
router.route("/getAllUser").post(getAllUser);

module.exports = router;