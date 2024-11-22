import { Request, Response,NextFunction } from "express";
import prisma from "../prisma";
import { UserCreateSchema } from "../schemas";
import bcrypt from "bcryptjs";
import axios from "axios";
import { USER_SERVICE } from "../config";

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

        //Todo: generate verification code
        //Todo: send verification code to user's email

        res.status(201).json({
            message:"User created successfully",
            user:userProfile.data
        })

    }catch(err){
        next(err)
    }
}

export default userRegistration