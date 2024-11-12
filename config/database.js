const mongoose=require("mongoose");
require("dotenv").config();

exports.dbConnect=()=>{

     mongoose.connect(process.env.DATABASE_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
     }).then(()=>{ console.log("Database Connected Successful!")})
     .catch((error)=>{console.log(error.message);
    process.exit(1)});
}

