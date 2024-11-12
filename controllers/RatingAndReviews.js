const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

//create ratingReview
exports.createRatingAndReview=async (req,res)=>{
    try{
       //fetch courseId, userId, rating, review 
       const {courseId,rating,review}=req.body;
       const userId=req.user.id;

       if(!courseId || !rating || !review || !userId){
        return res.status(401).json({
            success:false,
            message:"All fields are required"
        })
       }

       //validate course
       //check if user is enrolled or not
       const courseDetails=await Course.findOne({_id:courseId,
    studentsEnrolled:{$elemMatch :{$eq :userId}}});
       if(!courseDetails){
        return res.status(401).json({
            success:false,
            message:"Student is not enrolled in course"
        })
       }
       
      
       //check if user has already given rating and reviews
       const alreadyRRGiven=await RatingAndReview.findOne({course:courseId,user:userId});

       if(alreadyRRGiven){
        return res.status(401).json({
            success:false,
            message:"User has already given ratings and review"
        })
       }
       //create rating and review document
       const newRating=await RatingAndReview.create({
        user:userId,
        course:courseId,
        rating,
        review

    });

       //update course
       const updatedCourse=await Course.findByIdAndUpdate({_id:courseId},
        {
            $push:{ ratingAndReview :newRating._id}
        },
        {new:true}
        )
       //return response
       res.status(200).json({
        success:true,
        message:"Rating and review created successfully",
        data:newRating
    })

    }catch(error){
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:"Error while creating rating and reviews",
            error:error.message 
        })
    }
}

//getAverageRating
exports.getAverageRating=async (req,res)=>{
    try{
        //fetch course id
        const {courseId}=req.body;
        //find average
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }

        ]);
        // return rating
        if(result.length>0){
          return res.status(200).json({
            success:true,
            averageRating:result[0].averageRating,
          })
        }

        //If no rating exist 
        return res.status(200).json({
            success:true,
            averageRating:0,
            message:"Average rating is 0 , no rating given till now"
        })

    }catch(error){
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:"Error while averaging rating",
            error:error.message 
        })
    }
}


//getAllRating

exports.getAllRating=async (req,res)=>{
    try{
        //fetch all ratings
        const allRatingsAndReviews=await RatingAndReview.find({})
        .sort({rating:"desc"})
        .populate({
            path:"user",
            select:"firstName lastName email image"
        })
        .populate({
            path:"course",
            select:"courseName"
        }).exec();

        return res.status(200).json({
            success:true,
            message:"Rating and reviews fetched successfully",
            allRatingsAndReviews
        })
    }catch(error){
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:"Error while fetching rating and review",
            error:error.message 
        })
    }
}