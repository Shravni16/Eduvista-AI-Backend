const User = require("../models/User");
const Category = require("../models/Category");
require("dotenv").config();
const { uploadImageToCloudinary } = require("../utility/imageUploader");
const Course = require("../models/Course");

//create courses
exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDesc, whatYouWillLearn, price, tag, category } =
      req.body;
    const thumbnail = req.files.thumbnail;

    //validate
    if (
      !courseName ||
      !courseDesc ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail ||
      !category
    ) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }

    //*****check if user is instructor (what is need)
    const userID = req.user.id;
    const instructorDetails = await User.findById(userID);

    if (!instructorDetails) {
      return res.status(401).json({
        success: false,
        message: "Instructor detaills not found",
      });
    }
    console.log("Instructor details : ", instructorDetails);

    //******check if tag is valid (why id)
    const categorydetails = await Category.findById(category);
    if (!categorydetails) {
      return res.status(401).json({
        success: false,
        message: "TCategory detaills not found",
      });
    }
    console.log("Category details : ", categorydetails);

    //upload image to cloudinary
    const thumbnail_uploaded = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER
    );

    //create entry in database
    const new_course_created = await Course.create({
      courseName,
      courseDesc,
      whatYouWillLearn,
      price,
      tag,
      category: categorydetails._id,
      thumbnail: thumbnail_uploaded.secure_url,
      instructor: instructorDetails._id,
    });

    //add entry in instructor user cources
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: new_course_created._id } },
      { new: true }
    );

    //add course in tag schema
    await Category.findByIdAndUpdate(
      { _id: categorydetails._id },
      { $push: { courses: new_course_created._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Course created successfully",
    });
  } catch (error) {
    console.log(error),
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Error while creating course",
      });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentsEnrolled: true,
        category: true,
      }
    );
    res.status(200).json({
      success: true,
      courses: allCourses,
      message: "All courses returend successfully",
    });
  } catch (error) {
    console.log(error),
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Error while displaying courses",
      });
  }
};

//getCourseDetail
exports.getCourseDetail = async (req, res) => {
  try {
    //fetch courseId from request body
    const { courseId } = req.body;
    //fetch data and populate
    const courseDetails = await Course.find({ _id: courseId })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("ratingAndReview")
      .populate("category")
      .exec();

      if(!courseDetails){
        return res.status(400).json({
          success:false,
          message:`Could not find the course with ${courseId}`
        })
      }
         
      return res.status(200).json({
        success:true,
        message:`Course details fetched successfully`,
        data:courseDetails
      })

  } catch (error) {
    console.log(error),
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while fetching course details",
    });
  }
};
