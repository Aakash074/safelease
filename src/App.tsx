import React, { useState } from 'react';
import { VerificationModal } from './components/VerificationModal';
import { PropertyListing } from './components/PropertyListing';
import { PropertyBrowse } from './components/PropertyBrowse';
import { PropertyTokenPurchase } from './components/PropertyTokenPurchase';
import { TenantApplication } from './components/TenantApplication';
import { web3Manager } from './utils/web3';

interface UserVerification {
  isVerified: boolean;
  userType: 'landlord' | 'tenant' | null;
  verifiedAt: Date | null;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'property-browse'>('landing');
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    type: 'landlord' | 'tenant';
  }>({ isOpen: false, type: 'landlord' });
  const [userVerification, setUserVerification] = useState<UserVerification>({
    isVerified: false,
    userType: null,
    verifiedAt: null,
  });
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [applicationModal, setApplicationModal] = useState<{
    isOpen: boolean;
    property: any;
    isFullProperty: boolean;
    selectedRoomNumber?: number;
  }>({ isOpen: false, property: null, isFullProperty: false });
  const [tokenPurchaseModal, setTokenPurchaseModal] = useState<{
    isOpen: boolean;
    propertyId: number;
    propertyTokenAddress: string;
  }>({ isOpen: false, propertyId: 0, propertyTokenAddress: '' });
  const [walletAddress, setWalletAddress] = useState<string>('');

  const handleVerificationComplete = (result: any) => {
    console.log('Verification completed:', result);
    setUserVerification({
      isVerified: true,
      userType: verificationModal.type,
      verifiedAt: new Date(),
    });
    setVerificationModal({ isOpen: false, type: 'landlord' });
    // Show success message
    alert(`Successfully verified as ${verificationModal.type}! You can now use all SafeLease features.`);
  };

  const openVerificationModal = (type: 'landlord' | 'tenant') => {
    setVerificationModal({ isOpen: true, type });
  };

  const handleListProperty = async (propertyData: any) => {
    try {
      if (!web3Manager.isConnected()) {
        const address = await web3Manager.connectWallet();
        setWalletAddress(address);
      }
      
      const tx = await web3Manager.listProperty(propertyData);
      await tx.wait();
      alert('Property listed successfully on blockchain!');
    } catch (error) {
      console.error('Error listing property:', error);
      alert('Failed to list property. Please try again.');
    }
  };

  const handleApplyForProperty = async (propertyId: number, isFullProperty: boolean, roomNumber?: number) => {
    try {
      // Fetch real property details from the contract
      const property = await web3Manager.getProperty(propertyId);
      
      if (!property) {
        alert('Property not found. Please try again.');
        return;
      }
    
      setApplicationModal({
        isOpen: true,
        property: property,
        isFullProperty,
        selectedRoomNumber: roomNumber
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      alert('Failed to load property details. Please try again.');
    }
  };

  const handlePurchaseTokens = async (propertyId: number) => {
    try {
      // Fetch real property details to get token contract address
      const property = await web3Manager.getProperty(propertyId);
      
      if (!property || !property.propertyTokenContract) {
        alert('Property token contract not found. Property may not be tokenized.');
        return;
      }
      
      setTokenPurchaseModal({
        isOpen: true,
        propertyId,
        propertyTokenAddress: property.propertyTokenContract
      });
    } catch (error) {
      console.error('Error fetching property token:', error);
      alert('Failed to load property token information. Please try again.');
    }
  };

  const handleApplicationSuccess = (applicationId: number) => {
    setApplicationModal({ isOpen: false, property: null, isFullProperty: false });
    alert(`Application submitted successfully! Application ID: ${applicationId}`);
  };

  const handleTokenPurchaseSuccess = (txHash: string) => {
    setTokenPurchaseModal({ isOpen: false, propertyId: 0, propertyTokenAddress: '' });
    alert(`Tokens purchased successfully! Transaction: ${txHash}`);
  };

  const connectWallet = async () => {
    try {
      const address = await web3Manager.connectWallet();
      setWalletAddress(address);
      alert(`Wallet connected: ${address}`);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  if (currentView === 'dashboard') {
    return (
      <>
        {/* Dashboard Content */}
        <div className="min-h-screen bg-gray-50">
          <nav className="navbar">
            <div className="nav-brand">
              <h2>SafeLease Dashboard</h2>
            </div>
            <div className="nav-links">
              <div className="text-sm text-gray-500">
                {userVerification.isVerified ? (
                  <span className="text-green-600">✓ Verified {userVerification.userType}</span>
                ) : (
                  <span className="text-red-600">⚠ Not verified</span>
                )}
              </div>
              <button
                onClick={() => setCurrentView('landing')}
                className="btn btn-ghost"
              >
                Back to Home
              </button>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {userVerification.userType === 'landlord' && (
                <div className="space-y-6">
                  <div className="dashboard-card welcome-card">
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-4">🏡</div>
                      <h2 className="text-3xl font-bold mb-2">Welcome, Verified Landlord!</h2>
                      <p>
                        You're now ready to list properties and manage rentals on SafeLease
                      </p>
                    </div>
                  </div>

                  <PropertyListing
                    onListProperty={handleListProperty}
                    isVerificationComplete={userVerification.isVerified}
                  />
                </div>
              )}
              
              {userVerification.userType === 'tenant' && (
                <div className="space-y-6">
                  <div className="dashboard-card welcome-card">
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-4">🔑</div>
                      <h2 className="text-3xl font-bold mb-2">Welcome, Verified Tenant!</h2>
                      <p>
                        You're now ready to find and rent properties on SafeLease
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="dashboard-card">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Rental Options</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <div className="text-2xl mr-3">🏠</div>
                            <h4 className="font-semibold text-blue-800">Rent Whole Property</h4>
                          </div>
                          <p className="text-blue-700 text-sm">
                            Rent the entire property for exclusive use. Perfect for families or individuals who want privacy.
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center mb-2">
                            <div className="text-2xl mr-3">🚪</div>
                            <h4 className="font-semibold text-green-800">Rent Individual Room</h4>
                          </div>
                          <p className="text-green-700 text-sm">
                            Rent just a room in a shared property. Great for students and young professionals.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Get Started</h3>
                      <div className="space-y-4">
                        <button 
                          onClick={() => setCurrentView('property-browse')}
                          className="w-full btn btn-gradient py-3 px-6 rounded-lg transition-colors font-medium"
                        >
                          🏠 Browse Properties
                        </button>
                        
                        {!walletAddress ? (
                          <button 
                            onClick={connectWallet}
                            className="w-full btn btn-purple py-3 px-6 rounded-lg transition-colors font-medium"
                          >
                            🔗 Connect Wallet
                          </button>
                        ) : (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-green-700 text-sm">
                              <strong>✓ Wallet Connected:</strong> {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                <div className="dashboard-card">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🔍</div>
                        <h4 className="font-semibold text-gray-800 mb-1">1. Browse</h4>
                        <p className="text-gray-600 text-sm">Find properties that match your needs</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">📝</div>
                        <h4 className="font-semibold text-gray-800 mb-1">2. Apply</h4>
                        <p className="text-gray-600 text-sm">Submit your application with income verification</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">🏠</div>
                        <h4 className="font-semibold text-gray-800 mb-1">3. Move In</h4>
                        <p className="text-gray-600 text-sm">Get approved and move into your new home</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!userVerification.isVerified && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🏠</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to SafeLease</h2>
                    <p className="text-gray-600 mb-6">
                      Get started by verifying your identity and choosing your role
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <button
                      onClick={() => openVerificationModal('landlord')}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="text-4xl mb-3">🏡</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Landlord</h3>
                      <p className="text-gray-600 mb-4">List and manage rental properties</p>
                      <div className="text-sm text-blue-600 font-medium">Start Verification →</div>
                    </button>
                    
                    <button
                      onClick={() => openVerificationModal('tenant')}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="text-4xl mb-3">🔑</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Tenant</h3>
                      <p className="text-gray-600 mb-4">Find and rent properties or rooms</p>
                      <div className="text-sm text-green-600 font-medium">Start Verification →</div>
                    </button>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-4">SafeLease uses Self Protocol for secure, privacy-preserving identity verification</p>
                    <div className="flex justify-center space-x-4 text-xs text-gray-400">
                      <span>✓ Zero-knowledge proofs</span>
                      <span>✓ Privacy protection</span>
                      <span>✓ OFAC compliance</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals - Rendered at root level for proper overlay */}
        <VerificationModal
          isOpen={verificationModal.isOpen}
          onClose={() => setVerificationModal({ isOpen: false, type: 'landlord' })}
          verificationType={verificationModal.type}
          onVerificationComplete={handleVerificationComplete}
        />

        {/* Tenant Application Modal */}
        {applicationModal.isOpen && applicationModal.property && (
          <TenantApplication
            property={applicationModal.property}
            isFullProperty={applicationModal.isFullProperty}
            selectedRoomNumber={applicationModal.selectedRoomNumber}
            onClose={() => setApplicationModal({ isOpen: false, property: null, isFullProperty: false })}
            onSuccess={handleApplicationSuccess}
          />
        )}

        {/* Property Token Purchase Modal */}
        {tokenPurchaseModal.isOpen && (
          <PropertyTokenPurchase
            propertyId={tokenPurchaseModal.propertyId}
            propertyTokenAddress={tokenPurchaseModal.propertyTokenAddress}
            onClose={() => setTokenPurchaseModal({ isOpen: false, propertyId: 0, propertyTokenAddress: '' })}
            onSuccess={handleTokenPurchaseSuccess}
          />
        )}
      </>
    );
  }

  if (currentView === 'property-browse') {
    return (
      <>
        {/* Property Browse Content */}
        <div className="min-h-screen bg-gray-50">
          <nav className="navbar">
            <div className="nav-brand">
              <h2>SafeLease</h2>
            </div>
            <div className="nav-links">
              {walletAddress && (
                <div className="text-sm text-gray-600">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </div>
              )}
              <button
                onClick={() => setCurrentView('dashboard')}
                className="btn btn-gradient"
              >
                Back to Dashboard
              </button>
            </div>
          </nav>

          <PropertyBrowse
            onApplyForProperty={handleApplyForProperty}
            onPurchaseTokens={handlePurchaseTokens}
          />
        </div>

        {/* Modals - Rendered at root level for proper overlay */}
        <VerificationModal
          isOpen={verificationModal.isOpen}
          onClose={() => setVerificationModal({ isOpen: false, type: 'landlord' })}
          verificationType={verificationModal.type}
          onVerificationComplete={handleVerificationComplete}
        />

        {/* Tenant Application Modal */}
        {applicationModal.isOpen && applicationModal.property && (
          <TenantApplication
            property={applicationModal.property}
            isFullProperty={applicationModal.isFullProperty}
            selectedRoomNumber={applicationModal.selectedRoomNumber}
            onClose={() => setApplicationModal({ isOpen: false, property: null, isFullProperty: false })}
            onSuccess={handleApplicationSuccess}
          />
        )}

        {/* Property Token Purchase Modal */}
        {tokenPurchaseModal.isOpen && (
          <PropertyTokenPurchase
            propertyId={tokenPurchaseModal.propertyId}
            propertyTokenAddress={tokenPurchaseModal.propertyTokenAddress}
            onClose={() => setTokenPurchaseModal({ isOpen: false, propertyId: 0, propertyTokenAddress: '' })}
            onSuccess={handleTokenPurchaseSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div className="landing-page">
        <nav className="navbar">
          <div className="nav-brand">
            <h2>SafeLease</h2>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="btn btn-gradient ml-4"
            >
              Dashboard
            </button>
          </div>
        </nav>

        <main className="hero">
          <div className="hero-content">
            <h1>Secure Property Leasing Made Simple</h1>
            <p className="hero-subtitle">
              SafeLease provides a trusted platform for secure property rentals with 
              verified tenants, transparent agreements, and comprehensive protection using Self Protocol identity verification.
            </p>
            <div className="hero-buttons">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="btn btn-gradient"
              >
                Get Started
              </button>
              <button className="btn btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="property-card">
              <div className="property-image"></div>
              <div className="property-info">
                <h3>Modern Apartment</h3>
                <p>$2,500/month</p>
                <div className="property-badge">Verified</div>
              </div>
            </div>
          </div>
        </main>

        <section id="features" className="features">
          <div className="container">
            <h2>Why Choose SafeLease?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Self Protocol Verification</h3>
                <p>Identity verification using Self Protocol ensures secure, privacy-preserving verification without sharing personal data.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✅</div>
                <h3>Verified Tenants</h3>
                <p>Comprehensive background checks and identity verification for all tenants using blockchain technology.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Smart Contracts</h3>
                <p>Automated lease agreements with transparent terms and automated enforcement on Celo blockchain.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3>AI Damage Verification</h3>
                <p>Automated property damage assessment using AI to ensure fair deposit refunds and dispute resolution.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2>About SafeLease</h2>
                <p>
                  SafeLease revolutionizes the property rental market by combining traditional 
                  real estate with cutting-edge blockchain technology and Self Protocol identity verification. 
                  We ensure secure, transparent, and efficient property leasing for both landlords and tenants.
                </p>
                <div className="stats">
                  <div className="stat">
                    <h3>10,000+</h3>
                    <p>Properties Listed</p>
                  </div>
                  <div className="stat">
                    <h3>50,000+</h3>
                    <p>Verified Users</p>
                  </div>
                  <div className="stat">
                    <h3>99.9%</h3>
                    <p>Security Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer id="contact" className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>SafeLease</h3>
                <p>Secure property leasing platform</p>
              </div>
              <div className="footer-section">
                <h4>Quick Links</h4>
                <a href="#features">Features</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-section">
                <h4>Contact</h4>
                <p>hello@safelease.com</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 SafeLease. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals - Rendered at root level for proper overlay */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, type: 'landlord' })}
        verificationType={verificationModal.type}
        onVerificationComplete={handleVerificationComplete}
      />

      {/* Tenant Application Modal */}
      {applicationModal.isOpen && applicationModal.property && (
        <TenantApplication
          property={applicationModal.property}
          isFullProperty={applicationModal.isFullProperty}
          selectedRoomNumber={applicationModal.selectedRoomNumber}
          onClose={() => setApplicationModal({ isOpen: false, property: null, isFullProperty: false })}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Property Token Purchase Modal */}
      {tokenPurchaseModal.isOpen && (
        <PropertyTokenPurchase
          propertyId={tokenPurchaseModal.propertyId}
          propertyTokenAddress={tokenPurchaseModal.propertyTokenAddress}
          onClose={() => setTokenPurchaseModal({ isOpen: false, propertyId: 0, propertyTokenAddress: '' })}
          onSuccess={handleTokenPurchaseSuccess}
        />
      )}
    </>
  );
};

export default App;
