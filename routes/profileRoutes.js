const express=require("express");
const router=express.Router();

const {updateProfile,deleteAccount,getAllUserDetails,updateDisplayPicture ,getEnrolledCourses}=require("../controllers/Profiles");
const {auth}=require("../middlewares/auth");

//*******************************Profile Routes****************************/

router.put("/update-profile",auth,updateProfile);
router.delete("/delete-account",auth,deleteAccount);
router.get("/get-all-user-details",auth,getAllUserDetails);
router.put("/update-display-picture",auth,updateDisplayPicture);
router.get("/get-enrolled-courses",auth,getEnrolledCourses);

module.exports=router;