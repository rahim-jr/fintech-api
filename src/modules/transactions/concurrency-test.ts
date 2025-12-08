import request from "supertest";
import app from "../../../app.js";
import prisma from "../../config/prisma.js";

let senderToken: string;

beforeAll(async () => {
    // reset the db 
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});

    // create sender
    await request(app).post("/api/v1/users/register").send({
        email: "hacker@test.com",
        password: "123",
        name: "Hacker"
    });

    // manually give money to sender
    await prisma.user.update({
        where: { email: "hacker@test.com" },
        data: { balance: 100 }
    });

    //sender login
    const loginRes = await request(app).post("/api/v1/users/login").send({
        email: "hacker@test.com",
        password: "123"
    });
    senderToken = loginRes.body.data.token;

    //receiver register 
    await request(app).post("/api/v1/users/register").send({
        email: "receiver@test.com",
        password: "123",
        name: "Receiver"
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Concurrency Attack", () => {
    it("should prevent double spending money more than allowed", async () => {
        //The attack fire 5 req exactly same time 
        //each req is 100 tk
        //only 1 should succeed and others should fail
        const attackPayload = {
            receiverEmail: "receiver@test.com",
            amount: 100
        }
        const requests: any[] = [
            request(app).post('/api/v1/transactions/send').set('Authorization', `Bearer ${senderToken}`).send(attackPayload),
            request(app).post('/api/v1/transactions/send').set('Authorization', `Bearer ${senderToken}`).send(attackPayload),
            request(app).post('/api/v1/transactions/send').set('Authorization', `Bearer ${senderToken}`).send(attackPayload),
            request(app).post('/api/v1/transactions/send').set('Authorization', `Bearer ${senderToken}`).send(attackPayload),
            request(app).post('/api/v1/transactions/send').set('Authorization', `Bearer ${senderToken}`).send(attackPayload)
        ]
        //wait to finish 
        const responses = await Promise.all(requests);

        //count how many returned 200 OK 
        const successCount = responses.filter(res => res.statusCode === 200).length;
        const failCount = responses.filter(res => res.statusCode !== 200).length;

        if (failCount > 0) {
            const firstFail = responses.find(res => res.statusCode !== 200);
            console.log("First Failure status:", firstFail.status);
            console.log("First Failure body:", firstFail.body);
        }

        console.log(`\n⚔️ Attack Result: ${successCount} Success / ${failCount} Rejected`);

        //verify balance 
        const sender = await prisma.user.findUnique({ where: { email: 'hacker@test.com' } });
        const receiver = await prisma.user.findUnique({ where: { email: 'receiver@test.com' } });

        console.log("Sender Balance:", sender?.balance);
        console.log("Receiver Balance:", receiver?.balance);

        expect(successCount).toBe(1);
        expect(failCount).toBe(4);

        expect(Number(sender?.balance)).toBe(0);
        expect(Number(receiver?.balance)).toBe(100);
    });
});
