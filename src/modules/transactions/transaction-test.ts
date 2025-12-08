import request from "supertest";
import app from "../../../app.js";
import prisma from "../../config/prisma.js";

let senderToken: string;

beforeAll(async () => {
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});

    //setup sender 
    await request(app).post('/api/v1/users/register').send({
        email: 'sender@test.com', password: '123', name: 'Rich guy'
    });

    //Manually give him money
    await prisma.user.update({
        where: { email: "sender@test.com" },
        data: { balance: 10000 }
    });

    const loginRes = await request(app).post('/api/v1/users/login').send({
        email: 'sender@test.com', password: '123'
    });
    senderToken = loginRes.body.data.token;

    //setup receiver 
    await request(app).post('/api/v1/users/register').send({
        email: 'receiver@test.com', password: '123', name: 'Poor guy'
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('POST /api/v1/transactions/send', () => {
    it("should transfer money successfully", async () => {
        const res = await request(app)
            .post('/api/v1/transactions/send')
            .set('Authorization', `Bearer ${senderToken}`)
            .send({
                receiverEmail: 'receiver@test.com',
                amount: 500
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.amount).toBe("500");

        // verify balances
        const sender = await prisma.user.findUnique({ where: { email: 'sender@test.com' } });
        const receiver = await prisma.user.findUnique({ where: { email: 'receiver@test.com' } });

        // Prisma Decimal to number conversion might be needed or strict string comparison
        // Assuming the API returns numbers or we can check simple values.
        // In DB it might be Decimal. 
        expect(Number(sender?.balance)).toBe(9500);
        expect(Number(receiver?.balance)).toBe(500);
    });
});
