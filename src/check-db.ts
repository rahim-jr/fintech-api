import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    // 1. Create a dummy user 
    const user = await prisma.user.create({
        data: {
            email: 'test@demo.com',
            password: 'hashedpassword123',
            name: 'Mr. Tester',
            balance: 500.00
        }
    });

    console.log('✅ Connection Successful! User created:', user);

    //2. Fetch all users to confirm 
    const allUsers = await prisma.user.findMany();
    console.log('All users:', allUsers.length);
}

main()
    .catch((e) => console.error((e)))
    .finally(async () => await prisma.$disconnect());