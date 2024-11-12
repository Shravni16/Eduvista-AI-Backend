const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
  try {
    //fetching
    const { name, description } = req.body;

    //validation
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }
    //create db entry for Category
    const categoryCreated = await Category.create({ name, description });

    console.log("Category Created : ", categoryCreated);

    //return response
    res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    console.log(error),
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Error while creating Category",
      });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      Categories: allCategories,
      message: "All Categories returend successfully",
    });
  } catch (error) {
    console.log(error),
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Error while displaying Category",
      });
  }
};

//category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    //fetch category id from request body
    const { categoryId } = req.body;

    //get all courses of that category
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    //validation if there do not exist course for any category
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }
    //get courses for different categories
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    //get top 10 selling courses

    const result = await Course.aggregate([
      {
        $match: { studentsEnrolled: { $exists: true, $ne: null } },
      },
      {
        $project: {
          numberOfElements: { $size: "$studentsEnrolled" },
        },
      },
      {
        $sort: {
          numberOfElements: -1, // 1 for ascending order, -1 for descending order
        },
      },
    ]);
    console.log(result);
    let mostSelledCourses;
    // //output will be array which will contain course id and students enrolled in that courses so we need to fetch top 10 courses from it
  
    
    for (let i = 0; i < 10; i++) {
      let id = result[i]._id;
      const newCourse = await Course.findById(id);
      mostSelledCourses.push(newCourse);
    }

    //return response
    return res.status(200).json({
      success: true,
      selectedCategoryCourses: selectedCategory,
      differentCategoriesCourses: differentCategories,
      // topSellingCourses: mostSelledCourses,
      message: "Data fetched successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Error while fetching category page",
      error: error.message,
    });
  }
};
