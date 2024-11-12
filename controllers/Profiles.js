const Profile=require("../models/Profile");
const User=require("../models/User");
const Course=require("../models/Course");
const { uploadImageToCloudinary } = require("../utility/imageUploader");

exports.updateProfile=async (req,res)=>{
    try{
      //fetch data
      const {gender,dateOfBirth="",about=""}=req.body;
      const id=req.user.id;

      //validate
      if(!gender || !id){
        return res.status(401).json({
            success: false,
            message: "All Fields are required",
          });
      }

      //fetch user details
      const userDetails=await User.findById(id);
      const profileID =userDetails.additionalDetails;

      //fetch profile details
      const profileDetails=await Profile.findByIdAndUpdate({_id:profileID},{gender,dateOfBirth,about},{new:true});

      //update detials
      // profileDetails.gender=gender;
      // profileDetails.dateOfBirth=dateOfBirth;
      // profileDetails.about=about;

      // //save in db
      // await profileDetails.save();



      //return response
      return res.status(200).json({
        success:true,
        message:"Profile Updated Successfully"
      })

    }catch(error){
      console.log(error.message);
      return res.status(500).json({
        success: false,
        message: "Error while updating profile",
      });
    }
}

exports.deleteAccount=async (req,res)=>{
  try{
 ///fetch data
 const userId=req.user.id;
 //validate
 if(!userId){
  return res.status(401).json({
    success: false,
    message: "All Fields are required",
  });
 }
 //check if user exist
 const userDetails=await User.findById(userId);
 if(!userDetails){
  return res.status(401).json({
    success: false,
    message: "User Dont exists for given Id",
  });
 }
 //delete from profile schema
 const deletedProfile=await Profile.findByIdAndDelete(userDetails.additionalDetails);
 //delete from user schema
 const deletedUser=await User.findByIdAndDelete(userId);
 //delete from courses enrolled by student
 await Course.updateMany(
  { studentsEnrolled:userId},
  { $pull: { studentsEnrolled: userId } }
);

 //return response
 res.status(200).json({
  success: true,
  message: "Profile deleted successfully",
});
  }catch(error){
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Error while Deleting profile",
    });
  }
}

exports.getAllUserDetails=async (req,res)=>{
  try{
    const userId=req.user.id;
    const allUserDetails= await User.findById(userId).populate("additionalDetails").exec();

    console.log(allUserDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: allUserDetails,
		});
      
  }catch(error){
    console.log(error);  
    return res.status(500).json({
			success: false,
			message: error.message,
		});
	
  }
}

exports.updateDisplayPicture =async (req,res)=>{
  try{
   const imageFile=req.files.imageFile;
   const userId=req.user.id;
   const uploadedImg=await uploadImageToCloudinary(imageFile,process.env.FOLDER);

   const updatedUser=await User.findByIdAndUpdate({_id:userId},{image:uploadedImg.secure_url},{new:true})

   return res.status(200).json({
    success:true,
    message:"Profile picture updated successfully",
    data:updatedUser
   })
   
  }catch(error){
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Error while updating profile",
    });
  }
}

exports.getEnrolledCourses=async (req,res)=>{
  try{
    const userId=req.user.id;
    const userDetails=await User.findOne({_id:userId}).populate("courses").exec();
    if(!userDetails){
      return res.status(400).json({
        success:false,
        message:"User not found"
      })
    }

    return res.status(200).json({
      success:true,
      message:"Courses fetched successfully",
      data:userDetails.courses,
    })

  }catch(error){
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Error while fetching courses",
    });
  }
}