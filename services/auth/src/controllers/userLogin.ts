import { Request,Response,NextFunction } from "express";
import prisma from "../prisma";
import { UserLoginSchema } from "../schemas";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "@prisma/client";

type LoginHistory ={
    userId:string,
    userAgent:string | undefined,
    ipAddress:string | undefined,
    attempt:LoginAttempt
}

const createLoginHistory = async(info:LoginHistory) =>{
    await prisma.loginHistory.create({
        data:{
            userId:info.userId,
            userAgent:info.userAgent,
            ipAddress:info.ipAddress,
            attempt:info.attempt
        }
    })
}

const userLogin = async(req:Request,res:Response,next:NextFunction)=>{
    try{

        //get the ip address
        const ipAddress  = req.headers["x-forwarded-for"] as string || req.ip || ''
        const userAgent = req.headers["user-agent"] as string || ''

        //validate the request body
        const parsedBody = UserLoginSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({
                message:"Invalid request body",
                error:parsedBody.error.errors
            })
            return;
        }

        //check if the user exists
        const user = await prisma.user.findUnique({
            where:{
                email:parsedBody.data?.email
            }
        })

        if(!user){
            await createLoginHistory({
                userId:'Guest',
                userAgent,
                ipAddress,
                attempt:LoginAttempt.FAILED
            })
            res.status(400).json({
                message:"User not found"
            })
            return;
        }

        //compare the password
        if (!parsedBody.data) {
            res.status(400).json({
                message: "Invalid request body"
            });
            return;
        }
        const isMatch = await bcrypt.compare(parsedBody.data.password, user.password)
        if(!isMatch){
            await createLoginHistory({
                userId:user.id,
                userAgent,
                ipAddress,
                attempt:LoginAttempt.FAILED
            })
            res.status(400).json({
                message:"Invalid credentials"
            })
            return;
        }

        //check if the user is verified
        if(!user.verified){
            await createLoginHistory({
                userId:user.id,
                userAgent,
                ipAddress,
                attempt:LoginAttempt.FAILED
            })
            res.status(400).json({
                message:"User not verified"
            })
            return;
        }

        // check if the user is active
        if(user.status !== "ACTIVE"){
            await createLoginHistory({
                userId:user.id,
                userAgent,
                ipAddress,
                attempt:LoginAttempt.FAILED
            })
            res.status(400).json({
                message:`Your account is ${user.status.toLowerCase()}, please contact support`
            })
            return;
        }

        //generate jwt access token
        const accessToken = jwt.sign(
            {userId:user.id,email:user.email,name:user.name,role:user.role},
            process.env.JWT_SECRET ?? "MY_SECRET_KEY",
            {expiresIn:"2h"}
        )

        await createLoginHistory({
            userId:user.id,
            userAgent,
            ipAddress,
            attempt:LoginAttempt.SUCCESS
        })

        res.status(200).json({
            message:"Login successful",
            accessToken
        })
        return;


        


    }catch(err){
        next(err)
    }
}

export default userLogin