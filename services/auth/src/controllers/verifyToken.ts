import { Request, Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AccessTokenSchema } from "../schemas";
import prisma from "../prisma";

const verifyToken = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        //validate the request body
        const parsedBody = AccessTokenSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({
                message:"Invalid request body"
            })
            return;
        }

        const {accessToken} = parsedBody.data

        //verify the access token
        const decoded = jwt.verify(accessToken,process.env.JWT_SECRET as string)
        const user = await prisma.user.findUnique({
            where:{id:(decoded as any).userId},
            select:{
                id:true,
                email:true,
                name:true,
                role:true
            }
        })

        if(!user){
            res.status(401).json({
                message:"Invalid access token"
            })
            return;
        }

        res.status(200).json({
            message:"Token is valid",
            user
        })
        return;


    }catch(err){
        next(err)
    }
}

export default verifyToken;