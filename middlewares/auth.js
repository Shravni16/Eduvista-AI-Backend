const jwt=require('jsonwebtoken');
require("dotenv").config();
const User=require("../models/User");
const { request } = require('express');


//auth

exports.auth=async (req,res,next)=>{
    try{
        //fetch token
        const token=req.body.token || req.cookies.token || request.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing"
            })
        }
        //verify token
        try{
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            req.user=decode;
           
        }
        catch(err){
            //verification error
            console.log(err.message);
          return res.status(401).json({
            success:false,
            message:"Token is invalid"
          })
        }
        next();

    }catch(error){
        console.log(error.message);
        return res.status(401).json({
            success:false,
            error:error.message,
            message:"Something went wrong while validating token"
          })

    }
}

//isStudent
exports.isStudent=async (req,res,next)=>{
    try{
        const role=req.user.role;
        if(role!=="Student"){
            return res.status(401).json({
                success:false,
                message:"Route is protected for students"
            })
        }
        next();
        
    }catch (error){
        return res.status(401).json({
            success:false,
            message:"User role can not be verified try again later"
        })
    }

}

//isInstuctor
exports.isInstructor=async (req,res,next)=>{
    try{
        const role=req.user.role;
        if(role!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"Route is protected for instructors"
            })
        }
        next();
        
    }catch (error){
        return res.status(401).json({
            success:false,
            message:"User role can not be verified try again later"
        })
    }

}

//isAdmin
exports.isAdmin=async (req,res,next)=>{
    try{
        const role=req.user.role;
        if(role!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"Route is protected for Admin"
            })
        }
        next();
        
    }catch (error){
        return res.status(401).json({
            success:false,
            message:"User role can not be verified try again later"
        })
    }

}
