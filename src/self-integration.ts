// Self Protocol integration for SafeLease
export class SafeLeaseSelfIntegration {
  
  constructor() {
    // Initialize will be done when needed
  }
  
  /**
   * Start identity verification for landlords
   * @param userData Additional user data for verification
   */
  async startLandlordVerification(userData?: string) {
    const encodedUserData = this.encodeUserData(0, userData); // 0 = LANDLORD
    
    // Create verification URL for Self Protocol
    const verificationUrl = this.createVerificationUrl({
      endpoint: import.meta.env.VITE_IDENTITY_VERIFICATION_CONTRACT || '',
      userDefinedData: encodedUserData,
      disclosures: {
        minimumAge: 18,
        nationality: true,
        ofacCheck: true,
      },
      metadata: {
        title: 'Landlord Verification',
        description: 'Verify your identity to list rental properties',
      },
    });
    
    return { url: verificationUrl, qrCode: verificationUrl };
  }
  
  /**
   * Start identity verification for tenants
   * @param incomeRange Income range information
   * @param employmentStatus Employment status
   */
  async startTenantVerification(incomeRange: string, employmentStatus: string) {
    const userData = this.encodeUserData(1, `${incomeRange}|${employmentStatus}`); // 1 = TENANT
    
    const verificationUrl = this.createVerificationUrl({
      endpoint: import.meta.env.VITE_IDENTITY_VERIFICATION_CONTRACT || '',
      userDefinedData: userData,
      disclosures: {
        minimumAge: 18,
        nationality: true,
        ofacCheck: true,
      },
      metadata: {
        title: 'Tenant Verification',
        description: 'Verify your identity and income to apply for rentals',
      },
    });
    
    return { url: verificationUrl, qrCode: verificationUrl };
  }
  
  /**
   * Create verification URL for Self Protocol
   * @param config Verification configuration
   */
  private createVerificationUrl(config: any): string {
    // Create a deep linking URL for Self Protocol
    const baseUrl = 'https://app.self.xyz/verify';
    const params = new URLSearchParams({
      endpoint: config.endpoint,
      userDefinedData: config.userDefinedData,
      minimumAge: config.disclosures.minimumAge.toString(),
      nationality: config.disclosures.nationality.toString(),
      ofacCheck: config.disclosures.ofacCheck.toString(),
      title: config.metadata.title,
      description: config.metadata.description,
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  /**
   * Encode user data for contract processing
   * @param verificationType Verification type (0=Landlord, 1=Tenant)
   * @param additionalData Additional data string
   */
  private encodeUserData(verificationType: number, additionalData?: string): string {
    const typeHex = verificationType.toString(16).padStart(2, '0');
    const dataHex = additionalData ? new TextEncoder().encode(additionalData).reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '') : '';
    return `0x${typeHex}${dataHex}`;
  }
  
  /**
   * Generate QR code for verification
   * @param verificationType Type of verification to start
   * @param additionalData Additional data for verification
   */
  async generateVerificationQR(verificationType: number, additionalData?: string) {
    const encodedUserData = this.encodeUserData(verificationType, additionalData);
    
    const verificationUrl = this.createVerificationUrl({
      endpoint: import.meta.env.VITE_IDENTITY_VERIFICATION_CONTRACT || '',
      userDefinedData: encodedUserData,
      disclosures: {
        minimumAge: 18,
        nationality: true,
        ofacCheck: true,
      },
      metadata: {
        title: 'SafeLease Verification',
        description: 'Verify your identity for SafeLease',
      },
    });
    
    // Return the URL as a simple QR code data
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
          Scan with Self App
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="8">
          ${verificationUrl.substring(0, 30)}...
        </text>
      </svg>
    `)}`;
  }
  
  /**
   * Verify proof on backend (mock implementation)
   * @param proof The verification proof
   * @param publicSignals Public signals from verification
   */
  async verifyProof(proof: any, publicSignals: any[]): Promise<boolean> {
    try {
      // Mock verification - in production, this would use SelfBackendVerifier
      console.log('Mock proof verification:', { proof, publicSignals });
      return true;
    } catch (error) {
      console.error('Proof verification failed:', error);
      return false;
    }
  }
  
  /**
   * Get user verification status
   * @param userAddress User's wallet address
   */
  async getUserVerificationStatus(userAddress: string) {
    // This would typically call your backend API which queries the smart contract
    // For now, return mock data
    return {
      isVerified: false,
      userType: null,
      verifiedAt: null,
      country: null,
      age: null,
    };
  }
  
  /**
   * Create QR code for verification
   * @param verificationType Type of verification to start
   * @param additionalData Additional data for verification
   */
  async createVerificationQR(verificationType: number, additionalData?: string) {
    let verification;

    switch (verificationType) {
      case 0:
        verification = await this.startLandlordVerification(additionalData);
        break;
      case 1:
        const [incomeRange, employmentStatus] = (additionalData || '').split('|');
        verification = await this.startTenantVerification(incomeRange, employmentStatus);
        break;
      default:
        throw new Error('Invalid verification type');
    }

    return verification;
  }
}

// Export singleton instance
export const safeLeaseSelf = new SafeLeaseSelfIntegration();
