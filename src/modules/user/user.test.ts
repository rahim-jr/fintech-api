import request from "supertest";
import app from "../../../app.js";
import prisma from "../../config/prisma.js";

//Cleaning up database -> so no user exist error
beforeAll(async () => {
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('POST /api/v1/users/register', () => {
    it('should register a new user', async () => {
        const res = await request(app).post('/api/v1/users/register').send({
            email: 'backend_king@test.com',
            password: 'securePassword123',
            name: 'Backend Engineer'
        })

        //Expectations 
        expect(res.status).toBe(201); // 201 -> Created
        expect(res.body.status).toBe("sucess");
        expect(res.body.data.email).toBe('backend_king@test.com');
        expect(res.body.data.name).toBe('Backend Engineer');
        //Password security check
        expect(res.body.data.password).toBe(undefined);
    });

    it("should fail if the email is already taken", async () => {
        //Try to register same email again 
        const res = await request(app).post('/api/v1/users/register').send({
            email: 'backend_king@test.com',
            password: "test123",
            name: "Impostor",
        });

        expect(res.status).toBe(409); // 409 -> Conflict
        expect(res.body.message).toBe("User already exists");
    })
})