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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-yellow-600 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-yellow-800 font-medium">Verification Required</h3>
            <p className="text-yellow-700 text-sm">
              Please complete landlord verification to list properties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">List Your Property</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Modern 2BR Apartment in Downtown"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., San Francisco, CA"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your property, amenities, and what makes it special..."
            rows={4}
            required
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent (CELO) *
            </label>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security Deposit (CELO) *
            </label>
            <input
              type="number"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tenants *
            </label>
            <input
              type="number"
              value={formData.maxTenants}
              onChange={(e) => setFormData({ ...formData, maxTenants: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2"
              min="1"
              required
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isShared}
              onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              This is a shared accommodation (shared tenant matching available)
            </span>
          </label>
        </div>

        {/* Property Features */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Property Features</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.hasWifi}
                onChange={(e) => handleFeatureChange('hasWifi', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">WiFi</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.hasParking}
                onChange={(e) => handleFeatureChange('hasParking', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Parking</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.hasLaundry}
                onChange={(e) => handleFeatureChange('hasLaundry', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Laundry</span>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select
                value={formData.features.bedrooms}
                onChange={(e) => handleFeatureChange('bedrooms', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Bedroom' : 'Bedrooms'}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <select
                value={formData.features.bathrooms}
                onChange={(e) => handleFeatureChange('bathrooms', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Bathroom' : 'Bathrooms'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            List Property
          </button>
        </div>
      </form>
    </div>
  );
};
