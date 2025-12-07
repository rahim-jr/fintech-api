import express, { type Application, type Request, type Response } from "express";
import UserRoutes from "./src/modules/user/user.routes.js";
import transactionRoutes from "./src/modules/transactions/transaction.routes.js";

import cors from "cors";
import helmet from "helmet";


const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "success",
        message: "server is running",
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        status: "error",
        message: "Something went wrong",
        timestamp: new Date().toISOString(),
    });
});

export default app;