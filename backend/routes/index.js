const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

router.post("/signup", indexController.signup);

router.post("/become_admin", indexController.become_admin);

router.post("/become_member", indexController.become_member);

router.post("/login", indexController.login);

router.post("/logout", indexController.logout);

router.post("/check_token", indexController.check_token);

router.post("/user", indexController.user);

module.exports = router;
