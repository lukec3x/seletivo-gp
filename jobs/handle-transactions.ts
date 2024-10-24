import { PrismaClient } from '@prisma/client';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('Starting...');
  const prisma = new PrismaClient();

  while (true) {
    try {
      await prisma.$connect();

      const records = await prisma.transactionHistory.findMany({
        take: 100,
        where: { status: 'PENDING' },
      });
      console.log('Fetched records count:', records.length);

      if (records.length === 0) {
        await sleep(3_000);
      }

      for (const record of records) {
        console.log('Processing record:', record);

        await prisma.$transaction(async (tx) => {
          const fromAccount = record.fromAccountId
            ? await tx.account.findUnique({
                where: { id: record.fromAccountId },
              })
            : null;
          const toAccount = record.toAccountId
            ? await tx.account.findUnique({
                where: { id: record.toAccountId },
              })
            : null;

          if (
            (record.transactionType === 'WITHDRAWAL' ||
              record.transactionType === 'TRANSFER') &&
            fromAccount &&
            fromAccount.accountBalance < record.amount
          ) {
            console.log('Insufficient funds for record:', record.id);
            await tx.transactionHistory.update({
              where: { id: record.id },
              data: { status: 'FAILED' },
            });
            return;
          }

          try {
            switch (record.transactionType) {
              case 'DEPOSIT':
                if (toAccount) {
                  await tx.account.update({
                    where: { id: record.toAccountId },
                    data: {
                      accountBalance: {
                        increment: record.amount,
                      },
                    },
                  });
                }
                break;
              case 'WITHDRAWAL':
                if (fromAccount) {
                  await tx.account.update({
                    where: { id: record.fromAccountId },
                    data: {
                      accountBalance: {
                        decrement: record.amount,
                      },
                    },
                  });
                }
                break;
              case 'TRANSFER':
                if (fromAccount && toAccount) {
                  await tx.account.update({
                    where: { id: record.fromAccountId },
                    data: {
                      accountBalance: {
                        decrement: record.amount,
                      },
                    },
                  });
                  await tx.account.update({
                    where: { id: record.toAccountId },
                    data: {
                      accountBalance: {
                        increment: record.amount,
                      },
                    },
                  });
                }
                break;
              default:
                console.log(
                  'Invalid transaction type:',
                  record.transactionType,
                );
                break;
            }

            const updatedRecord = await tx.transactionHistory.update({
              where: { id: record.id },
              data: { status: 'COMPLETED' },
            });
            console.log('Updated record:', updatedRecord);
          } catch (error) {
            console.error('Error processing record:', record.id, error);
            await tx.transactionHistory.update({
              where: { id: record.id },
              data: { status: 'FAILED' },
            });
          }
        });
      }

      await sleep(9_000);
    } catch (error) {
      console.error('Error in job:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
})();
