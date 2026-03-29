#!/bin/bash

echo "🚀 WAULT Protocol Deployment"
echo "=============================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building program...${NC}"
anchor build

echo -e "${BLUE}Deploying to Solana Devnet...${NC}"
anchor deploy --provider.cluster devnet

echo -e "${BLUE}Running IDL initialization...${NC}"
anchor idl init --filepath target/idl/wault.json $(solana address -k target/deploy/wault-keypair.json) --provider.cluster devnet

echo -e "${GREEN}✅ WAULT Protocol deployed successfully!${NC}"

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/wault-keypair.json)
echo -e "${GREEN}Program ID: ${PROGRAM_ID}${NC}"

# Copy IDL to frontend
echo -e "${BLUE}Copying IDL to frontend...${NC}"
cp target/idl/wault.json app/src/lib/idl/wault.json

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: ts-node scripts/init-platform.ts"
echo "  2. Run: ts-node scripts/create-demo-assets.ts"
echo "  3. Start frontend: cd app && npm run dev"
echo "  4. Start oracle: cd oracle && npm run start"