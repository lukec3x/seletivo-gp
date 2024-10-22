#!/bin/sh

until npx prisma migrate deploy; do
  echo "Esperando o banco de dados ficar disponível..."
  sleep 2
done

yarn start:prod
