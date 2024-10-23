import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private isProcessing = false;

  constructor(private readonly prisma: PrismaService) {}

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // NOTE: funciona, mas não é a melhor opção
  @Interval(1000)
  async trasactionsJob() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      const records = await this.prisma.transactionHistory.findMany({
        where: { status: 'PENDING' },
      });
      console.log('Fetched records count:', records.length);

      if (records.length === 0) {
        await this.sleep(3_000);
      }

      for (const record of records) {
        console.log('Processing record:', record);

        // TODO: checar aqui também se tem o valor na conta para sacar/transferir
        switch (record.transactionType) {
          case 'DEPOSIT':
            await this.prisma.account.update({
              where: { id: record.toAccountId },
              data: {
                accountBalance: {
                  increment: record.amount,
                },
              },
            });
            break;
          case 'WITHDRAWAL':
            await this.prisma.account.update({
              where: { id: record.fromAccountId },
              data: {
                accountBalance: {
                  decrement: record.amount,
                },
              },
            });
            break;
          case 'TRANSFER':
            await this.prisma.account.update({
              where: { id: record.fromAccountId },
              data: {
                accountBalance: {
                  decrement: record.amount,
                },
              },
            });
            await this.prisma.account.update({
              where: { id: record.toAccountId },
              data: {
                accountBalance: {
                  increment: record.amount,
                },
              },
            });
            break;
          default:
            console.log('Invalid transaction type:', record.transactionType);
            break;
        }

        const updatedRecord = await this.prisma.transactionHistory.update({
          where: { id: record.id },
          data: { status: 'COMPLETED' },
        });
        console.log('Updated record:', updatedRecord);
      }

      await this.sleep(9_000);
    } catch (error) {
      console.error('Error in job:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
