import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";

export const createUser = async (data: any) => {
    const { email, password, name } = data;
    // check existing email 
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }
    // Hash the password (salting level 10 is standard)
    const hashedPassword = await bcrypt.hash(password, 10);

    // save to database 
    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            balance: 0.00
        },
    });

    // return user (but remove password from response for security)
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}