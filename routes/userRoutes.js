const express=require('express');
const router=express.Router();


const {sendOTP,signup,login,changePassword}=require('../controllers/Auth');
const {resetPasswordToken,resetPassword}=require('../controllers/ResetPassword');
const {auth}=require("../middlewares/auth");

// ********************** User Routes ********************************


router.post("/sendOTP",sendOTP);
router.post("/signup",signup);
router.post("/login",login);
router.post("/change-password",auth,changePassword);


//**************************Reset Password Routes************************************/

router.post("/reset-password-token",resetPasswordToken);
router.post("/reset-password",resetPassword);

module.exports=router;
