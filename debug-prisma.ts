
import prisma from "./src/config/prisma.js";

async function main() {
    const urlStr = process.env.DATABASE_URL;
    if (!urlStr) {
        console.log("DATABASE_URL is not set");
        return;
    }

    try {
        // Handle prisma formatted URLs if needed, but standard URL parser usually works for postgres://
        const url = new URL(urlStr);
        console.log(`Trying to connect to Host: ${url.hostname}, Port: ${url.port}`);
    } catch (e) {
        console.log("Could not parse DATABASE_URL");
    }

    try {
        await prisma.$connect();
        console.log("Connected successfully!");
    } catch (e) {
        console.error("Connection failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
