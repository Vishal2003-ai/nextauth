import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbconnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { success } from "zod";

export async function POST(request: Request) {
  await dbconnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserVerifiedByusername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if(existingUserVerifiedByusername){
      return Response.json(
        {
          success: false,
          message: "User already exists",
        },
        {
          status: 400,
        }
      );
    }
    
    const existingUserBYEmail = await UserModel.findOne({
      email,
      isVerified: true,
    });

    const verifyCode = Math.floor(100000 + Math.random() 
    * 900000).toString();

    if(existingUserBYEmail){
      if(existingUserBYEmail.isVerified){
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          {
            status: 400,
          }
        );
      }
      else{
        const hashedPassword = await bcrypt.hash(password,10)
        existingUserBYEmail.password = hashedPassword;
        existingUserBYEmail.verifyCode = verifyCode;
        existingUserBYEmail.verifyCodeExpiresAt = new Date(Date.now() + 3600000);
       
        await existingUserBYEmail.save();
      }
    }
    else{
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
       verifyCodeExpiresAt: expiryDate,
       isVerified: false,
       isAcceptingMessages: true,
       messages: [],
       


      })
      await newUser.save();

      const emailResponse = await sendVerificationEmail(email, username , verifyCode);

      if(!emailResponse){
        return Response.json(
          {
            success: false,
            message: "Error sending verification email",
          },
          {
            status: 500,
          }
        );
      }
    }
    return Response.json(
          {
            success: true,
            message: "User register successfully. plesae check your email for verification code",
          },
          {
            status: 201,
          }
        );
    
   
    
  } catch (error) {
    console.error("error registerinf user ", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
