const mongoose=require("mongoose");
const mailSender = require("../utility/mailSender");

const OTPSchema= new mongoose.Schema({
  
   email:{
    type:String,
    reqired:true
   },
   otp:{
    type:String,
    reqired:true
   },
   createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
   }
  
});

//Functionnto send mail
async function sendVarificationEmail(email,otp){
    try{
       const mailResponse=await mailSender(email,otp,"Verification email");
       console.log("Mail Sent Successfully!")
    }catch(error){
        console.log("Error while Veifying mail");
        console.log(error);
        throw error;
    }
}

OTPSchema.pre("save",async function(next){
  await sendVarificationEmail(this.email,this.otp);
  next();
})

module.exports=mongoose.model("OTP",OTPSchema);