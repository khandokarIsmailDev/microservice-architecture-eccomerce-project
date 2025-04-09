//validate user inputs
//Get cart items using CartSessionId
//if cart is empty return 400 error
//Find all product details by the product id form cart
//create order and order items
// invoke email services
//invoke cart services
import { Request,Response,NextFunction } from "express";
import { CartItemSchema, OrderSchema } from "../schemas";
import axios from "axios";
import { CART_SERVICE, EMAIL_SERVICE, PRODUCT_SERVICE } from "../config";
import { z } from "zod";
import prisma from "../prisma";
import sendToQueue from "../queue";

const checkout = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        //validate request
        const parsedBody = OrderSchema.safeParse(req.body);
        if(!parsedBody.success){
            res.status(400).json({errors:parsedBody.error.errors});
            return;
        }

        //get cart details
        const {data:cartData} = await axios.get(`${CART_SERVICE}/cart/me`,{
            headers:{
                'x-cart-session-id': parsedBody.data.cartSessionId
            }
        })

        const cartItems = z.array(CartItemSchema).safeParse(cartData.items)
        if(!cartItems.success){
            res.status(400).json({errors:cartItems.error.errors});
            return;
        }

        if(cartItems.data.length === 0){
            res.status(400).json({errors:['Cart is empty']});
            return;
        }

        console.log(cartItems,"joijoi88787878799")

        //get product detail from cart item
        const productDetails = await Promise.all(
            cartItems.data.map(async(item) =>{
                const {data:product} = await axios.get(`${PRODUCT_SERVICE}/products/${item.productId}`);
                console.log(product,'35455__jojojo_4535')
                return {
                    productId:product.id as string,
                    productName:product.name as string,
                    sku:product.sku as string,
                    price:product.price as number,
                    quantity:item.quantity,
                    total:item.quantity * product.price 
                }
            })
        )

        const subtotal = productDetails.reduce((acc,item) => acc + item.total,0);

        //tax calculation
        const tax =0;
        const grandTotal = subtotal+tax;

        //create order
        const order = await prisma.order.create({
            data:{
                userId:parsedBody.data.userId,
                userName:parsedBody.data.userName,
                userEmail:parsedBody.data.userEmail,
                subtotal,
                tax,
                grandTotal,
                orderItems:{
                    create:productDetails.map((item) =>({
                        ...item
                    }))
                }
            }
        })

        console.log(`order created: ${order.id}`)

        //------------Start---- clear-cart & send email ekhon r dorkar nai, aita queue handle korse ------
        //clear cart
        // await axios.get(`${CART_SERVICE}/cart/clear`,{
        //     headers:{
        //         'x-cart-session-id':parsedBody.data.cartSessionId
        //     }
        // })

        // //send email
        // await axios.post(`http://localhost:4005/emails/send`,{
        //     recipient:parsedBody.data.userEmail,
        //     subject:"Confirm Your Order",
        //     body:`Your order has been placed successfully. Your order number is ${order.id} & grand total is ${grandTotal}`,
        //     source:"Chekout"
        // })

        //----------------------- End --------------

        // send to queue
        sendToQueue('send-email',JSON.stringify(order));
        sendToQueue('clear-cart',JSON.stringify({cartSessionId:parsedBody.data.cartSessionId}))

        res.status(201).json(order)
        return;
    }catch(error){
        next(error)
    }
}

export default checkout;