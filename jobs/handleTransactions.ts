import { PrismaService } from 'src/prisma/prisma.service';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('Starting...');
  const prisma = new PrismaService();

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

        const fromAccount = record.fromAccountId
          ? await prisma.account.findUnique({
              where: { id: record.fromAccountId },
            })
          : null;
        const toAccount = record.toAccountId
          ? await prisma.account.findUnique({
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
          await prisma.transactionHistory.update({
            where: { id: record.id },
            data: { status: 'FAILED' },
          });
          continue;
        }

        try {
          switch (record.transactionType) {
            case 'DEPOSIT':
              if (toAccount) {
                await prisma.account.update({
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
                await prisma.account.update({
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
                await prisma.account.update({
                  where: { id: record.fromAccountId },
                  data: {
                    accountBalance: {
                      decrement: record.amount,
                    },
                  },
                });
                await prisma.account.update({
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
              console.log('Invalid transaction type:', record.transactionType);
              break;
          }

          const updatedRecord = await prisma.transactionHistory.update({
            where: { id: record.id },
            data: { status: 'COMPLETED' },
          });
          console.log('Updated record:', updatedRecord);
        } catch (error) {
          console.error('Error processing record:', record.id, error);
          await prisma.transactionHistory.update({
            where: { id: record.id },
            data: { status: 'FAILED' },
          });
        }
      }

      await sleep(9_000);
    } catch (error) {
      console.error('Error in job:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
})();
