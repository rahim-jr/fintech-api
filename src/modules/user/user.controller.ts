import { type Request, type Response } from "express";
import * as userService from "./user.service.js";

export const register = async (req: Request, res: Response) => {
    try {
        //get data form the request body
        const userData = req.body;

        //call the service 
        const user = await userService.createUser(userData);

        //send response 
        res.status(201).json({
            status: "sucess",
            message: "User registered successfully",
            data: user
        })
    } catch (error: any) {
        if (error.message === "User already exists") {
            return res.status(409).json({ status: "error", message: error.message });
        }
        console.log(error);
        res.status(500).json({ status: "error", message: "internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await userService.loginUser(req.body);
        res.status(200).json({
            status: "sucess",
            message: "Logged in sucessfully",
            data: result
        });
    } catch (error: any) {
        res.status(401).json({ "status": "eror", message: error.message });
    }
}