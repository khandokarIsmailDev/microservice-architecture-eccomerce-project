import {NextFunction,Request,Response} from "express"
import { EmailCreateSchema } from "../schemas"
import prisma from "../prisma"
import { transporter,defaultSender } from "../config"

const sentEmail = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        //validate request body
        const parsedBody = EmailCreateSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({message:"Invalid request body"})
            return
        }

        //create email
        const {sender,recipient,subject,body,source} = parsedBody.data
        const from = sender || defaultSender
        const emailOption = {
            from,
            to:recipient,
            subject,
            text:body
        }

        //send email
        const {rejected} = await transporter.sendMail(emailOption)
        if(rejected.length > 0){
            console.log(rejected)
            res.status(500).json({message:"Failed to send email"})
            return
        }

        //save email to database
        const email = await prisma.email.create({
            data:{
                sender:from,
                recipient,
                subject,
                body,
                source
            }
        })

        res.status(201).json({message:"Email sent successfully",email})
        return;
        
    }catch(err){
        next(err)
    }
}

export default sentEmail;