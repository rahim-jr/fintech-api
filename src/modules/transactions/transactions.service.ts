import prisma from "../../config/prisma.js";

export const transferMoney = async (SenderID: number, receiverEmail: string, amount: number) => {
    if (amount <= 0) {
        throw new Error("Amount Must be greater than 0");
    }

    // start the atomic database transaction 
    const result = await prisma.$transaction(async (tx) => {
        // Check Sender Balance (Must use the transaction client 'tx', not 'prisma')
        const sender = await tx.user.findUnique(
            { where: { id: SenderID } }
        );
        if (!sender) throw new Error("Sender not found");

        // Use Prisma Decimal comparison and arithmetic
        // Ensure sender.balance is treated as Decimal
        if (sender.balance.lt(amount)) {
            throw new Error("Insufficient balance");
        }

        // Check Receiver explicitly
        const reciever = await tx.user.findUnique({ where: { email: receiverEmail } });
        if (!reciever) throw new Error("Receiver not found");

        // self check 
        if (sender.id === reciever.id) {
            throw new Error("Sender and receiver cannot be the same");
        }

        // Performing the swap {All or nothing}
        // Decrement sender balance
        await tx.user.update({
            where: { id: sender.id },
            data: { balance: sender.balance.sub(amount) }
        });
        //increment receiver balance 
        await tx.user.update({
            where: { id: reciever.id },
            data: { balance: reciever.balance.add(amount) }
        });
        // transaction record
        const transactionRecord = await tx.transaction.create({
            data: {
                amount,
                senderID: sender.id,
                reciverID: reciever.id
            }
        });

        return transactionRecord;
    });

    return result;
}