const mongoose=require("mongoose");
const mailSender = require("../utility/mailSender");

const userSchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    contactNumber:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
    },
    accountType:{
        type:String,
        enum:["Student","Instructor","Admin"],
        required:true
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile"
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }],
    image:{
        type:String,
        required:true
    },
    courseProgress:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseProgress"
    }],
    token:{
        type:String
    },
    resetPassworedExpires:{
        type:Date
    }

});

async function sendUpdationEmail(email){
    try{
       const mailResponse=await mailSender(email,"Your password has been updated","Password updation email");
       console.log("Mail Sent Successfully!")
    }catch(error){
        console.log("Error while Veifying mail");
        console.log(error);
        throw error;
    }
}


userSchema.post('findOneAndUpdate',async function(doc){
    if(doc){
        if(this._update.password){
            await sendUpdationEmail(this.email);
            next();
        }
    }
})

module.exports=mongoose.model("User",userSchema);