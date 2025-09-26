import React, { useState, useEffect } from 'react';
import { web3Manager } from '../utils/web3';

interface Property {
  id: number;
  title: string;
  location: string;
  totalMonthlyRent: number;
  roomRent: number;
  deposit: number;
  maxRooms: number;
  occupiedRooms: number;
  features: {
    hasWifi: boolean;
    hasParking: boolean;
    hasLaundry: boolean;
    hasGym: boolean;
    isPetFriendly: boolean;
    isSmokeFree: boolean;
    bedrooms: number;
    bathrooms: number;
  };
}

interface TenantApplicationProps {
  property: Property;
  isFullProperty: boolean;
  selectedRoomNumber?: number;
  onClose: () => void;
  onSuccess: (applicationId: number) => void;
}

export const TenantApplication: React.FC<TenantApplicationProps> = ({
  property,
  isFullProperty,
  selectedRoomNumber,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    employmentStatus: '',
    additionalInfo: '',
    preferredMoveInDate: '',
    leaseDuration: '12',
    hasPets: false,
    hasVehicle: false,
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerified, setIsVerified] = useState(false);

  const steps = [
    'Personal Information',
    'Income & Employment',
    'Preferences & Details',
    'Review & Submit'
  ];

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const address = await web3Manager.getCurrentAddress();
      if (address) {
        const verified = await web3Manager.isUserVerified(address);
        setIsVerified(verified);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.monthlyIncome || !formData.employmentStatus || !formData.preferredMoveInDate) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const roomNumber = isFullProperty ? 0 : (selectedRoomNumber || 1);
      
      const tx = await web3Manager.applyForProperty(
        property.id,
        isFullProperty,
        roomNumber,
        parseFloat(formData.monthlyIncome),
        formData.employmentStatus,
        formData.additionalInfo
      );

      await tx.wait();
      
      // Extract application ID from transaction (in real implementation)
      const applicationId = Math.floor(Math.random() * 1000) + 1; // Mock ID
      
      onSuccess(applicationId);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRentAmount = () => {
    return isFullProperty ? property.totalMonthlyRent : property.roomRent;
  };

  const getIncomeToRentRatio = () => {
    const income = parseFloat(formData.monthlyIncome);
    const rent = getRentAmount();
    return income > 0 ? (rent / income * 100).toFixed(1) : '0';
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVerified) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Required</h3>
            <p className="text-gray-600 mb-6">
              You must complete identity verification before applying for properties.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
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
              <h2 className="text-2xl font-bold text-gray-900">Application for {property.title}</h2>
              <p className="text-gray-600">{property.location}</p>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isFullProperty ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {isFullProperty ? 'Full Property' : `Room ${selectedRoomNumber || 1}`}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep > index + 1 
                      ? 'bg-green-600 text-white' 
                      : currentStep === index + 1 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${
                    currentStep >= index + 1 ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 ${
                      currentStep > index + 1 ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Move-in Date *
                  </label>
                  <input
                    type="date"
                    value={formData.preferredMoveInDate}
                    onChange={(e) => handleInputChange('preferredMoveInDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Duration (months)
                  </label>
                  <select
                    value={formData.leaseDuration}
                    onChange={(e) => handleInputChange('leaseDuration', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact *
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasPets}
                    onChange={(e) => handleInputChange('hasPets', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">I have pets</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasVehicle}
                    onChange={(e) => handleInputChange('hasVehicle', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">I have a vehicle (parking needed)</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Income & Employment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Income & Employment</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income *
                </label>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="5000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Rent-to-income ratio: {getIncomeToRentRatio()}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Status *
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed (Full-time)</option>
                  <option value="employed-part-time">Employed (Part-time)</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Rent Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Monthly Rent:</span>
                    <span className="font-semibold text-blue-900">${getRentAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Security Deposit:</span>
                    <span className="font-semibold text-blue-900">${property.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Move-in Cost:</span>
                    <span className="font-semibold text-blue-900">${(getRentAmount() + property.deposit).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences & Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about yourself
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Tell us about your lifestyle, interests, what you're looking for in a home..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Property Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {property.features.hasWifi && <span className="text-green-600">✓ WiFi</span>}
                  {property.features.hasParking && <span className="text-green-600">✓ Parking</span>}
                  {property.features.hasLaundry && <span className="text-green-600">✓ Laundry</span>}
                  {property.features.hasGym && <span className="text-green-600">✓ Gym</span>}
                  {property.features.isPetFriendly && <span className="text-green-600">✓ Pet Friendly</span>}
                  {property.features.isSmokeFree && <span className="text-green-600">✓ Smoke Free</span>}
                  <span className="text-gray-600">{property.features.bedrooms} bedrooms</span>
                  <span className="text-gray-600">{property.features.bathrooms} bathrooms</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-yellow-600 text-xl mr-3">📋</div>
                  <div>
                    <h4 className="text-yellow-800 font-medium mb-1">Application Process</h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Your application will be reviewed by the property owner</li>
                      <li>• You may be contacted for additional information</li>
                      <li>• A decision will be made within 48-72 hours</li>
                      <li>• If approved, you'll receive lease documents to sign</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Review Your Application</h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Property Details</h4>
                    <p className="text-gray-700">{property.title}</p>
                    <p className="text-gray-600 text-sm">{property.location}</p>
                    <p className="text-gray-600 text-sm">
                      {isFullProperty ? 'Full Property' : `Room ${selectedRoomNumber || 1}`} - ${getRentAmount().toLocaleString()}/month
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Move-in Details</h4>
                    <p className="text-gray-700">Preferred move-in: {formData.preferredMoveInDate}</p>
                    <p className="text-gray-700">Lease duration: {formData.leaseDuration} months</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Income Information</h4>
                    <p className="text-gray-700">Monthly income: ${parseFloat(formData.monthlyIncome).toLocaleString()}</p>
                    <p className="text-gray-700">Employment: {formData.employmentStatus}</p>
                    <p className="text-gray-700">Rent-to-income ratio: {getIncomeToRentRatio()}%</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <p className="text-gray-700">Emergency contact: {formData.emergencyContact}</p>
                    <p className="text-gray-700">Emergency phone: {formData.emergencyPhone}</p>
                  </div>

                  {formData.additionalInfo && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                      <p className="text-gray-700">{formData.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 text-xl mr-3">🔒</div>
                  <div>
                    <h4 className="text-blue-800 font-medium mb-1">Secure Application</h4>
                    <p className="text-blue-700 text-sm">
                      Your application is secured by blockchain technology and will be processed securely.
                      All information is encrypted and only accessible to authorized parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={currentStep === 1 ? onClose : prevStep}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateForm() || isSubmitting}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
