import { Request, Response,NextFunction } from "express";
import { CartItemSchema } from "../schemas";
import redis from "../redis";
import { v4 as uuid } from 'uuid';
import { CART_TTL } from "../config";

const addToCart = async (req:Request,res:Response,next:NextFunction ) =>{
    try{
        //validate the request body
        const parsedBody = CartItemSchema.safeParse(req.body);
        if(!parsedBody.success){
            res.status(400).json({message:"Invalid request body"});
            return;
        }

        let cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

        //check if cart session id is present and exists in database
        if(cartSessionId){
            const exists = await redis.exists(`sessions:${cartSessionId}`);
            console.log('session exists',exists);

            if(!exists){
                cartSessionId = null; //jodi ager session id expired hoy  tahole null kore dibo
            }
        }
        
        //if no cart session id is present, generate a new one
        //install `uuid` npm package to generate a new uuid
        if(!cartSessionId){
            cartSessionId = uuid()
            console.log('new session id',cartSessionId);

            //set the cart session id in redis store
            await redis.setex(`sessions:${cartSessionId}`,CART_TTL,cartSessionId); //CART_TTL is the time to live for the cart session; after this time the cart session will be expired

            //set the cart sesssion id in the response header
            res.setHeader('x-cart-session-id',cartSessionId);
        }

        

        //add item to cart
        await redis.hset(`cart:${cartSessionId}`,parsedBody.data.productId,JSON.stringify({
            inventoryId:parsedBody.data.inventoryId,
            quantity:parsedBody.data.quantity
        }));

        res.status(200).json({message:"Item added to cart"});
        return;

        //TODO: check inventory for availability

        // TODO: update the inventory

    }catch(error){
        next(error);
    }
}

export default addToCart;