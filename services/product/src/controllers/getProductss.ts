import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

const getProducts = async (req:Request,res:Response,next:NextFunction) =>{
  try{
    const products = await prisma.product.findMany({
        select:{
            id:true,
            sku:true,
            name:true,
            inventoryId:true
        }
    })

    res.status(200).json({data:products})
  } catch(err){
    next(err)
  }  
}

export default getProducts;