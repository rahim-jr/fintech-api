import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

//Extend express reqeust 
declare global {
    namespace Express {
        interface Request {
            user: any;
        }
    }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
    // Get token from header 
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Acess Denied.No token Provided." });
    }

    // Extract token 
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        //verify token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");

        //attaching info to the request 
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
}
