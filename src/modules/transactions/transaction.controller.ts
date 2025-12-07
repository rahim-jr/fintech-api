import { type Request, type Response } from "express";
import * as transactionService from './transactions.service.js';

export const sendMoney = async (req: Request, res: Response) => {
    try {
        //req.user.id from 'protect' middleware     
        const senderId = req.user.id;
        const { receiverEmail, amount } = req.body;

        const transaction = await transactionService.transferMoney(senderId, receiverEmail, amount);
        res.status(200).json({
            status: "success",
            data: transaction
        });
    } catch (error: any) {
        res.status(400).json({ status: "error", message: error.message });
    }
}