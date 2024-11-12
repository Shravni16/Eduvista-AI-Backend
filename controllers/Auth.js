const User = require("../models/User")
const mailSender = require("../utility/mailSender");
const otpGenerator = require("otp-generator");
const OTP = require("../models/OTP");
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');
const jwt = require("jsonwebtoken");

//SendOtp
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const userAlreadyExist = await User.findOne({ email });

        if (userAlreadyExist) {
            return res.status(401).json({
                success: false,
                message: "User already Resister"
            })
        }

        let otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        let result = await OTP.findOne({ otp });
        //Check for unique otp
        while (result) {
            otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
            result = await OTP.findOne({ otp });
        }

        const OTPsend = await OTP.create({ email, otp });

        res.status(200).json({
            success: true,
            message: "OTP sent SuccessFully",
            otp
        })

    } catch (error) {
        console.log(error),
            res.status(500).json({
                success: false,
                error: error.message,
                message: "Error while sending mail"

            })

    }


}

//SignUp
exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, contactNumber, accountType, otp, password, confirmPassword } = req.body;

        //check if all fields are filled
        if (!firstName || !lastName || !email || !otp || !password || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "Please fill all mandatory fields"
            })
        }

        //check if both passwords matches

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password do not match"
            })
        }

        //check if user already exists
        const userAlreadyExist = await User.findOne({ email });
        if (userAlreadyExist) {
            res.status(401).json({
                success: false,
                message: "User already Resister"
            })
        }

        //Find most recent password saved in db
        const otpFromDB = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(otpFromDB);

        if(otpFromDB.length===0){
            return res.status(400).json({
				success: false,
				message: "The OTP is not valid"
            })
        }

        //match otps
        if (otp !== otpFromDB[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid otp"
            })
        }

        //if otp matches, add entry in user model db

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //images
        const image = `https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`;

        //create profile object in db profile model
        const profile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null
        })

        // Define payload
        const payload = { firstName, lastName, email, contactNumber, accountType, otp, password: hashedPassword, image, additionalDetails: profile._id, };

        //create user document object in user model
        const createUser = await User.create(payload);

        res.status(200).json({
            success: true,
            message: "User Created Successfully!!"
        })
    } catch (error) {
        console.log(error),
            res.status(500).json({
                success: false,
                error: error.message,
                message: "Error while creating user, try again later"

            })
    }
}

//Login
exports.login = async (req, res) => {

    try {
        const { email, password } = req.body;
        //check if anything is null

        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "Please fill all mandatory fields"
            })
        }

        //check user exists or not
        const userAlreadyExist = await User.findOne({ email });

        //if user not exist
        if (!userAlreadyExist) {
            res.status(401).json({
                success: false,
                message: "User is not Resister"
            })
        }

        //if passwords  match
        if (await bcrypt.compare(password, userAlreadyExist.password)) {
            //create jwt token

            const payload = {
                id: userAlreadyExist._id,
                role: userAlreadyExist.accountType,
                email: userAlreadyExist.email
            }
            // const options={
            //     expriresIn:"2h"
            // }

            // const token=await jwt.sign(payload,process.env.SECRET_KEY,options);
            const token = await jwt.sign(payload, process.env.JWT_SECRET);
            let option = {
                expriresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.cookie("token", token, option).json({
                success: true,
                token,
                userAlreadyExist,
                message: "User Logged In successfully"
            })
        }
    } catch (error) {
        console.log(error),
            res.status(500).json({
                success: false,
                error: error.message,
                message: "Error while login , try again later"

            })
    }


}

//Change Password
exports.changePassword=async (req,res)=>{

    try{
        //fetch details
        const {email,oldPassword,newPassword,confirmNewPassword}=req.body;

    //check if email exist
    const userAlreadyExist = await User.findOne({ email });

    //if user not exist
    if (!userAlreadyExist) {
        res.status(401).json({
            success: false,
            message: "User is not registered"
        })
    }

    //check if newpass and confirmpass are equal
    if(newPassword !==confirmNewPassword){
        return res.status(401).json({
            success: false,
            message: "Passwords do not match"
        })
    }

    //ckeck if previous password is correct or not

    const passMatch=await bcrypt.compare(oldPassword,userAlreadyExist.password);
    if(!passMatch){
        return res.status(401).json({
            success: false,
            message: "Old password is not correct"
        })
    }

    //check if old and new passwords are same
    if(oldPassword===newPassword){
        return res.status(401).json({
            success: false,
            message: "No change in password"
        })
    }

    //hash newpassword
    const newHashedPassword=await bcrypt.hash(newPassword,10);

    const updatedPass=await User.findOneAndUpdate({_id:userAlreadyExist._id},{password:newHashedPassword},{new:true});

res.status(200).json({
                success: true,
                updatedPassword:updatedPass,
                message: "Password Updated successfully"
            })
    }catch(error){
        console.log(error),
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while updating password"

        })
    }
}
