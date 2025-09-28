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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {verificationType === 'landlord' && '🏡 Landlord Verification'}
                {verificationType === 'tenant' && '🔑 Tenant Verification'}
              </h2>
              <button
                onClick={onClose}
                className="modal-close"
              >
                ×
              </button>
            </div>

        {step === 'form' && (
          <div className="modal-body">
            <p className="text-gray-600 mb-4">
              {verificationType === 'landlord' && 
                'Verify your identity to list rental properties on SafeLease.'}
              {verificationType === 'tenant' && 
                'Verify your identity and income to apply for rental properties.'}
            </p>

            {verificationType === 'tenant' && (
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Monthly Income Range
                  </label>
                  <select
                    value={formData.incomeRange}
                    onChange={(e) => setFormData({ ...formData, incomeRange: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select income range</option>
                    <option value="0-2500">$0 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="5000-7500">$5,000 - $7,500</option>
                    <option value="7500-10000">$7,500 - $10,000</option>
                    <option value="10000+">$10,000+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Employment Status
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="form-select"
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

            <div className="modal-footer">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleStartVerification}
                disabled={isLoading}
                className="btn btn-gradient"
              >
                {isLoading ? 'Starting...' : 'Start Verification'}
              </button>
            </div>
          </div>
        )}

        {step === 'qr' && (
          <div className="modal-body">
            <div className="qr-section">
              <h3 className="qr-title">📱 Scan QR Code</h3>
              <p className="qr-description">
                Scan this QR code with your Self app to complete verification.
              </p>
              
              <div className="qr-container">
                {selfApp ? (
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
                ) : qrCode ? (
                  <img src={qrCode} alt="Verification QR Code" style={{ width: '200px', height: '200px', borderRadius: '1rem' }} />
                ) : (
                  <div className="qr-placeholder">
                    Loading QR Code...
                  </div>
                )}
              </div>
            </div>
            
            <div className="demo-notice">
              <div className="demo-notice-header">
                <div className="demo-notice-icon">ℹ️</div>
                <h4 className="demo-notice-title">Demo Mode</h4>
              </div>
              <p className="demo-notice-text">
                For the hackathon demo, click "Complete Verification" to simulate successful verification.
                In production, this would be handled by the Self Protocol integration.
              </p>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setStep('form')}
                className="btn btn-secondary"
              >
                Back
              </button>
              <button
                onClick={() => handleVerificationComplete({ success: true })}
                className="btn btn-success"
              >
                Complete Verification (Demo)
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="modal-body">
            <div className="text-center">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">
                Verification Complete!
              </h3>
              <p className="text-green-700 text-lg mb-6">
                Your identity has been successfully verified. You can now use SafeLease services.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={onClose}
                className="btn btn-success w-full"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
