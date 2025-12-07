import jwt from "jsonwebtoken";
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

export const loginUser = async (data: any) => {
    const { email, password } = data;

    //find user 
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("invaild credentials");
    }

    //compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("invaild credentials");
    }

    //Generate JWT token 
    const token = jwt.sign({ id: user.id, email: user.email },
        process.env.JWT_SECRET || "secretKey",
        {
            expiresIn: "1h"
        }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email } };
};