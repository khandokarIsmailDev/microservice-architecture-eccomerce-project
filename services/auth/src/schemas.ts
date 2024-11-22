import { z } from "zod";

export const UserCreateSchema = z.object({
    authUserId:z.string(),
    name:z.string(), //name is required
    email:z.string().email(), //email is required
    address:z.string().optional(), //address is optional
    phone:z.string().optional() //phone is optional
})

export const UserUpdateSchema = UserCreateSchema.omit({authUserId:true}).partial() //we don't want to update authUserId; baki sob field UserCreateSchema theke copy kore UserUpdateSchema banaychi; and partial() means all field are optional

