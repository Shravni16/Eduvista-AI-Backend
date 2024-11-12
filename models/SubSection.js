const mongoose=require("mongoose");

const subSectionSchema= new mongoose.Schema({
  
    title:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    description:{
        type:String,
        
    },
    videoURL:{
        type:String,
        required:true
    }
  
});

module.exports=mongoose.model("SubSection",subSectionSchema);