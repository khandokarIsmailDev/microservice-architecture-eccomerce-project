
import prisma from "../prisma";
import { ProductUpdateDTOSchema } from "../schemas";
import { Request,Response,NextFunction } from "express";

const updateProduct = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        //verfy reqbody is valid
        const parsedBody = ProductUpdateDTOSchema.safeParse(req.body);
         if(!parsedBody.success){
             res.status(400).json({errors: parsedBody.error.errors});
             return
         }

         //check if the product exist
         const product = await prisma.product.findUnique({
            where:{
                id:req.params.id
            }
         });
         if(!product){
            res.status(400).json({message:"Product not found"});
            return;
         }

         //update the product
         const updateProduct = await prisma.product.update({
            where:{
                id:req.params.id
            },
            data: parsedBody.data
         });

         res.status(200).json({data:updateProduct});
    }catch(error){
        next(error);
    }

}

export default updateProduct;