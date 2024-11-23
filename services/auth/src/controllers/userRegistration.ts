import { Request, Response,NextFunction } from "express";
import prisma from "../prisma";
import { UserCreateSchema } from "../schemas";
import bcrypt from "bcryptjs";
import axios from "axios";
import { USER_SERVICE,EMAIL_SERVICE } from "../config";

// 1st create the "email" service then do this
const generateVerificationCode =()=>{
    //get currrent timestamp in milliseconds
    const timestamp = new Date().getTime().toString()

    //generate a random 2-digit number
    const randomNum = Math.floor(10 + Math.random() * 90)

    //combine the timestamp and random number and extract the last 5 digits
    const code = (timestamp + randomNum).slice(-5)
    return code
}

const userRegistration = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        //validate the request body
        const parsedBody = UserCreateSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({
                message:"Invalid request body",
                error:parsedBody.error.errors
            })
            return
        }

        //check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where:{
                email:parsedBody.data.email
            }
        })

        if(existingUser){
            res.status(400).json({
                message:"User already exists"
            })
        }

        //hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(parsedBody.data.password,salt)

        //create the auth user
        const user = await prisma.user.create({
            data:{
                ...parsedBody.data,
                password:hashedPassword
            },
            select:{
                id:true,
                email:true,
                name:true,
                role:true,
                status:true,
                verified:true
            }
        })

        console.log(`User created successfully:`,user)

        //create the user profile by calling user service
        const userProfile = await axios.post(`${USER_SERVICE}/users`,{
            authUserId:user.id,
            name:user.name,
            email:user.email,
        })

        // generate verification code ;;;; pls 1st create the email service then do this
        const code = generateVerificationCode()
        await prisma.verificationCode.create({
            data:{
                userId:user.id,
                code,
                expiresAt:new Date(Date.now() + 1000 * 60 * 60 * 24) //24 hours
            }
        })

        //Todo: send verification code to user's email ;;;; pls 1st create the email service then do this
        await axios.post(`${EMAIL_SERVICE}/emails/send`,{
            recipient:user.email,
            subject:"Verify your email",
            body:`Your verification code is ${code}`,
            source:EMAIL_SERVICE
        })

        res.status(201).json({
            message:"User created successfully",
            user
        })

    }catch(err){
        next(err)
    }
}

export default userRegistration