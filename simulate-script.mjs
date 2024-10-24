import fetch from 'node-fetch';

async function makeRequest(url, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function createAccounts() {
  const baseUrl = 'http://localhost:3000/accounts';

  const accounts = [
    {
      accountNumber: '123456',
      accountBalance: 1000,
    },
    {
      accountNumber: '654321',
      accountBalance: 2000,
    },
    {
      accountNumber: '987654',
      accountBalance: 3000,
    },
  ];

  console.log('Criando contas...');
  for (const account of accounts) {
    await makeRequest(baseUrl, account);
  }

  console.log('Contas criadas.');
}

async function simulateConcurrentTransfers() {
  const baseUrl = 'http://localhost:3000/transactions/transfer';

  const transfer1 = {
    fromAccountNumber: '123456',
    toAccountNumber: '654321',
    amount: 300,
  };

  const transfer2 = {
    fromAccountNumber: '123456',
    toAccountNumber: '987654',
    amount: 250,
  };

  console.log('Iniciando transferências simultâneas...');
  await Promise.all([
    makeRequest(baseUrl, transfer1),
    makeRequest(baseUrl, transfer2),
  ]);

  console.log('Finalizadas as transferências simultâneas.');
}

async function simulateConcurrentWithdrawalAndDeposit() {
  const depositUrl = 'http://localhost:3000/transactions/deposit';
  const withdrawalUrl = 'http://localhost:3000/transactions/withdrawal';

  const deposit = {
    accountNumber: '987654',
    amount: 200,
  };

  const withdrawal = {
    accountNumber: '987654',
    amount: 150,
  };

  console.log('Iniciando saque e depósito simultâneos...');
  await Promise.all([
    makeRequest(depositUrl, deposit),
    makeRequest(withdrawalUrl, withdrawal),
  ]);

  console.log('Finalizados o saque e o depósito simultâneos.');
}

async function main() {
  console.log('Simulação de concorrência em transações iniciada...');

  await createAccounts();

  await simulateConcurrentTransfers();

  await simulateConcurrentWithdrawalAndDeposit();

  console.log('Simulação de concorrência concluída.');
}

main().catch(console.error);
