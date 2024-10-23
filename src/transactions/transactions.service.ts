import { Injectable } from '@nestjs/common';
import { DepositDto } from './dto/deposit.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionHistory } from '@prisma/client';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  generateTransactionId(prefix: string, accountNumber: string): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${prefix.slice(0, 2).toUpperCase()}-${accountNumber}-${timestamp}-${randomPart}`;
  }

  async deposit(depositDto: DepositDto): Promise<TransactionHistory> {
    const transactionType = 'DEPOSIT';

    const account = await this.prisma.account.findUnique({
      where: { accountNumber: depositDto.accountNumber },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const transactionHistory = await this.prisma.transactionHistory.create({
      data: {
        transactionId: this.generateTransactionId(
          transactionType,
          account.accountNumber,
        ),
        account: {
          connect: {
            id: account.id,
          },
        },
        amount: depositDto.amount,
        transactionType,
        // status: 'FAILED',
        // status: 'COMPLETED',
        status: 'PENDING',
        toAccount: {
          connect: {
            id: account.id,
          },
        },
        transactionDate: new Date(),
      },
    });

    return transactionHistory;
  }

  async withdrawal(withdrawalDto: WithdrawalDto): Promise<TransactionHistory> {
    const transactionType = 'WITHDRAWAL';

    const account = await this.prisma.account.findUnique({
      where: { accountNumber: withdrawalDto.accountNumber },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    if (account.accountBalance < withdrawalDto.amount) {
      throw new Error('Insufficient funds');
    }

    return await this.prisma.transactionHistory.create({
      data: {
        transactionId: this.generateTransactionId(
          transactionType,
          account.accountNumber,
        ),
        account: {
          connect: {
            id: account.id,
          },
        },
        amount: withdrawalDto.amount,
        transactionType,
        status: 'PENDING',
        fromAccount: {
          connect: {
            id: account.id,
          },
        },
        transactionDate: new Date(),
      },
    });
  }

  async transfer(transfer: TransferDto): Promise<TransactionHistory> {
    const transactionType = 'TRANSFER';

    const fromAccount = await this.prisma.account.findUnique({
      where: { accountNumber: transfer.fromAccountNumber },
    });

    if (!fromAccount) {
      throw new Error('From account not found');
    }

    const toAccount = await this.prisma.account.findUnique({
      where: { accountNumber: transfer.toAccountNumber },
    });

    if (!toAccount) {
      throw new Error('To account not found');
    }

    if (fromAccount.accountBalance < transfer.amount) {
      throw new Error('Insufficient funds');
    }

    return await this.prisma.transactionHistory.create({
      data: {
        transactionId: this.generateTransactionId(
          transactionType,
          fromAccount.accountNumber,
        ),
        account: {
          connect: {
            id: fromAccount.id,
          },
        },
        amount: transfer.amount,
        transactionType,
        status: 'PENDING',
        fromAccount: {
          connect: {
            id: fromAccount.id,
          },
        },
        toAccount: {
          connect: {
            id: toAccount.id,
          },
        },
        transactionDate: new Date(),
      },
    });
  }
}
