## Descrição

API de um sistema de transações bancárias.

## Configuração

```bash
# Rodar a api, o job e subir o banco de dados
$ docker-compose up
```

## Testar a API

Testar como a API reage a chamadas simultâneas.

```bash
# Instalar as dependências
$ yarn install

# Rodar os cenários de teste da API
$ node simulate-script.mjs
```

## Endpoints

### Criar conta

Cria uma nova conta com um número de conta fornecido.

```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "123456789", "accountBalance": 1000}'

```

### Depositar

Deposita na conta (`accountNumber`) o valor (`amount`) informado.

```bash
curl --location 'http://localhost:3000/transactions/deposit' \
--header 'Content-Type: application/json' \
--data '{
    "accountNumber": "123456",
    "amount": 10.01
}'
```

### Sacar

Retira da conta (`accountNumber`) o valor (`amount`) informado.

```bash
curl --location 'http://localhost:3000/transactions/withdrawal' \
--header 'Content-Type: application/json' \
--data '{
    "accountNumber": "123456",
    "amount": 100
}'
```

### Transferir

Transfere o valor (`amount`) informado de uma conta (`fromAccountNumber`) para outra (`toAccountNumber`).

```bash
curl --location 'http://localhost:3000/transactions/transfer' \
--header 'Content-Type: application/json' \
--data '{
    "fromAccountNumber": "123456",
    "toAccountNumber": "987654",
    "amount": 11.6
}'
```

### Relatório

Gera um JSON com todas as contas e os seus históricos de transações.

```bash
curl --location 'http://localhost:3000/transactions/'
```

## Sugestões de Melhorias

### Usar filas

Mudar o sistema de queries no `handle-transactions` para um sistema robusto de filas como o RabbitMQ.
