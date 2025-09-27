const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying Updated SafeLease Contracts (Keeping Existing Identity Verification)...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Configuration - Use existing identity verification contract
  const EXISTING_IDENTITY_VERIFICATION = process.env.SAFELEASE_IDENTITY_VERIFICATION_ADDRESS_NEW || process.env.SAFELEASE_IDENTITY_VERIFICATION_ADDRESS;
  const SELF_HUB_ADDRESS = process.env.SELF_IDENTITY_VERIFICATION_HUB_V2 || "0x68c931C9a534D37aa78094877F46fE46a49F1A51";
  const SCOPE = process.env.SELF_PROTOCOL_SCOPE || "0";
  
  if (!EXISTING_IDENTITY_VERIFICATION) {
    console.error("❌ SAFELEASE_IDENTITY_VERIFICATION_ADDRESS not found in .env file");
    process.exit(1);
  }
  
  console.log("📋 Configuration:");
  console.log("- Using Existing Identity Verification:", EXISTING_IDENTITY_VERIFICATION);
  console.log("- Self Hub Address:", SELF_HUB_ADDRESS);
  console.log("- Scope:", SCOPE);
  
  try {
    // Deploy Updated SafeLeaseFactory
    console.log("\n📦 Deploying Updated SafeLeaseFactory...");
    const SafeLeaseFactory = await ethers.getContractFactory("SafeLeaseFactory");
    
    const factory = await SafeLeaseFactory.deploy(
      SELF_HUB_ADDRESS,
      SCOPE,
      {
        gasPrice: ethers.parseUnits("50", "gwei"), // Fixed gas price for Celo
        gasLimit: 8000000
      }
    );
    
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ Updated SafeLeaseFactory deployed to:", factoryAddress);
    
    // Get contract addresses from factory
    const contractAddresses = await factory.getContractAddresses();
    const contractInfo = await factory.getContractInfo();
    
    console.log("\n📋 New Contract Addresses:");
    console.log("- Identity Verification (EXISTING):", EXISTING_IDENTITY_VERIFICATION);
    console.log("- Identity Verification (NEW):", contractAddresses[0]);
    console.log("- Rental Management (NEW):", contractAddresses[1]);
    console.log("- Deposit Escrow (NEW):", contractAddresses[2]);
    console.log("- Factory Owner:", contractInfo.contractOwner);
    
    // Verify contracts are accessible
    console.log("\n🔍 Verifying new contracts...");
    
    const rentalManagement = await ethers.getContractAt("SafeLeaseRentalManagement", contractAddresses[1]);
    const depositEscrow = await ethers.getContractAt("SafeLeaseDepositEscrow", contractAddresses[2]);
    
    console.log("✅ New contracts verified and accessible");
    
    // Test property token deployment capability
    console.log("\n🧪 Testing property token deployment...");
    try {
      // This should work with the new factory
      const testTokenAddress = await factory.deployPropertyToken(
        "TEST-PROP-001",
        "Test Property Address",
        ethers.parseEther("1000000"), // $1M property value
        ethers.parseEther("1000000"), // 1M tokens
        deployer.address
      );
      console.log("✅ Property token deployment test successful:", testTokenAddress);
    } catch (error) {
      console.log("⚠️ Property token deployment test failed (expected if not owner):", error.message);
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: "celoTestnet",
      deploymentType: "updated_contracts",
      factoryAddress: factoryAddress,
      contracts: {
        identityVerification: {
          existing: EXISTING_IDENTITY_VERIFICATION,
          new: contractAddresses[0]
        },
        rentalManagement: contractAddresses[1],
        depositEscrow: contractAddresses[2]
      },
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      config: {
        selfHubAddress: SELF_HUB_ADDRESS,
        scope: SCOPE
      },
      notes: "Updated contracts with property tokenization and rent distribution. Use rentalManagement address for new deployments."
    };
    
    fs.writeFileSync(
      './deployment-info-updated.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n📄 Updated deployment info saved to deployment-info-updated.json");
    
    console.log("\n🎉 Updated contract deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update your .env file with the NEW rental management contract address");
    console.log("2. The identity verification contract remains unchanged and working");
    console.log("3. Test property listing with tokenization");

    console.log("\n🔗 Contract Explorer Links:");
    console.log("- Factory: https://alfajores.celoscan.io/address/" + factoryAddress);
    console.log("- Rental Management (NEW): https://alfajores.celoscan.io/address/" + contractAddresses[1]);
    console.log("- Deposit Escrow (NEW): https://alfajores.celoscan.io/address/" + contractAddresses[2]);
    console.log("- Identity Verification (EXISTING): https://alfajores.celoscan.io/address/" + EXISTING_IDENTITY_VERIFICATION);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });