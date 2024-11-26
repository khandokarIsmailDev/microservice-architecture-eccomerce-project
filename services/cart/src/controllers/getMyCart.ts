import { Request, Response, NextFunction } from "express";
import redis from "../redis";

const getMyCart = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        const cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

        if(!cartSessionId){
            res.status(400).json({data:[]});
            return;
        }

        const session = await redis.get(`sessions:${cartSessionId}`);
        if(!session){
            await redis.del(`sessions:${cartSessionId}`);
            res.status(404).json({data:[]});
            return;
        }

        const cart = await redis.hgetall(`cart:${cartSessionId}`);
        console.log('cart',cart);

        res.status(200).json({cart});
        return;


    }catch(error){
        next(error);
    }
}

export default getMyCart;