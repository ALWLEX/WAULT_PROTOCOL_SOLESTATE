#!/bin/bash

set -e

echo "Установка Solana CLI"
sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"
export PATH="/home/codespace/.local/share/solana/install/active_release/bin:$PATH"

echo "Установка Anchor"
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

echo "Установка npm зависимостей"
npm install
cd app && npm install && cd ..

echo "Настройка Solana"
solana-keygen new --outfile ~/.config/solana/id.json --no-passphrase --force
solana config set --url https://api.devnet.solana.com

echo "Готово. Запустите solana airdrop 2 для получения SOL"
