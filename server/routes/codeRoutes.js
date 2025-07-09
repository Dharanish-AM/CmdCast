const router = require("express").Router();
const codeController = require("../controllers/codeController");

router.post("/generate", codeController.generateCode);
router.post("/verify", codeController.verifyCode);
router.get("/get-all-codes", codeController.getAllCodes);

module.exports = router;