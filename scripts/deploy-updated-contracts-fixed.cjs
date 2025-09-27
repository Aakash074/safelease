const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying Updated SafeLease Contracts (Fixed Approach)...");
  
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
    // Step 1: Deploy Updated SafeLeaseFactory (without circular dependency)
    console.log("\n📦 Step 1: Deploying Updated SafeLeaseFactory...");
    const SafeLeaseFactory = await ethers.getContractFactory("SafeLeaseFactory");
    
    const factory = await SafeLeaseFactory.deploy(
      SELF_HUB_ADDRESS,
      SCOPE,
      {
        gasPrice: ethers.parseUnits("50", "gwei"),
        gasLimit: 8000000
      }
    );
    
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ Updated SafeLeaseFactory deployed to:", factoryAddress);
    
    // Step 2: Deploy Updated Rental Management Contract separately
    console.log("\n📦 Step 2: Deploying Updated Rental Management Contract...");
    const SafeLeaseRentalManagement = await ethers.getContractFactory("SafeLeaseRentalManagement");
    
    const rentalManagement = await SafeLeaseRentalManagement.deploy(
      EXISTING_IDENTITY_VERIFICATION,
      factoryAddress,
      {
        gasPrice: ethers.parseUnits("50", "gwei"),
        gasLimit: 8000000
      }
    );
    
    await rentalManagement.waitForDeployment();
    const rentalManagementAddress = await rentalManagement.getAddress();
    console.log("✅ Updated Rental Management deployed to:", rentalManagementAddress);
    
    // Step 3: Deploy Updated Deposit Escrow Contract
    console.log("\n📦 Step 3: Deploying Updated Deposit Escrow Contract...");
    const SafeLeaseDepositEscrow = await ethers.getContractFactory("SafeLeaseDepositEscrow");
    
    const depositEscrow = await SafeLeaseDepositEscrow.deploy(
      EXISTING_IDENTITY_VERIFICATION,
      {
        gasPrice: ethers.parseUnits("50", "gwei"),
        gasLimit: 6000000
      }
    );
    
    await depositEscrow.waitForDeployment();
    const depositEscrowAddress = await depositEscrow.getAddress();
    console.log("✅ Updated Deposit Escrow deployed to:", depositEscrowAddress);
    
    // Step 4: Authorize the rental management contract in the factory
    console.log("\n📦 Step 4: Authorizing Rental Management in Factory...");
    const authorizeTx = await factory.authorizeContract(rentalManagementAddress, true, {
      gasPrice: ethers.parseUnits("50", "gwei"),
      gasLimit: 500000
    });
    await authorizeTx.wait();
    console.log("✅ Rental Management authorized in Factory");
    
    // Step 5: Test property token deployment
    console.log("\n🧪 Step 5: Testing property token deployment...");
    try {
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
      deploymentType: "updated_contracts_fixed",
      factoryAddress: factoryAddress,
      contracts: {
        identityVerification: {
          existing: EXISTING_IDENTITY_VERIFICATION,
          note: "Using existing contract"
        },
        rentalManagement: rentalManagementAddress,
        depositEscrow: depositEscrowAddress
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
      './deployment-info-updated-fixed.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n📄 Updated deployment info saved to deployment-info-updated-fixed.json");
    
    console.log("\n🎉 Updated contract deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update your .env file with the NEW contract addresses above");
    console.log("2. The identity verification contract remains unchanged and working");
    console.log("3. Test property listing with tokenization and rent distribution");

    console.log("\n🔗 Contract Explorer Links:");
    console.log("- Factory: https://alfajores.celoscan.io/address/" + factoryAddress);
    console.log("- Rental Management (NEW): https://alfajores.celoscan.io/address/" + rentalManagementAddress);
    console.log("- Deposit Escrow (NEW): https://alfajores.celoscan.io/address/" + depositEscrowAddress);
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
