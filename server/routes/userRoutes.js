const router = require("express").Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);

router.get("/get-user", userController.getUser);


router.post("/send-command", userController.sendCommand);

module.exports = router;