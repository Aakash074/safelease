import React, { useState, useEffect } from 'react';
import { web3Manager } from '../utils/web3';

interface PropertyTokenInfo {
  propertyId: string;
  propertyAddress: string;
  totalValue: string;
  totalTokens: string;
  propertyOwner: string;
  isActive: boolean;
  createdAt: string;
}

interface InvestorStatus {
  isWhitelisted: boolean;
  isAccredited: boolean;
  maxInvestment: string;
  currentInvestment: string;
  country: string;
  ofacCompliant: boolean;
}

interface PropertyTokenPurchaseProps {
  propertyId: number;
  propertyTokenAddress: string;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
}

export const PropertyTokenPurchase: React.FC<PropertyTokenPurchaseProps> = ({
  propertyId,
  propertyTokenAddress,
  onClose,
  onSuccess
}) => {
  const [propertyInfo, setPropertyInfo] = useState<PropertyTokenInfo | null>(null);
  const [investorStatus, setInvestorStatus] = useState<InvestorStatus | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [step, setStep] = useState<'info' | 'purchase' | 'success'>('info');

  useEffect(() => {
    loadPropertyData();
  }, [propertyTokenAddress]);

  const loadPropertyData = async () => {
    setIsLoading(true);
    try {
      const address = await web3Manager.getCurrentAddress();
      if (!address) {
        throw new Error('Wallet not connected');
      }
      setCurrentAddress(address);

      // Load property token info
      const tokenInfo = await web3Manager.getPropertyTokenInfo(propertyTokenAddress);
      if (tokenInfo) {
        setPropertyInfo({
          propertyId: tokenInfo.propertyId,
          propertyAddress: tokenInfo.propertyAddress,
          totalValue: web3Manager.formatEther(tokenInfo.totalValue),
          totalTokens: web3Manager.formatEther(tokenInfo.totalTokens),
          propertyOwner: tokenInfo.propertyOwner,
          isActive: tokenInfo.isActive,
          createdAt: new Date(Number(tokenInfo.createdAt) * 1000).toLocaleDateString()
        });
      }

      // Load investor status
      const investor = await web3Manager.getInvestorStatus(propertyTokenAddress, address);
      if (investor) {
        setInvestorStatus({
          isWhitelisted: investor.isWhitelisted,
          isAccredited: investor.isAccredited,
          maxInvestment: web3Manager.formatEther(investor.maxInvestment),
          currentInvestment: web3Manager.formatEther(investor.currentInvestment),
          country: investor.country,
          ofacCompliant: investor.ofacCompliant
        });
      }

      // Load token balance
      const balance = await web3Manager.getTokenBalance(propertyTokenAddress, address);
      setTokenBalance(balance);

    } catch (error) {
      console.error('Error loading property data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!purchaseAmount || !propertyInfo) return;

    setIsPurchasing(true);
    try {
      const amount = parseFloat(purchaseAmount);
      const totalCost = amount; // 1 token = $1

      const tx = await web3Manager.purchasePropertyTokens(
        propertyTokenAddress,
        amount,
        totalCost.toString()
      );

      await tx.wait();
      setStep('success');
      onSuccess(tx.hash);
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      alert('Failed to purchase tokens. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getTokenPrice = () => {
    if (!propertyInfo) return 1;
    return parseFloat(propertyInfo.totalValue) / parseFloat(propertyInfo.totalTokens);
  };

  const getOwnershipPercentage = () => {
    if (!propertyInfo || !tokenBalance) return 0;
    const owned = parseFloat(tokenBalance);
    const total = parseFloat(propertyInfo.totalTokens);
    return (owned / total) * 100;
  };

  const getRemainingInvestment = () => {
    if (!investorStatus) return '0';
    const max = parseFloat(investorStatus.maxInvestment);
    const current = parseFloat(investorStatus.currentInvestment);
    return (max - current).toString();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Property Data</h3>
            <p className="text-gray-600">Fetching token information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Token Investment</h2>
              <p className="text-gray-600">Invest in fractional property ownership</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {step === 'info' && (
            <div className="space-y-6">
              {/* Property Information */}
              {propertyInfo && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Property ID:</span>
                      <p className="font-semibold">{propertyInfo.propertyId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <p className="font-semibold">{propertyInfo.propertyAddress}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total Value:</span>
                      <p className="font-semibold">${parseFloat(propertyInfo.totalValue).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total Tokens:</span>
                      <p className="font-semibold">{parseFloat(propertyInfo.totalTokens).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Token Price:</span>
                      <p className="font-semibold">${getTokenPrice().toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="font-semibold">{propertyInfo.createdAt}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Holdings */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Current Holdings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{parseFloat(tokenBalance).toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Tokens Owned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{getOwnershipPercentage().toFixed(2)}%</div>
                    <div className="text-sm text-blue-700">Ownership</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">${(parseFloat(tokenBalance) * getTokenPrice()).toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Value</div>
                  </div>
                </div>
              </div>

              {/* Investor Status */}
              {investorStatus && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Investment Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Verification Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${investorStatus.isWhitelisted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {investorStatus.isWhitelisted ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Accreditation:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${investorStatus.isAccredited ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {investorStatus.isAccredited ? 'Accredited' : 'Non-Accredited'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Country:</span>
                      <span className="font-semibold text-green-900">{investorStatus.country}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">OFAC Compliance:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${investorStatus.ofacCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {investorStatus.ofacCompliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Max Investment:</span>
                      <span className="font-semibold text-green-900">${parseFloat(investorStatus.maxInvestment).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Current Investment:</span>
                      <span className="font-semibold text-green-900">${parseFloat(investorStatus.currentInvestment).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Remaining:</span>
                      <span className="font-semibold text-green-900">${parseFloat(getRemainingInvestment()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                  <div>
                    <h4 className="text-yellow-800 font-medium mb-2">Investment Compliance Notice</h4>
                    <p className="text-yellow-700 text-sm">
                      Property tokens are regulated securities. You must be verified and comply with all applicable regulations.
                      Non-accredited investors are subject to investment limits. Please ensure you understand the risks before investing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setStep('purchase')}
                  disabled={!investorStatus?.isWhitelisted || !investorStatus?.ofacCompliant}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Purchase Tokens
                </button>
              </div>
            </div>
          )}

          {step === 'purchase' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Purchase Property Tokens</h3>
                <p className="text-gray-600">Enter the amount of tokens you want to purchase</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tokens
                    </label>
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      placeholder="100"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max={getRemainingInvestment()}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-700">Token Price:</span>
                      <span className="font-semibold text-blue-900">${getTokenPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-700">Total Cost:</span>
                      <span className="font-semibold text-blue-900">
                        ${purchaseAmount ? (parseFloat(purchaseAmount) * getTokenPrice()).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">New Ownership:</span>
                      <span className="font-semibold text-blue-900">
                        {purchaseAmount ? ((parseFloat(tokenBalance) + parseFloat(purchaseAmount)) / parseFloat(propertyInfo?.totalTokens || '1') * 100).toFixed(2) : '0.00'}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-yellow-600 text-xl mr-3">💰</div>
                      <div>
                        <h4 className="text-yellow-800 font-medium mb-1">Payment Method</h4>
                        <p className="text-yellow-700 text-sm">
                          You will pay using ETH (converted to stablecoin). The transaction will be processed on the Celo testnet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('info')}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={!purchaseAmount || isPurchasing}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-green-600 text-4xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Tokens Purchased Successfully!</h3>
                <p className="text-green-700">
                  You have successfully purchased {purchaseAmount} property tokens. You now own a fractional share of this property and are entitled to proportional rental income.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-blue-800 text-sm space-y-1 text-left">
                  <li>• Monitor your investment performance in your dashboard</li>
                  <li>• Receive rental income distributions automatically</li>
                  <li>• Track property value appreciation over time</li>
                  <li>• Redeem tokens when you want to exit your investment</li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
