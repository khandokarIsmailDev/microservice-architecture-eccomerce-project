import { Request, Response, NextFunction } from "express";
import redis from "../redis";

const getMyCart = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        const cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

        if(!cartSessionId){
            res.status(400).json({data:[]});
            return;
        }

        //check if the session id exist in the store
        const session = await redis.get(`sessions:${cartSessionId}`);
        if(!session){
            await redis.del(`sessions:${cartSessionId}`);
            res.status(404).json({data:[]});
            return;
        }

        const items = await redis.hgetall(`cart:${cartSessionId}`);
        if(Object.keys(items).length === 0){
             res.status(200).json({data:[]})
             return;
        }

        //format the items
        const formatedItems = Object.keys(items).map(key =>{
            const {quantity,inventoryId} = JSON.parse(items[key]) as {
                inventoryId:string,
                quantity:number
            };

            return {
                inventoryId,
                quantity,
                productId: key
            }
        })

        res.status(200).json({items:formatedItems})

    }catch(error){
        next(error);
    }
}

export default getMyCart;