import axios from "axios";
import { Request, Response, NextFunction } from "express";

const auth = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        if(!req.headers['authorization']){
            res.status(401).json({message:"Unauthorized"})
            return;
        }

        const token = req.headers['authorization']?.split(' ')[1]
        const {data} = await axios.post('http://localhost:4003/auth/verify-token',{
            accessToken:token,
            headers:{
                ip:req.ip,
                'user-agent':req.headers['user-agent']
            }
        })
        console.log('[auth middleware] ',data)

        req.headers['x-user-id'] = data.userId
        req.headers['x-user-email'] = data.email
        req.headers['x-user-role'] = data.role
        req.headers['x-user-name'] = data.name
       
        next()

    }catch(err){
        console.log('[auth middleware] ',err)
        res.status(401).json({message:"Unauthorized"})
    }
}

const middlewares = {auth}

export default middlewares