import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}/health\n`);
});

//Gracefull shutdown 
process.on('SIGTERM', () => {
    console.log("SIGTERM signam recived: closing http server");
    server.close(() => {
        console.log("Http server closed");
        process.exit(0);
    });
});