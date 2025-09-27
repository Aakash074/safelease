import React, { useState } from 'react';
import { safeLeaseSelf } from '../self-integration';
import { SelfQRcode } from '@selfxyz/qrcode';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationType: 'landlord' | 'tenant';
  onVerificationComplete: (result: any) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  verificationType,
  onVerificationComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [selfApp, setSelfApp] = useState<any>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'qr' | 'complete'>('form');
  const [formData, setFormData] = useState({
    incomeRange: '',
    employmentStatus: '',
    genderPreference: '',
    lifestylePreferences: '',
  });

  const handleStartVerification = async () => {
    setIsLoading(true);
    try {
      // Validate tenant form data
      if (verificationType === 'tenant') {
        if (!formData.incomeRange || !formData.employmentStatus) {
          alert('Please select both income range and employment status for tenant verification.');
          setIsLoading(false);
          return;
        }
      }

      let verification;

      switch (verificationType) {
        case 'landlord':
          verification = await safeLeaseSelf.startLandlordVerification();
          break;
        case 'tenant':
          verification = await safeLeaseSelf.startTenantVerification(
            formData.incomeRange,
            formData.employmentStatus
          );
          break;
      }

      // Check if we have a selfApp (new method) or fallback data
      if (verification.selfApp) {
        setSelfApp(verification.selfApp);
        setVerificationData(verification);
      } else if (verification.qrCode) {
        setQrCode(verification.qrCode);
      }
      
      setStep('qr');
    } catch (error) {
      console.error('Verification start failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = (result: any) => {
    setStep('complete');
    onVerificationComplete(result);
  };

  if (!isOpen) return null;

  console.log('VerificationModal rendering with isOpen:', isOpen, 'type:', verificationType);

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="modal-content" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', maxWidth: '28rem', width: '100%', margin: '1rem' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {verificationType === 'landlord' && 'Landlord Verification'}
            {verificationType === 'tenant' && 'Tenant Verification'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {step === 'form' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              {verificationType === 'landlord' && 
                'Verify your identity to list rental properties on SafeLease.'}
              {verificationType === 'tenant' && 
                'Verify your identity and income to apply for rental properties.'}
            </p>

            {verificationType === 'tenant' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income Range
                  </label>
                  <select
                    value={formData.incomeRange}
                    onChange={(e) => setFormData({ ...formData, incomeRange: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select income range</option>
                    <option value="0-2500">$0 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="5000-7500">$5,000 - $7,500</option>
                    <option value="7500-10000">$7,500 - $10,000</option>
                    <option value="10000+">$10,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Status
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select employment status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleStartVerification}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting...' : 'Start Verification'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'qr' && (
          <div className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Scan QR Code</h3>
              <p className="text-gray-600 mb-4">
                Scan this QR code with your Self app to complete verification.
              </p>
              {selfApp ? (
                <div className="flex justify-center">
                  <SelfQRcode
                    selfApp={selfApp}
                    onSuccess={() => {
                      console.log('Verification successful');
                      handleVerificationComplete({ success: true });
                    }}
                    onError={(error: any) => {
                      console.error('Verification failed:', error);
                      alert('Verification failed: ' + (error.reason || error.error_code || 'Unknown error'));
                    }}
                    size={200}
                  />
                </div>
              ) : qrCode ? (
                <div className="flex justify-center">
                  <img src={qrCode} alt="Verification QR Code" className="w-48 h-48" />
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                    <p className="text-gray-500">Loading QR Code...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-blue-600 text-xl mr-3">ℹ️</div>
                <div>
                  <h4 className="text-blue-800 font-medium mb-1">Demo Mode</h4>
                  <p className="text-blue-700 text-sm">
                    For the hackathon demo, click "Complete Verification" to simulate successful verification.
                    In production, this would be handled by the Self Protocol integration.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleVerificationComplete({ success: true })}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Complete Verification (Demo)
              </button>
              <button
                onClick={() => setStep('form')}
                className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-4xl mb-2">✓</div>
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Verification Complete!
              </h3>
              <p className="text-green-700">
                Your identity has been successfully verified. You can now use SafeLease services.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
