const nodemailer =require("nodemailer");

async function mailSender(email,body,title){
      try{
          let transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
          });

          const mailSent=transporter.sendMail({
            from:"Eduvista AI",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
          })

         return mailSent;
      }catch(error){
        console.log(error);
        console.log("Error While Sending mail")
      }
}

module.exports=mailSender;