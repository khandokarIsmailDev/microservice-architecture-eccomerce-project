import {NextFunction,Request,Response} from "express"
import prisma from "../prisma"

const getEmails = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        const emails = await prisma.email.findMany()
        res.status(200).json(emails)
    }catch(err){
        next(err)
    }
}

export default getEmails