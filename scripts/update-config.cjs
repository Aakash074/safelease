const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔄 Updating Self Protocol configuration in deployed SafeLease Identity Verification contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Configuration - Use new contract address if available
  const IDENTITY_VERIFICATION_ADDRESS = process.env.SAFELEASE_IDENTITY_VERIFICATION_ADDRESS_NEW || process.env.SAFELEASE_IDENTITY_VERIFICATION_ADDRESS;
  const NEW_SCOPE = process.env.SELF_PROTOCOL_SCOPE;
  const NEW_CONFIG_ID = process.env.SELF_VERIFICATION_CONFIG_ID;
  
  if (!IDENTITY_VERIFICATION_ADDRESS) {
    console.error("❌ SAFELEASE_IDENTITY_VERIFICATION_ADDRESS not found in .env file");
    process.exit(1);
  }
  
  if (!NEW_SCOPE) {
    console.error("❌ SELF_PROTOCOL_SCOPE not found in .env file");
    process.exit(1);
  }
  
  if (!NEW_CONFIG_ID) {
    console.error("❌ SELF_VERIFICATION_CONFIG_ID not found in .env file");
    process.exit(1);
  }
  
  console.log("📋 Configuration:");
  console.log("- Contract Address:", IDENTITY_VERIFICATION_ADDRESS);
  console.log("- New Scope:", NEW_SCOPE);
  console.log("- New Config ID:", NEW_CONFIG_ID);
  
  try {
    // Get contract instance
    const identityVerification = await ethers.getContractAt(
      "SafeLeaseIdentityVerification", 
      IDENTITY_VERIFICATION_ADDRESS
    );
    
    // Use fixed gas price for Celo testnet
    const gasPrice = ethers.parseUnits("50", "gwei"); // 50 gwei
    console.log("⛽ Using fixed gas price: 50 gwei");
    
    // Check current scope
    const currentScope = await identityVerification.scope();
    console.log("\n📊 Current scope:", currentScope.toString());
    
    // Check current config IDs
    const currentLandlordConfigId = await identityVerification.configIds(0); // LANDLORD = 0
    const currentTenantConfigId = await identityVerification.configIds(1);   // TENANT = 1
    console.log("📊 Current Landlord Config ID:", currentLandlordConfigId);
    console.log("📊 Current Tenant Config ID:", currentTenantConfigId);
    
    let scopeUpdated = false;
    let configIdsUpdated = false;
    
    // Update scope if needed
    if (currentScope.toString() !== NEW_SCOPE) {
      console.log("\n🔄 Updating scope...");
      const scopeTx = await identityVerification.updateScope(NEW_SCOPE, {
        gasPrice: gasPrice,
        gasLimit: 500000
      });
      
      console.log("📝 Scope transaction hash:", scopeTx.hash);
      console.log("⏳ Waiting for scope confirmation...");
      
      const scopeReceipt = await scopeTx.wait();
      console.log("✅ Scope transaction confirmed!");
      console.log("📊 Scope gas used:", scopeReceipt.gasUsed.toString());
      
      scopeUpdated = true;
    } else {
      console.log("✅ Scope is already up to date!");
    }
    
    // Update config IDs if needed
    if (currentLandlordConfigId !== NEW_CONFIG_ID || currentTenantConfigId !== NEW_CONFIG_ID) {
      console.log("\n🔄 Updating config IDs...");
      
      // Update Landlord config ID if needed
      if (currentLandlordConfigId !== NEW_CONFIG_ID) {
        console.log("🔄 Updating Landlord config ID...");
        const landlordTx = await identityVerification.updateConfigId(0, NEW_CONFIG_ID, { // LANDLORD = 0
          gasPrice: gasPrice,
          gasLimit: 500000
        });
        
        console.log("📝 Landlord config transaction hash:", landlordTx.hash);
        console.log("⏳ Waiting for landlord config confirmation...");
        
        const landlordReceipt = await landlordTx.wait();
        console.log("✅ Landlord config transaction confirmed!");
        console.log("📊 Landlord config gas used:", landlordReceipt.gasUsed.toString());
      }
      
      // Update Tenant config ID if needed
      if (currentTenantConfigId !== NEW_CONFIG_ID) {
        console.log("🔄 Updating Tenant config ID...");
        const tenantTx = await identityVerification.updateConfigId(1, NEW_CONFIG_ID, { // TENANT = 1
          gasPrice: gasPrice,
          gasLimit: 500000
        });
        
        console.log("📝 Tenant config transaction hash:", tenantTx.hash);
        console.log("⏳ Waiting for tenant config confirmation...");
        
        const tenantReceipt = await tenantTx.wait();
        console.log("✅ Tenant config transaction confirmed!");
        console.log("📊 Tenant config gas used:", tenantReceipt.gasUsed.toString());
      }
      
      configIdsUpdated = true;
    } else {
      console.log("✅ Config IDs are already up to date!");
    }
    
    // Verify the updates
    const updatedScope = await identityVerification.scope();
    const updatedLandlordConfigId = await identityVerification.configIds(0);
    const updatedTenantConfigId = await identityVerification.configIds(1);
    
    console.log("\n📊 Final Configuration:");
    console.log("- Updated Scope:", updatedScope.toString());
    console.log("- Updated Landlord Config ID:", updatedLandlordConfigId);
    console.log("- Updated Tenant Config ID:", updatedTenantConfigId);
    
    if (updatedScope.toString() === NEW_SCOPE && 
        updatedLandlordConfigId === NEW_CONFIG_ID && 
        updatedTenantConfigId === NEW_CONFIG_ID) {
      console.log("\n🎉 Configuration updated successfully!");
      console.log("✅ Contract is now ready for Self Protocol verification with:");
      console.log("   - Correct scope:", NEW_SCOPE);
      console.log("   - Correct config ID:", NEW_CONFIG_ID);
    } else {
      console.log("❌ Configuration update failed - values don't match");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Failed to update configuration:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
