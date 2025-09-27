const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔄 Updating scope in deployed SafeLease Identity Verification contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Configuration - Use new contract address if available
  const IDENTITY_VERIFICATION_ADDRESS = process.env.SAFELEASE_IDENTITY_VERIFICATION_ADDRESS_NEW || process.env.SAFELEASE_IDENTITY_VERIFICATION_ADDRESS;
  const NEW_SCOPE = process.env.SELF_PROTOCOL_SCOPE;
  
  if (!IDENTITY_VERIFICATION_ADDRESS) {
    console.error("❌ SAFELEASE_IDENTITY_VERIFICATION_ADDRESS not found in .env file");
    process.exit(1);
  }
  
  if (!NEW_SCOPE) {
    console.error("❌ SELF_PROTOCOL_SCOPE not found in .env file");
    process.exit(1);
  }
  
  console.log("📋 Configuration:");
  console.log("- Contract Address:", IDENTITY_VERIFICATION_ADDRESS);
  console.log("- New Scope:", NEW_SCOPE);
  
  try {
    // Get contract instance
    const identityVerification = await ethers.getContractAt(
      "SafeLeaseIdentityVerification", 
      IDENTITY_VERIFICATION_ADDRESS
    );
    
    // Check current scope
    const currentScope = await identityVerification.scope();
    console.log("\n📊 Current scope:", currentScope.toString());
    
    // Check if update is needed
    if (currentScope.toString() === NEW_SCOPE) {
      console.log("✅ Scope is already up to date!");
      return;
    }
    
    // Use fixed gas price for Celo testnet
    const gasPrice = ethers.parseUnits("50", "gwei"); // 50 gwei
    console.log("⛽ Using fixed gas price: 50 gwei");
    
    // Update the scope
    console.log("\n🔄 Updating scope...");
    const tx = await identityVerification.updateScope(NEW_SCOPE, {
      gasPrice: gasPrice,
      gasLimit: 500000
    });
    
    console.log("📝 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("📊 Gas used:", receipt.gasUsed.toString());
    
    // Verify the update
    const updatedScope = await identityVerification.scope();
    console.log("📊 Updated scope:", updatedScope.toString());
    
    if (updatedScope.toString() === NEW_SCOPE) {
      console.log("\n🎉 Scope updated successfully!");
      console.log("✅ Contract is now ready for Self Protocol verification with the correct scope");
    } else {
      console.log("❌ Scope update failed - values don't match");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Failed to update scope:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
