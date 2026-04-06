#!/bin/bash

# Установка Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"
export PATH="/home/codespace/.local/share/solana/install/active_release/bin:$PATH"

# Установка Anchor
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Установка npm зависимостей
npm install

# Установка зависимостей фронтенда
cd app && npm install && cd ..

# Генерация ключей для devnet
solana-keygen new --outfile ~/.config/solana/id.json --no-passphrase
solana config set --url https://api.devnet.solana.com

echo "Готово. Запустите solana airdrop 2 для получения SOL"
