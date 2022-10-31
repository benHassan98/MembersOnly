const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.get("/all", messageController.message_list);

router.post("/create", messageController.message_create);

router.post("/delete/:id", messageController.message_delete);

module.exports = router;
