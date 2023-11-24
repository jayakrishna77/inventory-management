const express = require('express');

const {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    loggedIn,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/userController");
const protect = require('../middleWares/authMiddleWare');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loggedIn);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;