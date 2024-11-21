import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { InventoryCreateDTOSchema } from "../schemas";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the request body
    const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: parsedBody.error.errors });
      return; // Explicitly end the function
    }

    // Create inventory
    const inventory = await prisma.inventory.create({
      data: {
        ...parsedBody.data,
        histories: {
          create: {
            actionType: "IN",
            quantityChanged: parsedBody.data.quantity,
            lastQuantity: 0,
            newQuantity: parsedBody.data.quantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    res.status(201).json(inventory); // Send the response
  } catch (err) {
    next(err); // Pass error to the error-handling middleware
  }
};

export default createInventory;
