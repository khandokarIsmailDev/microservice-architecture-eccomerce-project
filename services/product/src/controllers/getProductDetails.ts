import axios from "axios";
import prisma from "../prisma";
import { Request, Response, NextFunction } from "express";
import { INVENTORY_URL } from "../config";

const getProductDetails = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        
        const {id} = req.params
        const product = await prisma.product.findUnique({
            where:{id}
        })
        if(!product){
            res.status(404).json({message:"product-not-found"})
            return
        }

        //create inventory record for the product if not exists
        if(product.inventoryId === null){
            const {data:inventory} = await axios.post(`${INVENTORY_URL}/inventories`,{
                productId:product.id,
                sku:product.sku
            })

            console.log(`inventory created with id: ${inventory.id}`)

            await prisma.product.update({
                where:{id:product.id},
                data:{
                    inventoryId:inventory.id
                }
            })

            console.log(`product updated with inventory id: ${inventory.id}`)

            res.status(200).json({
                ...product,
                inventoryId:inventory.id,
                stock:inventory.quantity || 0,
                stockStatus:inventory.quantity > 0 ? 'In Stock' : 'Out of Stock'
            })
            return
        }

        //if inventory record exists, fetch the inventory details
        const {data:inventory} = await axios.get(`${INVENTORY_URL}/inventories/${product.inventoryId}`)

        res.status(200).json({
            ...product,
            stock:inventory.quantity || 0,
            stockStatus:inventory.quantity > 0 ? 'In Stock' : 'Out of Stock'
        })

        return
        
    }catch(err){
        next(err)
    }
}

export default getProductDetails;