const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting SafeLease Contract Deployment (Simple)...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Configuration
  const SELF_HUB_ADDRESS = process.env.SELF_IDENTITY_VERIFICATION_HUB_V2 || "0x68c931C9a534D37aa78094877F46fE46a49F1A51";
  const SCOPE = process.env.SELF_PROTOCOL_SCOPE || "0"; // Scope as string to avoid overflow
  
  console.log("📋 Configuration:");
  console.log("- Self Hub Address:", SELF_HUB_ADDRESS);
  console.log("- Scope:", SCOPE);
  
  try {
    // Deploy SafeLeaseFactory
    console.log("\n📦 Deploying SafeLeaseFactory...");
    const SafeLeaseFactory = await ethers.getContractFactory("SafeLeaseFactory");
    
    const factory = await SafeLeaseFactory.deploy(
      SELF_HUB_ADDRESS,
      SCOPE
    );
    
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ SafeLeaseFactory deployed to:", factoryAddress);
    
    // Get contract addresses from factory
    const contractAddresses = await factory.getContractAddresses();
    
    console.log("\n📋 Deployed Contract Addresses:");
    console.log("- Identity Verification:", contractAddresses[0]);
    console.log("- Rental Management:", contractAddresses[1]);
    console.log("- Deposit Escrow:", contractAddresses[2]);
    
    // Verify contracts are accessible
    console.log("\n🔍 Verifying contracts...");
    
    const identityVerification = await ethers.getContractAt("SafeLeaseIdentityVerification", contractAddresses[0]);
    const rentalManagement = await ethers.getContractAt("SafeLeaseRentalManagement", contractAddresses[1]);
    const depositEscrow = await ethers.getContractAt("SafeLeaseDepositEscrow", contractAddresses[2]);
    
    console.log("✅ All contracts verified and accessible");
    
    // Deploy Property Token Contract
    console.log("\n📦 Deploying Property Token Contract...");
    
    const SafeLeasePropertyToken = await ethers.getContractFactory("SafeLeasePropertyToken");
    const propertyToken = await SafeLeasePropertyToken.deploy(
      "PROP-001", // Property ID
      "123 Main St, San Francisco, CA", // Property address
      ethers.parseEther("1000000"), // $1M property value
      ethers.parseEther("1000000"), // 1M tokens (1 token = $1)
      deployer.address, // Property owner
      contractAddresses[0] // Identity verification contract
    );
    
    await propertyToken.waitForDeployment();
    const propertyTokenAddress = await propertyToken.getAddress();
    console.log("✅ SafeLease Property Token deployed to:", propertyTokenAddress);
    
    // Save deployment info
    const deploymentInfo = {
      network: "celoTestnet",
      factoryAddress: factoryAddress,
      contracts: {
        identityVerification: contractAddresses[0],
        rentalManagement: contractAddresses[1],
        depositEscrow: contractAddresses[2],
        propertyToken: propertyTokenAddress
      },
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      config: {
        selfHubAddress: SELF_HUB_ADDRESS,
        scope: SCOPE
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      './deployment-info.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n📄 Deployment info saved to deployment-info.json");
    
    console.log("\n🎉 Contract deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update your .env file with the contract addresses above");
    console.log("2. Calculate scope using tools.self.xyz");
    console.log("3. Update scope in .env and run scope update script");
    
    console.log("\n🔗 Contract Explorer Links:");
    console.log(`- Factory: https://alfajores.celoscan.io/address/${factoryAddress}`);
    console.log(`- Identity: https://alfajores.celoscan.io/address/${contractAddresses[0]}`);
    console.log(`- Rental: https://alfajores.celoscan.io/address/${contractAddresses[1]}`);
    console.log(`- Escrow: https://alfajores.celoscan.io/address/${contractAddresses[2]}`);
    console.log(`- Property Token: https://alfajores.celoscan.io/address/${propertyTokenAddress}`);

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
