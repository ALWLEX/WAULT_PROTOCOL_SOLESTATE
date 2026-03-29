WAULT Protocol
Протокол токенизации реальных активов на блокчейне Solana.

Обзор
WAULT позволяет токенизировать реальные активы: недвижимость, энергетические объекты, облигации и сырьевые товары. Активы представлены в виде дробных SPL-токенов на Solana. Инвесторы могут покупать доли, получать пассивный доход от доходности актива и торговать долями на вторичном рынке.

Архитектура
Протокол состоит из четырех основных компонентов:

Смарт-контракты Solana (Rust + Anchor)

Frontend приложение на Next.js

Oracle сервис для оценки активов

IPFS для хранения метаданных

Смарт-контракты
ID программы
WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (замените после деплоя)

Структура аккаунтов
Аккаунт	Назначение
Platform	Глобальное состояние протокола, комиссии, адреса authority
Asset	Метаданные актива, токеномика, отслеживание доходности
FractionHolder	Данные о долях и доходах пользователя по активу
Listing	Объявления на вторичном рынке
Инструкции
Инструкция	Описание
initialize_platform	Инициализация протокола с комиссией и authority
create_asset	Регистрация нового актива
mint_fractions	Минт дробных токенов для актива
purchase_fractions	Покупка на первичном размещении
distribute_revenue	Внесение доходности для распределения
claim_revenue	Получение накопленной доходности
list_fractions	Создание объявления на маркетплейсе
buy_listed_fractions	Покупка на маркетплейсе
update_oracle	Обновление данных оценки актива
verify_asset	Верификация актива (только admin)
Механизм распределения доходности
Протокол использует кумулятивное отслеживание доходности на токен. Каждый актив хранит revenue_per_token_cumulative с масштабированием 1e18. Держатели долей хранят снимок этого значения при последнем получении доходности. Ожидаемая доходность рассчитывается по формуле:

text
pending = fractions_held * (cumulative - snapshot) / 1e18
Такой подход исключает необходимость перебора всех держателей при распределении доходности.

Технические требования
Разработка
Rust 1.70+

Solana CLI 1.18+

Anchor 0.30.1

Node.js 20+

Yarn или npm

Деплой
Solana Devnet или Mainnet с:

USDC mint (6 decimals)

Ключами oracle authority

Казначейским кошельком

Установка
Клонирование репозитория:

text
git clone https://github.com/alwlex/wault.git
cd wault
Установка зависимостей:

text
npm install
Сборка смарт-контрактов:

text
anchor build
Запуск тестов:

text
anchor test
Деплой
Деплой на devnet:

text
npm run deploy
Инициализация платформы:

text
npm run init
Создание демо-активов:

text
npm run demo
Переменные окружения
Frontend (.env.local)
text
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Oracle (.env)
text
RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ORACLE_PRIVATE_KEY=[...]
Структура директорий
text
wault/
├── programs/wault/          # Смарт-контракты
│   └── src/
│       ├── instructions/    # Обработчики инструкций
│       ├── state.rs         # Структуры аккаунтов
│       ├── errors.rs        # Определения ошибок
│       └── events.rs        # Эмиты событий
├── app/                     # Frontend Next.js
│   └── src/
│       ├── app/             # Страницы
│       ├── components/      # React компоненты
│       ├── hooks/           # Кастомные хуки
│       └── lib/             # Клиент программы
├── oracle/                  # Oracle сервис
│   └── src/
│       ├── index.ts         # Основной цикл oracle
│       └── providers/       # Провайдеры данных
├── tests/                   # Anchor тесты
├── scripts/                 # Скрипты деплоя
└── docs/                    # Документация
API Reference
Клиент программы
Инициализация программы:

typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "./idl/wault.json";

const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, programId, provider);
Создание актива:

typescript
await program.methods
  .createAsset({
    name: "Название актива",
    symbol: "SYM",
    uri: "ipfs://...",
    description: "...",
    assetType: { realEstate: {} },
    location: "Город, Страна",
    totalValuation: new anchor.BN(1_000_000_000_000),
    totalSupply: new anchor.BN(10_000_000_000),
    pricePerFraction: new anchor.BN(100_000_000),
    saleStart: new anchor.BN(now),
    saleEnd: new anchor.BN(now + 86400 * 30),
  })
  .accounts({ ... })
  .rpc();
Покупка долей:

typescript
await program.methods
  .purchaseFractions(new anchor.BN(amount))
  .accounts({
    platform: platformPda,
    asset: assetPda,
    fractionMint: fractionMintPda,
    fractionVault: fractionVaultPda,
    paymentVault: paymentVaultPda,
    buyerUsdcAccount: buyerUsdcAccount,
    buyerFractionAccount: buyerFractionAccount,
    fractionHolder: holderPda,
    treasuryAccount: treasuryUsdcAccount,
    buyer: wallet.publicKey,
  })
  .signers([wallet.payer])
  .rpc();
Тестирование
Запуск всех тестов:

text
anchor test
Запуск конкретного теста:

text
anchor test -- --filter "Purchases fractions"
Безопасность
Все аккаунты используют PDA с сидами для детерминированной адресации

Арифметические операции используют checked math

Административные функции ограничены проверкой authority

Расчеты доходности используют точность 1e18 для предотвращения ошибок округления

Лицензия
MIT

Контакты
Создано ALWLEX






AVE W...