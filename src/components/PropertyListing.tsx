import React, { useState } from 'react';

interface PropertyFeatures {
  hasWifi: boolean;
  hasParking: boolean;
  hasLaundry: boolean;
  hasGym: boolean;
  isPetFriendly: boolean;
  isSmokeFree: boolean;
  bedrooms: number;
  bathrooms: number;
}

interface PropertyListingProps {
  onListProperty: (propertyData: any) => void;
  isVerificationComplete: boolean;
}

export const PropertyListing: React.FC<PropertyListingProps> = ({
  onListProperty,
  isVerificationComplete,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    monthlyRent: '',
    deposit: '',
    maxTenants: '',
    isShared: false,
    images: [] as string[],
    features: {
      hasWifi: false,
      hasParking: false,
      hasLaundry: false,
      hasGym: false,
      isPetFriendly: false,
      isSmokeFree: true,
      bedrooms: 1,
      bathrooms: 1,
    } as PropertyFeatures,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerificationComplete) {
      alert('Please complete identity verification first.');
      return;
    }

    const propertyData = {
      ...formData,
      monthlyRent: parseFloat(formData.monthlyRent),
      deposit: parseFloat(formData.deposit),
      maxTenants: parseInt(formData.maxTenants),
    };

    onListProperty(propertyData);
  };

  const handleFeatureChange = (feature: keyof PropertyFeatures, value: boolean | number) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: value,
      },
    });
  };

  if (!isVerificationComplete) {
    return (
      <div className="dashboard-card">
        <div className="alert-warning">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3 className="alert-title">Verification Required</h3>
            <p className="alert-text">
              Please complete landlord verification to list properties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">🏡 List Your Property</h2>
        <p className="dashboard-card-subtitle">Create a detailed listing for your rental property</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Property Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              placeholder="e.g., Modern 2BR Apartment in Downtown"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="form-input"
              placeholder="e.g., San Francisco, CA"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-textarea"
            placeholder="Describe your property, amenities, and what makes it special..."
            rows={4}
            required
          />
        </div>

        {/* Pricing */}
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">
              Monthly Rent (CELO) *
            </label>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              className="form-input"
              placeholder="2500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Security Deposit (CELO) *
            </label>
            <input
              type="number"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              className="form-input"
              placeholder="2500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Max Tenants *
            </label>
            <input
              type="number"
              value={formData.maxTenants}
              onChange={(e) => setFormData({ ...formData, maxTenants: e.target.value })}
              className="form-input"
              placeholder="2"
              min="1"
              required
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="form-group">
          <label className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-transparent hover:border-blue-200 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isShared}
              onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
              className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="form-label mb-0">
              🏠 This is a shared accommodation (shared tenant matching available)
            </span>
          </label>
        </div>

        {/* Property Features */}
        <div className="form-group">
          <h3 className="form-label mb-4">✨ Property Features</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.hasWifi}
                onChange={(e) => handleFeatureChange('hasWifi', e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">📶 WiFi</span>
            </label>
            
            <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.hasParking}
                onChange={(e) => handleFeatureChange('hasParking', e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">🚗 Parking</span>
            </label>
            
            <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.hasLaundry}
                onChange={(e) => handleFeatureChange('hasLaundry', e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">🧺 Laundry</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.hasGym}
                onChange={(e) => handleFeatureChange('hasGym', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Gym</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.isPetFriendly}
                onChange={(e) => handleFeatureChange('isPetFriendly', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Pet Friendly</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.isSmokeFree}
                onChange={(e) => handleFeatureChange('isSmokeFree', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Smoke Free</span>
            </label>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                🛏️ Bedrooms
              </label>
              <select
                value={formData.features.bedrooms}
                onChange={(e) => handleFeatureChange('bedrooms', parseInt(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Bedroom' : 'Bedrooms'}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                🚿 Bathrooms
              </label>
              <select
                value={formData.features.bathrooms}
                onChange={(e) => handleFeatureChange('bathrooms', parseInt(e.target.value))}
                className="form-select"
              >
                {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Bathroom' : 'Bathrooms'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-group pt-6">
          <button
            type="submit"
            className="btn btn-success w-full text-lg py-3"
          >
            🏡 List Property & Create Token
          </button>
        </div>
      </form>
    </div>
  );
};
