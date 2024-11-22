import { Request, Response,NextFunction } from "express";
import prisma from "../prisma";
import { UserCreateSchema } from "../schemas";

export const createUser = async(req:Request,res:Response,next:NextFunction)=>{
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

        //check if user already exists
        const existingUser = await prisma.user.findUnique({
            where:{authUserId:parsedBody.data.authUserId}
        })
        if(existingUser){
            res.status(400).json({
                message:"User already exists",
            })
            return
        }

        //create user
        const user = await prisma.user.create({
            data:parsedBody.data
        })

        res.status(201).json({
            message:"User created successfully",
            user
        })
        return
    }catch(err){
        next(err)
    }
}

export default createUser