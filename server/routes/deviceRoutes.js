const router = require("express").Router();
const DeviceController = require("../controllers/deviceController");

router.post("/register", DeviceController.registerDevice);

module.exports = router;