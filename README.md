# SafeLease - Secure Property Leasing Platform

SafeLease is a revolutionary property leasing platform that combines Self Protocol identity verification with blockchain-based rental management on Celo testnet. The platform ensures secure, transparent, and efficient property leasing for both landlords and tenants.

## 🚀 Features

### Identity Verification with Self Protocol
- **Privacy-Preserving Verification**: Uses Self Protocol to verify identity without exposing personal data
- **Multiple Verification Types**: Support for landlords, tenants, and roommates
- **OFAC Compliance**: Built-in sanctions screening
- **Age Verification**: Configurable age requirements
- **Country Verification**: Geographic restrictions and compliance

### Smart Contract Features
- **Property Listing**: Secure property listing with detailed features
- **Tenant Applications**: Streamlined application process
- **Deposit Escrow**: Automated deposit management
- **AI Damage Verification**: Mock AI integration for property damage assessment
- **Roommate Matching**: Privacy-focused roommate matching for shared accommodations

### Frontend Features
- **Modern React UI**: Beautiful, responsive interface
- **QR Code Verification**: Easy mobile verification flow
- **Dashboard**: Role-based dashboards for different user types
- **Real-time Updates**: Live status updates and notifications

## 🏗️ Architecture

### Smart Contracts (Solidity)
1. **SafeLeaseIdentityVerification**: Handles Self Protocol integration
2. **SafeLeaseRentalManagement**: Manages property listings and applications
3. **SafeLeaseDepositEscrow**: Handles deposits and payments
4. **SafeLeaseFactory**: Factory contract for easy deployment

### Frontend (React + TypeScript)
- **Self SDK Integration**: QR code generation and verification flows
- **Celo Integration**: Blockchain connectivity and wallet integration
- **Responsive Design**: Mobile-first approach

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Celo testnet account with ALFA tokens
- Self Protocol configuration

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd safelease
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Celo Testnet Configuration
   CELO_TESTNET_RPC_URL=https://alfajores-forno.celo-testnet.org
   CELO_TESTNET_CHAIN_ID=44787
   PRIVATE_KEY=your_private_key_here

   # Self Protocol Configuration
   SELF_IDENTITY_VERIFICATION_HUB_V2=0x68c931C9a534D37aa78094877F46fE46a49F1A51

   # Frontend Configuration
   VITE_CELO_TESTNET_RPC=https://alfajores-forno.celo-testnet.org
   VITE_CELO_CHAIN_ID=44787
   VITE_SELF_HUB_ADDRESS=0x68c931C9a534D37aa78094877F46fE46a49F1A51
   ```

## 🚀 Deployment

### 1. Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Celo testnet
npm run deploy
```

After deployment, update your `.env` file with the deployed contract addresses.

### 2. Configure Self Protocol

1. Visit [tools.self.xyz](https://tools.self.xyz) to create verification configurations
2. Generate config IDs for different verification types
3. Update contract configuration IDs using the contract setter functions

### 3. Set Contract Scope

1. Calculate the scope using the deployed factory address
2. Update the scope in your contracts:
   ```bash
   # Example: Update scope (replace with actual values)
   npx hardhat console --network celoTestnet
   const factory = await ethers.getContractAt("SafeLeaseFactory", "YOUR_FACTORY_ADDRESS");
   const identityContract = await ethers.getContractAt("SafeLeaseIdentityVerification", "YOUR_IDENTITY_CONTRACT_ADDRESS");
   await identityContract.setScope(YOUR_CALCULATED_SCOPE);
   ```

### 4. Start Frontend

```bash
npm run dev
```

## 🔧 Usage

### For Landlords
1. **Verify Identity**: Complete Self Protocol verification
2. **List Properties**: Add property details and features
3. **Review Applications**: Manage tenant applications
4. **Handle Deposits**: Automated deposit management

### For Tenants
1. **Verify Identity**: Complete verification with income proof
2. **Browse Properties**: Search and filter available properties
3. **Apply for Rentals**: Submit applications with required information
4. **Make Payments**: Secure rent and deposit payments

### For Roommates
1. **Verify Identity**: Privacy-focused verification
2. **Set Preferences**: Gender and lifestyle preferences
3. **Find Matches**: AI-powered roommate matching
4. **Secure Communication**: Protected communication channels

## 🔐 Security Features

- **Zero-Knowledge Proofs**: Identity verification without data exposure
- **Smart Contract Security**: Audited and tested contracts
- **Access Control**: Role-based permissions
- **OFAC Compliance**: Built-in sanctions screening
- **Encrypted Storage**: Secure data handling

## 🧪 Testing

```bash
# Run smart contract tests
npm run test

# Test frontend components
npm run dev
```

## 📱 Mobile Support

The platform is fully responsive and supports mobile verification through QR codes generated by the Self SDK.

## 🔗 Integration Points

### Self Protocol
- Identity verification without exposing personal data
- Support for passports, ID cards, and Aadhaar cards
- Configurable disclosure policies

### Celo Blockchain
- Fast and low-cost transactions
- Native CELO token support
- Environmental sustainability

### AI Integration (Mock)
- Property damage assessment
- Roommate compatibility scoring
- Automated dispute resolution

## 📄 Smart Contract Addresses

After deployment, update these in your frontend:

```typescript
// Example configuration
export const CONTRACT_ADDRESSES = {
  FACTORY: "0x...",
  IDENTITY_VERIFICATION: "0x...",
  RENTAL_MANAGEMENT: "0x...",
  DEPOSIT_ESCROW: "0x...",
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: hello@safelease.com
- Documentation: [docs.safelease.com](https://docs.safelease.com)
- Discord: [SafeLease Community](https://discord.gg/safelease)

## 🔮 Future Roadmap

- [ ] Multi-token payment support
- [ ] Advanced AI damage assessment
- [ ] Mobile app development
- [ ] Integration with traditional real estate platforms
- [ ] Cross-chain compatibility
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for the future of secure property leasing**
