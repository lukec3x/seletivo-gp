import { Body, Controller, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  deposit(@Body() depositDto: DepositDto) {
    return this.transactionsService.deposit(depositDto);
  }

  @Post('withdrawal')
  withdraw(@Body() withdrawal: WithdrawalDto) {
    return this.transactionsService.withdrawal(withdrawal);
  }

  @Post('transfer')
  transfer(@Body() transfer: TransferDto) {
    return this.transactionsService.transfer(transfer);
  }
}
