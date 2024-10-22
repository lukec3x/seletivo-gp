import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Account } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  generateAccountNumber(): string {
    const accountNumber = Math.floor(
      100000000 + Math.random() * 900000000,
    ).toString();
    return accountNumber;
  }

  async generateUniqueAccountNumber(): Promise<string> {
    let accountNumber: string;
    let isUnique = false;

    do {
      accountNumber = this.generateAccountNumber();
      const existingAccount = await this.prisma.account.findUnique({
        where: { accountNumber },
      });

      if (!existingAccount) {
        isUnique = true;
      }
    } while (!isUnique);

    return accountNumber;
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const accountNumber = await this.generateUniqueAccountNumber();

    return await this.prisma.account.create({
      data: {
        accountNumber,
        accountBalance: createAccountDto.accountBalance,
      },
    });
  }
}
