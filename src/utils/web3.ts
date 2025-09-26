import { ethers } from 'ethers';

// Contract ABI interfaces (simplified for demo)
const IDENTITY_VERIFICATION_ABI = [
  "function isVerified(address user) external view returns (bool)",
  "function getUserVerification(address user) external view returns (tuple(bool isVerified, uint8 userType, uint256 verifiedAt, string country, uint256 age, bool isOFACCompliant, string additionalData))",
  "event UserVerified(address indexed user, uint8 userType, string country, uint256 age, bytes userData)"
];

const RENTAL_MANAGEMENT_ABI = [
  "function listProperty(string title, string description, string location, uint256 totalMonthlyRent, uint256 roomRent, uint256 deposit, uint256 maxRooms, bool[] features) external",
  "function applyForProperty(uint256 propertyId, bool isFullProperty, uint256 roomNumber, uint256 monthlyIncome, string employmentStatus, string additionalInfo) external",
  "function getProperty(uint256 propertyId) external view returns (tuple(uint256 propertyId, address owner, string title, string description, string location, uint256 totalMonthlyRent, uint256 roomRent, uint256 deposit, uint256 maxRooms, uint256 occupiedRooms, bool isActive, uint256 createdAt, uint256 updatedAt, address propertyTokenContract))",
  "function getProperties() external view returns (uint256[])",
  "function reviewApplication(uint256 applicationId, bool approved) external",
  "event PropertyListed(uint256 indexed propertyId, address indexed owner, string title, string location)",
  "event ApplicationSubmitted(uint256 indexed applicationId, address indexed tenant, uint256 indexed propertyId)"
];

const PROPERTY_TOKEN_ABI = [
  "function purchaseTokens(uint256 amount) external payable",
  "function whitelistInvestor(address investor, bool isAccredited, uint256 maxInvestment, string country, bool ofacCompliant) external",
  "function getInvestorStatus(address investor) external view returns (tuple(bool isWhitelisted, bool isAccredited, uint256 maxInvestment, uint256 currentInvestment, string country, bool ofacCompliant))",
  "function getPropertyInfo() external view returns (tuple(string propertyId, string propertyAddress, uint256 totalValue, uint256 totalTokens, address propertyOwner, bool isActive, uint256 createdAt))",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "event TokensPurchased(address indexed investor, uint256 amount, uint256 totalCost, string propertyId)",
  "event InvestorWhitelisted(address indexed investor, bool isAccredited, uint256 maxInvestment, string country)"
];

// Web3 provider and signer
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.JsonRpcSigner | null = null;

// Contract instances
let identityVerificationContract: ethers.Contract | null = null;
let rentalManagementContract: ethers.Contract | null = null;

// Contract addresses (these would come from environment variables in production)
const CONTRACT_ADDRESSES = {
  IDENTITY_VERIFICATION: process.env.VITE_IDENTITY_VERIFICATION_CONTRACT || '0x1234567890123456789012345678901234567890',
  RENTAL_MANAGEMENT: process.env.VITE_RENTAL_MANAGEMENT_CONTRACT || '0x2345678901234567890123456789012345678901',
  PROPERTY_TOKEN: process.env.VITE_PROPERTY_TOKEN_CONTRACT || '0x3456789012345678901234567890123456789012'
};

export class Web3Manager {
  private static instance: Web3Manager;

  private constructor() {}

  public static getInstance(): Web3Manager {
    if (!Web3Manager.instance) {
      Web3Manager.instance = new Web3Manager();
    }
    return Web3Manager.instance;
  }

  /**
   * Connect to MetaMask or other Web3 wallet
   */
  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask.');
      }

      provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      signer = await provider.getSigner();
      
      const address = await signer.getAddress();
      
      // Initialize contracts
      this.initializeContracts();
      
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Get current wallet address
   */
  async getCurrentAddress(): Promise<string | null> {
    if (!signer) return null;
    return await signer.getAddress();
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return signer !== null;
  }

  /**
   * Initialize contract instances
   */
  private initializeContracts(): void {
    if (!signer) return;

    identityVerificationContract = new ethers.Contract(
      CONTRACT_ADDRESSES.IDENTITY_VERIFICATION,
      IDENTITY_VERIFICATION_ABI,
      signer
    );

    rentalManagementContract = new ethers.Contract(
      CONTRACT_ADDRESSES.RENTAL_MANAGEMENT,
      RENTAL_MANAGEMENT_ABI,
      signer
    );
  }

  /**
   * Get identity verification contract
   */
  getIdentityVerificationContract(): ethers.Contract | null {
    return identityVerificationContract;
  }

  /**
   * Get rental management contract
   */
  getRentalManagementContract(): ethers.Contract | null {
    return rentalManagementContract;
  }

  /**
   * Get property token contract for a specific property
   */
  getPropertyTokenContract(address: string): ethers.Contract | null {
    if (!signer) return null;
    return new ethers.Contract(address, PROPERTY_TOKEN_ABI, signer);
  }

  /**
   * Check if user is verified via Self Protocol
   */
  async isUserVerified(address: string): Promise<boolean> {
    if (!identityVerificationContract) return false;
    
    try {
      return await identityVerificationContract.isVerified(address);
    } catch (error) {
      console.error('Error checking user verification:', error);
      return false;
    }
  }

  /**
   * Get user verification details
   */
  async getUserVerification(address: string): Promise<any> {
    if (!identityVerificationContract) return null;
    
    try {
      return await identityVerificationContract.getUserVerification(address);
    } catch (error) {
      console.error('Error getting user verification:', error);
      return null;
    }
  }

  /**
   * List a property
   */
  async listProperty(propertyData: {
    title: string;
    description: string;
    location: string;
    totalMonthlyRent: number;
    roomRent: number;
    deposit: number;
    maxRooms: number;
    features: {
      hasWifi: boolean;
      hasParking: boolean;
      hasLaundry: boolean;
      hasGym: boolean;
      isPetFriendly: boolean;
      isSmokeFree: boolean;
    };
  }): Promise<ethers.ContractTransactionResponse> {
    if (!rentalManagementContract) {
      throw new Error('Rental management contract not initialized');
    }

    const features = [
      propertyData.features.hasWifi,
      propertyData.features.hasParking,
      propertyData.features.hasLaundry,
      propertyData.features.hasGym,
      propertyData.features.isPetFriendly,
      propertyData.features.isSmokeFree
    ];

    const tx = await rentalManagementContract.listProperty(
      propertyData.title,
      propertyData.description,
      propertyData.location,
      ethers.parseEther(propertyData.totalMonthlyRent.toString()),
      ethers.parseEther(propertyData.roomRent.toString()),
      ethers.parseEther(propertyData.deposit.toString()),
      propertyData.maxRooms,
      features
    );

    return tx;
  }

  /**
   * Apply for a property
   */
  async applyForProperty(
    propertyId: number,
    isFullProperty: boolean,
    roomNumber: number,
    monthlyIncome: number,
    employmentStatus: string,
    additionalInfo: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!rentalManagementContract) {
      throw new Error('Rental management contract not initialized');
    }

    const tx = await rentalManagementContract.applyForProperty(
      propertyId,
      isFullProperty,
      roomNumber,
      ethers.parseEther(monthlyIncome.toString()),
      employmentStatus,
      additionalInfo
    );

    return tx;
  }

  /**
   * Get all properties
   */
  async getProperties(): Promise<number[]> {
    if (!rentalManagementContract) return [];
    
    try {
      return await rentalManagementContract.getProperties();
    } catch (error) {
      console.error('Error getting properties:', error);
      return [];
    }
  }

  /**
   * Get property details
   */
  async getProperty(propertyId: number): Promise<any> {
    if (!rentalManagementContract) return null;
    
    try {
      return await rentalManagementContract.getProperty(propertyId);
    } catch (error) {
      console.error('Error getting property:', error);
      return null;
    }
  }

  /**
   * Purchase property tokens
   */
  async purchasePropertyTokens(
    propertyTokenAddress: string,
    amount: number,
    valueInEth: string
  ): Promise<ethers.ContractTransactionResponse> {
    const propertyTokenContract = this.getPropertyTokenContract(propertyTokenAddress);
    if (!propertyTokenContract) {
      throw new Error('Property token contract not found');
    }

    const tx = await propertyTokenContract.purchaseTokens(
      ethers.parseEther(amount.toString()),
      { value: ethers.parseEther(valueInEth) }
    );

    return tx;
  }

  /**
   * Get property token info
   */
  async getPropertyTokenInfo(propertyTokenAddress: string): Promise<any> {
    const propertyTokenContract = this.getPropertyTokenContract(propertyTokenAddress);
    if (!propertyTokenContract) return null;
    
    try {
      return await propertyTokenContract.getPropertyInfo();
    } catch (error) {
      console.error('Error getting property token info:', error);
      return null;
    }
  }

  /**
   * Get investor status for property tokens
   */
  async getInvestorStatus(propertyTokenAddress: string, investorAddress: string): Promise<any> {
    const propertyTokenContract = this.getPropertyTokenContract(propertyTokenAddress);
    if (!propertyTokenContract) return null;
    
    try {
      return await propertyTokenContract.getInvestorStatus(investorAddress);
    } catch (error) {
      console.error('Error getting investor status:', error);
      return null;
    }
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(propertyTokenAddress: string, address: string): Promise<string> {
    const propertyTokenContract = this.getPropertyTokenContract(propertyTokenAddress);
    if (!propertyTokenContract) return '0';
    
    try {
      const balance = await propertyTokenContract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  /**
   * Listen to contract events
   */
  async listenToEvents(callback: (event: any) => void): Promise<void> {
    if (!rentalManagementContract) return;

    // Listen to property listing events
    rentalManagementContract.on('PropertyListed', callback);
    
    // Listen to application events
    rentalManagementContract.on('ApplicationSubmitted', callback);
  }

  /**
   * Stop listening to events
   */
  async stopListening(): Promise<void> {
    if (!rentalManagementContract) return;
    
    rentalManagementContract.removeAllListeners();
  }

  /**
   * Format ether values for display
   */
  formatEther(value: bigint | string): string {
    return ethers.formatEther(value);
  }

  /**
   * Parse ether values for contracts
   */
  parseEther(value: string | number): bigint {
    return ethers.parseEther(value.toString());
  }

  /**
   * Get network information
   */
  async getNetwork(): Promise<any> {
    if (!provider) return null;
    
    try {
      return await provider.getNetwork();
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }

  /**
   * Switch to Celo testnet
   */
  async switchToCeloTestnet(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet detected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaef3' }], // Celo Alfajores testnet
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaef3',
              chainName: 'Celo Alfajores Testnet',
              nativeCurrency: {
                name: 'Celo',
                symbol: 'CELO',
                decimals: 18,
              },
              rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
              blockExplorerUrls: ['https://alfajores.celoscan.io'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }
}

// Export singleton instance
export const web3Manager = Web3Manager.getInstance();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
