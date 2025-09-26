#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('🚀 SafeLease Environment Setup');
  console.log('================================\n');

  // Check if .env already exists
  if (fs.existsSync('.env')) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('📋 Please provide the following information:\n');

  // Get private key
  const privateKey = await question('🔑 Enter your Celo testnet private key (or press Enter to skip): ');
  
  // Get CeloScan API key (optional)
  const celoscanApiKey = await question('🔍 Enter CeloScan API key (optional, for contract verification): ');
  
  // Get IPFS configuration (optional)
  const useIpfs = await question('📁 Do you want to configure IPFS for image storage? (y/N): ');
  let ipfsApiKey = '';
  let ipfsSecret = '';
  
  if (useIpfs.toLowerCase() === 'y' || useIpfs.toLowerCase() === 'yes') {
    ipfsApiKey = await question('🔑 Enter IPFS API key (e.g., Pinata): ');
    ipfsSecret = await question('🔐 Enter IPFS API secret: ');
  }

  // Create .env content
  const envContent = `# ===========================================
# SafeLease Configuration File
# Generated on ${new Date().toISOString()}
# ===========================================

# ===========================================
# CELO TESTNET CONFIGURATION
# ===========================================
CELO_TESTNET_RPC_URL=https://alfajores-forno.celo-testnet.org
CELO_TESTNET_CHAIN_ID=44787

# ===========================================
# WALLET CONFIGURATION
# ===========================================
# Your private key for deployment (NEVER commit this to version control)
# Get ALFA tokens from: https://faucet.celo.org/alfajores
PRIVATE_KEY=${privateKey || 'your_private_key_here'}

# ===========================================
# SELF PROTOCOL CONFIGURATION
# ===========================================
# Self Protocol Hub V2 address on Celo Testnet
SELF_IDENTITY_VERIFICATION_HUB_V2=0x68c931C9a534D37aa78094877F46fE46a49F1A51

# Self Protocol Configuration IDs (update after creating configs at tools.self.xyz)
SELF_LANDLORD_CONFIG_ID=0x7b6436b0c98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d61
SELF_TENANT_CONFIG_ID=0x8c7547c1d98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d62
SELF_ROOMMATE_CONFIG_ID=0x9d8658d2e98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d63

# ===========================================
# DEPLOYED CONTRACT ADDRESSES
# ===========================================
# These will be populated after deployment
FACTORY_CONTRACT_ADDRESS=
IDENTITY_VERIFICATION_CONTRACT_ADDRESS=
RENTAL_MANAGEMENT_CONTRACT_ADDRESS=
DEPOSIT_ESCROW_CONTRACT_ADDRESS=

# ===========================================
# CELO TOKEN ADDRESSES
# ===========================================
# CELO token on Alfajores testnet
CELO_TOKEN_ADDRESS=0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9
# cUSD token on Alfajores testnet (for future multi-token support)
CUSD_TOKEN_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1

# ===========================================
# FRONTEND CONFIGURATION (VITE)
# ===========================================
VITE_CELO_TESTNET_RPC=https://alfajores-forno.celo-testnet.org
VITE_CELO_CHAIN_ID=44787
VITE_SELF_HUB_ADDRESS=0x68c931C9a534D37aa78094877F46fE46a49F1A51

# Contract addresses for frontend (will be updated after deployment)
VITE_FACTORY_CONTRACT_ADDRESS=
VITE_IDENTITY_VERIFICATION_CONTRACT_ADDRESS=
VITE_RENTAL_MANAGEMENT_CONTRACT_ADDRESS=
VITE_DEPOSIT_ESCROW_CONTRACT_ADDRESS=

# ===========================================
# AI VERIFICATION SERVICE
# ===========================================
# Mock AI service for damage verification (can be replaced with real AI service)
AI_VERIFICATION_SERVICE_URL=http://localhost:3001/api/verify-damage
AI_VERIFICATION_SERVICE_KEY=your_ai_service_key_here

# ===========================================
# PLATFORM CONFIGURATION
# ===========================================
# Platform fee percentage (0-100)
PLATFORM_FEE_PERCENTAGE=3
# Maximum platform fee percentage
MAX_PLATFORM_FEE_PERCENTAGE=10

# ===========================================
# IPFS CONFIGURATION (for property images)
# ===========================================
# IPFS gateway for image storage
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
# IPFS API endpoint (if using your own IPFS node)
IPFS_API_URL=https://api.pinata.cloud
IPFS_API_KEY=${ipfsApiKey || 'your_pinata_api_key_here'}
IPFS_API_SECRET=${ipfsSecret || 'your_pinata_secret_here'}

# ===========================================
# BLOCKCHAIN EXPLORER CONFIGURATION
# ===========================================
# CeloScan API key for contract verification
CELOSCAN_API_KEY=${celoscanApiKey || 'your_celoscan_api_key_here'}

# ===========================================
# DEVELOPMENT CONFIGURATION
# ===========================================
# Environment (development, staging, production)
NODE_ENV=development
# Enable debug logging
DEBUG=true
# Log level (error, warn, info, debug)
LOG_LEVEL=debug

# ===========================================
# FEATURE FLAGS
# ===========================================
# Enable/disable features
ENABLE_ROOMMATE_MATCHING=true
ENABLE_AI_DAMAGE_VERIFICATION=true
ENABLE_MULTI_TOKEN_PAYMENTS=false
ENABLE_MOBILE_APP=false
`;

  // Write .env file
  fs.writeFileSync('.env', envContent);
  
  console.log('\n✅ Environment configuration created successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Get ALFA tokens from: https://faucet.celo.org/alfajores');
  console.log('2. Update Self Protocol config IDs at: https://tools.self.xyz');
  console.log('3. Deploy contracts: npm run deploy');
  console.log('4. Update contract addresses in .env after deployment');
  console.log('5. Start frontend: npm run dev');
  
  rl.close();
}

setupEnvironment().catch(console.error);
