import jwt from "jsonwebtoken"
import prisma from "../prisma"
import {Request,Response,NextFunction} from "express"
import { VerifyEmailSchema } from "../schemas"
import axios from "axios"

const verifyEmail = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        //validate request body
        const parsedBody = VerifyEmailSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({
                message:"Invalid request body"
            })
            return;
        }

        //check if user exists (email)
        const user = await prisma.user.findUnique({
            where:{email:parsedBody.data.email}
        })

        if(!user){
            res.status(404).json({
                message:"User not found"
            })
            return;
        }

        //find the verification code
        const verificationCode = await prisma.verificationCode.findFirst({
            where:{
                userId:user.id,
                code:parsedBody.data.code
            }
        })

        if(!verificationCode){
            res.status(400).json({
                message:"Invalid verification code"
            })
            return;
        }

        //if the code is expired
        if(verificationCode.expiresAt < new Date()){ // expire time below current time
            res.status(400).json({
                message:"Verification code expired"
            })
            return;
        }

        //update user status to verified
        await prisma.user.update({
            where:{id:user.id},
            data:{verified:true,status:"ACTIVE"}
        })

        //UPDATE VERIFICATION CODE STATUS TO USED
        await prisma.verificationCode.update({
            where:{id:verificationCode.id},
            data:{status:"USED"}
        })

        //send success email
        await axios.post(`${process.env.EMAIL_SERVICE_URL}/sentEmail`,{
            to:user.email,
            subject:"Email Verified",
            text:"Your email has been verified successfully",
            source:"verify-email"
        })

        res.status(200).json({
            message:"Email verified successfully"
        })
        return;

    }catch(err){
        next(err)
    }
}

export default verifyEmail