import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { InventoryUpdateDTOSchema } from "../schemas";

//return sob somoy ai babei define korte hobe,naile index e error show korbe

const updateInventory = async(req:Request,res:Response,next:NextFunction) =>{
    try{
        //check if the inventory exists
        const {id} = req.params
        const inventory = await prisma.inventory.findUnique({
            where:{id}
        })

        if(!inventory){
         res.status(404).json({message:"inventory not found"})
         return
        }

        //update the inventory
        const parsedBody = InventoryUpdateDTOSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({error:parsedBody.error.errors})
            return
        }

        const lastHistory = await prisma.history.findFirst({
            where:{inventoryId:id},
            orderBy:{createdAt:"desc"} //desc means latest history
        })

        //calculate the new quantity
        let newQuantity = inventory.quantity
        if(parsedBody.data.actionType === 'IN'){
            newQuantity += parsedBody.data.quantity
        }else{
            newQuantity -= parsedBody.data.quantity
        }

        //update the inventory
        const updatedInventory = await prisma.inventory.update({
            where:{id},
            data:{
                quantity:newQuantity,
                histories:{
                    create:{
                        actionType:parsedBody.data.actionType,
                        quantityChanged:parsedBody.data.quantity,
                        lastQuantity:lastHistory?.newQuantity || 0,
                        newQuantity
                    }
                }
            },
            select:{
                id:true,
                quantity:true
            }
        })

         res.status(200).json(updatedInventory)
         return
    }catch(err){
        next(err)
    }
}

export default updateInventory;