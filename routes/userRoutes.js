const express= require("express");
const router = express.Router();

const userController = require("../controllers/user-controller");

// // Register Page
router.get("/register", userController.getRegister);
router.post("/register", userController.postRegister);




module.exports = router;