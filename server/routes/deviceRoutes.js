const router = require("express").Router();
const DeviceController = require("../controllers/deviceController");

router.post("/register", DeviceController.registerDevice);
router.get("/get-all-devices", DeviceController.getDevices);
router.post("/update-device-status", DeviceController.updateDeviceStatus);

router.get("/details", DeviceController.getDeviceDetails);

module.exports = router;