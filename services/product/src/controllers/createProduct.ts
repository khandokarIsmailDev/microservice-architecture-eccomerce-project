import prisma from "../prisma";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { ProductCreateDTOSchema } from "../schemas";
import { INVENTORY_URL } from "../config";

const createProduct = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        //validate request body
        const parsedBody = ProductCreateDTOSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({message:"invalid-request-body"})
            return
        }

        //check if product with same sku already exists
        const existingProduct = await prisma.product.findUnique({
            where:{
                sku:parsedBody.data.sku
            }
        })
        if(existingProduct){
            res.status(400).json({message:"product-with-same-sku-already-exists"})
            return
        }

        //create product in db
        const product = await prisma.product.create({
            data:parsedBody.data
        })
        console.log(`product created with id: ${product.id}`)

        //create inventory record for the product
        const {data:inventory} = await axios.post(`${INVENTORY_URL}/inventories`,{
            productId:product.id,
            sku:product.sku,
        })

        console.log(`inventory created with id: ${inventory.id}`)

        //update product and store inventory id
        const updatedProduct = await prisma.product.update({
            where:{id:product.id},
            data:{
                inventoryId:inventory.id
            }
        })

        console.log(`product updated with inventory id: ${updatedProduct.inventoryId}`)

        res.status(201).json({message:"product-created-successfully",product: updatedProduct})
        return

    }catch(err){
        next(err)
    }
}

export default createProduct;