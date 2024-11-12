const User=require('../models/User');
const mailSender = require('../utility/mailSender');
const bcrypt=require('bcrypt')

//resetPasswordToken

exports.resetPasswordToken=async (req,res)=>{
    try{
        //fetch email from body
        const email=req.body.email;

        //check if user exist or not
        const user= await User.findOne({email});
        if(!user){
          return res.status(401).json({
            success:false,
            message:"User is not registered"
          })
        }

        //generate token
        const token=crypto.randomUUID();

        //update user by updating token and expiration time
        const userUpdated=await User.findOneAndUpdate({email},{token:token,  resetPassworedExpires:Date.now()+5*60*1000},{new:true});

        //generate URL
        let url=`http://localhost:3000/update-password/${token}`;

        //send mail
        await mailSender(email,`Password Reset link :${url}`,"Password Reset mail");

        res.status(200).json({
            success:true,
            message:"Email sent successfully"
        })

    }catch(error){
        console.log(error);
        res.status(401).json({
            success:false,
            message:"Something went wrong while resetting password"
        })
    }
}


//resetPassword
exports.resetPassword=async (req,res)=>{
    try{
        //fetch data 
    const {password,confirmPassword,token}=req.body;

    //check if user exist for token
    const userExists=await User.findOne({token:token});
    if(!userExists){
        return res.status(401).json({
            success:false,
            message:"Invalid token"
        })
    }

    //check expiry of link
    if(userExists.resetPassworedExpires < Date.now()){
        return res.status(401).json({
            success:false,
            message:"Token Expired"
        })
    }


    //validate , match passwords
    if(password!==confirmPassword){
        return res.status(401).json({
            success:false,
            message:"Passwords Do not match"
        })
    }

    //hash password

    const hashedPassword=await bcrypt.hash(password,10);

    //update password in db
    await User.findOneAndUpdate({token},{password:hashedPassword},{new:true});

    return res.status(200).json({
        success:true,
        message:"Password Reset successful"
    })
    


    
    }catch(error){
        console.log(error);
        res.status(401).json({
            success:false,
            message:"Something went wrong while resetting password"
        })
    }
}