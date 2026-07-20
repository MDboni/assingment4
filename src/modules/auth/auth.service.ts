import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload } from "./auth.interface";
import bcrypt from "bcrypt";

const registerUser = async (payload : RegisterUserPayload) => {
   const { name, email, password } = payload;
   
   await prisma.user.findUnique({
    where: {
        email: email
    }
   });
   

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: payload.role,
            phone: payload.phone,
            bio: payload.bio
        }
    })

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email
        },
        omit: {
            password: true
        }
    })

    return user;

} 


export const authService = {
    registerUser
}