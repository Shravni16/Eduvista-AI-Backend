const User = require("../models/User");
const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection=require("../models/SubSection");

exports.createSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, courseID } = req.body;
    //validate
    if (!sectionName || !courseID) {
      return res.status(401).json({
        success: false,
        message: "All Fields are required",
      });
    }
    //check if course exist for given id
    const courseExists = await Course.findById(courseID);
    if (!courseExists) {
      return res.status(401).json({
        success: false,
        message: "Course not found for given course Id",
      });
    }
    //push data in database
    const newSection = await Section.create({ sectionName });
    //push id in section array of course
    await Course.findByIdAndUpdate(
      { _id: courseID },
      { $push: { courseContent: newSection._id } },
      { new: true }
    );
    //return response
    res.status(200).json({
      success: true,
      section:newSection,
      message: "Section created successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Error while creating section",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    //fetch data from request body
    const { sectionName, sectionID } = req.body;
    //validate
    if (!sectionName || !sectionID) {
      return res.status(401).json({
        success: false,
        message: "All Fields are required",
      });
    }
    //what if section dont exists

    const sectionExists = await Section.findById(sectionID);
    if (!sectionExists) {
      return res.status(401).json({
        success: false,
        message: "Section for given Id dont exists",
      });
    }
    //update in database

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionID },
      { sectionName },
      { new: true }
    );
    //return response
    res.status(200).json({
        success: true,
        message: "Section updated successfully",
      });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Error while updating section",
    });
  }
};

exports.deleteSection=async (req,res)=>{
    try{
      //fetch data
      const {sectionID,courseID}=req.body;
      //validate
      if(!sectionID || !courseID){
        return res.status(401).json({
            success: false,
            message: "All Fields are required",
          });
      }
      //check if section exists
      const sectionExists=await Section.findById(sectionID);
      if(!sectionExists){
        return res.status(401).json({
            success: false,
            message: "Section dont exists for given Id",
          });
      }

      //check if course exists
      const courseExists=await Course.findById(courseID);
      if(!courseExists){
        return res.status(401).json({
            success: false,
            message: "Course dont exists for given Id",
          });
      }

      //delete subsections under that section
      for (const subsectionID of sectionExists.subSection) {
        // Find and delete the corresponding subsection document
        await SubSection.findByIdAndDelete(subsectionID);
      }

      //delete section from section schema
      await Section.findByIdAndDelete(sectionID);
      //delete from courseContent array
      await Course.findByIdAndUpdate({_id:courseID},{$pull:{courseContent:sectionID}},{new:true});

      //return response
      res.status(200).json({
        success: true,
        message: "Section deleted successfully",
      });

    }catch(error){
        console.log(error.message);
        return res.status(500).json({
          success: false,
          message: "Error while Deleting section",
        });
    }
}