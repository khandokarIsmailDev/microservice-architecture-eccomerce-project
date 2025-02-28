// after successfuly  checkout er por, amader redis k ekbare clear kore dibo; karon ekhon to ar redis store kito data er kono dorkar nai

import { Request,Response,NextFunction } from "express"
import redis from "../redis";

const clearCart = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        const cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

        if(!cartSessionId){
            res.status(200).json({message:"Cart is empty!"})
        }

        // check the sesstion id exist in the store
        const exist = await redis.exists(`sessions:${cartSessionId}`);
        if(!exist){
            delete req.headers['x-cart-session-id'];
            res.status(200).json({message:"Cart is empty!"})
            return;
        }

        //clear the cart
        await redis.del(`session:${cartSessionId}`)
        await redis.del(`cart:${cartSessionId}`)

        delete req.headers['x-cart-session-id'];
        res.status(200).json({message:"Cart Cleared!"})
    }catch(error){
        next(error)
    }
}

export default clearCart;