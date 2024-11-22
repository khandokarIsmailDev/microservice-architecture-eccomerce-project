import { Request,Response,NextFunction } from "express";
import prisma from "../prisma";
import { User } from "@prisma/client";

// /user/:id?fields=id | authUserId
const getUserById = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {id} = req.params
        const field = req.query.fields as string
        let user: User | null = null

        //check if user exists by authUserId or id; amra 2 babei check korte pari;
        if(field === 'authUserId'){
            user = await prisma.user.findUnique({
                where:{authUserId:id}
            })
        }else{
            user = await prisma.user.findUnique({where:{id}})
        }

        
        if(!user){
            res.status(404).json({
                message:"User not found"
            })
            return
        }

        res.status(200).json({
            message:"User fetched successfully",
            user
        })
    }catch(err){
        next(err)
    }
}

export default getUserById