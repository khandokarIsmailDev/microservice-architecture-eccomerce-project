import { Request, Response, NextFunction } from "express";

const auth = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        if(!req.headers['authorization']){
            res.status(401).json({message:"Unauthorized"})
            return;
        }
       
        next()

    }catch(err){
        next(err)
    }
}

const middleware = [auth]

export default middleware