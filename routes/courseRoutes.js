const express=require("express");
const router=express.Router();

const {createCourse,getAllCourses,getCourseDetail}=require("../controllers/Courses");
const {createSection,updateSection,deleteSection}=require("../controllers/Sections");
const {createSubSection,updateSubsection,deleteSubsection }=require("../controllers/SubSections");
const {createRatingAndReview,getAverageRating,getAllRating}=require("../controllers/RatingAndReviews");
const {createCategory,showAllCategories,categoryPageDetails}=require("../controllers/Categories");

const {auth,isAdmin,isStudent,isInstructor}=require("../middlewares/auth");

//***********************************Courses Routes********************************/
router.post("/create-course",auth,isInstructor,createCourse);
router.get("/get-all-courses",getAllCourses);
router.post("/get-course-detail",getCourseDetail);

//*******************************Section Routes******************************/
router.post("/create-section",auth,isInstructor,createSection);
router.post("/update-section",auth,isInstructor,updateSection);
router.post("/delete-section",auth,isInstructor,deleteSection);

//*********************************Subsection Routes*****************************/
router.post("/create-subSection",auth,isInstructor,createSubSection);
router.post("/update-subsection",auth,isInstructor,updateSubsection);
router.post("/delete-subsection",auth,isInstructor,deleteSubsection);

//**********************************Category routes*******************************/
router.post("/create-category",auth,isAdmin,createCategory);
router.get("/show-all-categories",showAllCategories);
router.post("/category-page-details",categoryPageDetails);

//***********************************Rating And Reviews*****************************/
router.post("/create-rating-and-review",auth,isStudent,createRatingAndReview);
router.get("/get-average-rating",getAverageRating);
router.get("/get-all-rating",getAllRating);

module.exports=router;
