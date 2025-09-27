const fs = require('fs');

async function main() {
  console.log("🔍 SafeLease Deployment Verification");
  console.log("====================================");
  
  try {
    // Read deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync('./deployment-info.json', 'utf8'));
    
    console.log("\n📋 Deployed Contract Information:");
    console.log("- Factory Address:", deploymentInfo.factoryAddress);
    console.log("- Identity Verification:", deploymentInfo.contracts.identityVerification);
    console.log("- Scope Seed:", deploymentInfo.config.scopeSeed);
    
    console.log("\n✅ Scope Information:");
    console.log("The scope is automatically calculated by SelfVerificationRoot using:");
    console.log("- Contract Address:", deploymentInfo.contracts.identityVerification);
    console.log("- Scope Seed:", deploymentInfo.config.scopeSeed);
    console.log("- Scope = PoseidonHash(contractAddress + scopeSeed)");
    
    console.log("\n🎯 Frontend Integration:");
    console.log("For your frontend, you need:");
    console.log("1. Contract Address:", deploymentInfo.contracts.identityVerification);
    console.log("2. Scope Seed:", deploymentInfo.config.scopeSeed);
    console.log("3. The scope will be calculated automatically by Self Protocol SDK");
    
    console.log("\n📝 Current .env variables to update:");
    console.log("SAFELEASE_FACTORY_ADDRESS=\"" + deploymentInfo.factoryAddress + "\"");
    console.log("SAFELEASE_IDENTITY_VERIFICATION_ADDRESS=\"" + deploymentInfo.contracts.identityVerification + "\"");
    console.log("SAFELEASE_RENTAL_MANAGEMENT_ADDRESS=\"" + deploymentInfo.contracts.rentalManagement + "\"");
    console.log("SAFELEASE_DEPOSIT_ESCROW_ADDRESS=\"" + deploymentInfo.contracts.depositEscrow + "\"");
    console.log("SAFELEASE_PROPERTY_TOKEN_ADDRESS=\"" + deploymentInfo.contracts.propertyToken + "\"");
    
  } catch (error) {
    console.error("❌ Error reading deployment info:", error.message);
    console.log("\n💡 Make sure you've run the deployment script first:");
    console.log("   npx hardhat run scripts/1-deploy-contracts.cjs --network celoTestnet");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
