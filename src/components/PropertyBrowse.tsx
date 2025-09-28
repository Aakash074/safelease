import React, { useState, useEffect } from 'react';
import { handleImageError } from '../utils/imageUtils';

interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  totalMonthlyRent: number;
  roomRent: number;
  deposit: number;
  maxRooms: number;
  occupiedRooms: number;
  images: string[];
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
  owner: string;
  createdAt: string;
  isTokenized: boolean;
  ownershipPercentage?: number;
}

interface PropertyBrowseProps {
  onApplyForProperty: (propertyId: number, isFullProperty: boolean, roomNumber?: number) => void;
  onPurchaseTokens: (propertyId: number) => void;
}

export const PropertyBrowse: React.FC<PropertyBrowseProps> = ({
  onApplyForProperty,
  onPurchaseTokens
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState({
    location: '',
    maxRent: '',
    minRooms: '',
    hasWifi: false,
    hasParking: false,
    isPetFriendly: false,
    isTokenized: false
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'rooms' | 'date'>('price');

  // Mock data - in production, this would come from smart contracts
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: 1,
        title: "Modern 3BR Apartment in Downtown",
        description: "Beautiful modern apartment with stunning city views. Perfect for professionals or students.",
        location: "San Francisco, CA",
        totalMonthlyRent: 4500,
        roomRent: 1500,
        deposit: 4500,
        maxRooms: 3,
        occupiedRooms: 1,
        images: ['/images/lpi1.jpeg', '/images/lpi1.jpeg'],
        features: {
          hasWifi: true,
          hasParking: true,
          hasLaundry: true,
          hasGym: false,
          isPetFriendly: true,
          isSmokeFree: true,
          bedrooms: 3,
          bathrooms: 2
        },
        owner: "0x1234...5678",
        createdAt: "2024-01-15",
        isTokenized: true,
        ownershipPercentage: 75
      },
      {
        id: 2,
        title: "Cozy 2BR House with Garden",
        description: "Charming house with private garden, perfect for families or roommates.",
        location: "Austin, TX",
        totalMonthlyRent: 3200,
        roomRent: 1600,
        deposit: 3200,
        maxRooms: 2,
        occupiedRooms: 0,
        images: ['/images/lpi2.jpeg'],
        features: {
          hasWifi: true,
          hasParking: true,
          hasLaundry: false,
          hasGym: false,
          isPetFriendly: true,
          isSmokeFree: true,
          bedrooms: 2,
          bathrooms: 1
        },
        owner: "0x9876...5432",
        createdAt: "2024-01-20",
        isTokenized: false
      },
      {
        id: 3,
        title: "Luxury 4BR Penthouse",
        description: "High-end penthouse with premium amenities and panoramic views.",
        location: "New York, NY",
        totalMonthlyRent: 8000,
        roomRent: 2000,
        deposit: 8000,
        maxRooms: 4,
        occupiedRooms: 2,
        images: ['/images/lpi3.jpeg', '/images/lpi3.jpeg'],
        features: {
          hasWifi: true,
          hasParking: true,
          hasLaundry: true,
          hasGym: true,
          isPetFriendly: false,
          isSmokeFree: true,
          bedrooms: 4,
          bathrooms: 3
        },
        owner: "0x5555...7777",
        createdAt: "2024-01-10",
        isTokenized: true,
        ownershipPercentage: 60
      }
    ];

    setProperties(mockProperties);
    setFilteredProperties(mockProperties);
  }, []);

  // Filter and sort properties
  useEffect(() => {
    let filtered = properties.filter(property => {
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.maxRent && property.roomRent > parseInt(filters.maxRent)) {
        return false;
      }
      if (filters.minRooms && property.maxRooms < parseInt(filters.minRooms)) {
        return false;
      }
      if (filters.hasWifi && !property.features.hasWifi) {
        return false;
      }
      if (filters.hasParking && !property.features.hasParking) {
        return false;
      }
      if (filters.isPetFriendly && !property.features.isPetFriendly) {
        return false;
      }
      if (filters.isTokenized && !property.isTokenized) {
        return false;
      }
      return true;
    });

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.roomRent - b.roomRent;
        case 'rooms':
          return b.maxRooms - a.maxRooms;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredProperties(filtered);
  }, [properties, filters, sortBy]);

  const getOccupancyColor = (occupied: number, max: number) => {
    const percentage = (occupied / max) * 100;
    if (percentage === 0) return 'text-green-600 bg-green-100';
    if (percentage < 50) return 'text-yellow-600 bg-yellow-100';
    if (percentage < 100) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getOccupancyText = (occupied: number, max: number) => {
    const available = max - occupied;
    if (available === 0) return 'Fully Occupied';
    if (available === max) return 'Available';
    return `${available} Room${available > 1 ? 's' : ''} Available`;
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">🔍 Find Your Perfect Home</h2>
        <p className="dashboard-card-subtitle">Browse properties and rooms - rent whole property or individual rooms</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filters</h3>
            
            {/* Location */}
            <div className="form-group">
              <label className="form-label">📍 Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                placeholder="City, State"
                className="form-input"
              />
            </div>

            {/* Max Rent */}
            <div className="form-group">
              <label className="form-label">💰 Max Rent (per room)</label>
              <input
                type="number"
                value={filters.maxRent}
                onChange={(e) => setFilters({...filters, maxRent: e.target.value})}
                placeholder="$2000"
                className="form-input"
              />
            </div>

            {/* Min Rooms */}
            <div className="form-group">
              <label className="form-label">🏠 Min Rooms</label>
              <select
                value={filters.minRooms}
                onChange={(e) => setFilters({...filters, minRooms: e.target.value})}
                className="form-select"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Features */}
            <div className="form-group">
              <label className="form-label">✨ Features</label>
              <div className="space-y-2">
                <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasWifi}
                    onChange={(e) => setFilters({...filters, hasWifi: e.target.checked})}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">📶 WiFi</span>
                </label>
                <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasParking}
                    onChange={(e) => setFilters({...filters, hasParking: e.target.checked})}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">🚗 Parking</span>
                </label>
                <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isPetFriendly}
                    onChange={(e) => setFilters({...filters, isPetFriendly: e.target.checked})}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">🐕 Pet Friendly</span>
                </label>
                <label className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isTokenized}
                    onChange={(e) => setFilters({...filters, isTokenized: e.target.checked})}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">🪙 Tokenized Properties</span>
                </label>
              </div>
            </div>

            {/* Sort */}
            <div className="form-group">
              <label className="form-label">📊 Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'rooms' | 'date')}
                className="form-select"
              >
                <option value="price">Price (Low to High)</option>
                <option value="rooms">Most Rooms</option>
                <option value="date">Newest First</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({
                location: '',
                maxRent: '',
                minRooms: '',
                hasWifi: false,
                hasParking: false,
                isPetFriendly: false,
                isTokenized: false
              })}
              className="btn btn-secondary w-full"
            >
              🗑️ Clear Filters
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              🏠 {filteredProperties.length} Properties Found
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="property-grid">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="property-card"
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="property-card-image">
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover rounded-t-xl"
                      onError={handleImageError}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOccupancyColor(property.occupiedRooms, property.maxRooms)}`}>
                        {getOccupancyText(property.occupiedRooms, property.maxRooms)}
                      </span>
                    </div>
                    {/* {property.isTokenized && (
                      <div className="absolute top-2 left-2" style={{top: '4'}}>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🪙 Tokenized
                        </span>
                      </div>
                    )} */}
                  </div>
                  
                  <div className="property-card-content">
                    <h3 className="property-card-title">{property.title}</h3>
                    <p className="property-card-location">{property.location}</p>
                    
                    <div className="property-card-price">${property.roomRent}/room/month</div>
                    <div className="property-card-details">
                      <span>{property.features.bedrooms} bed • {property.features.bathrooms} bath</span>
                      <span>{property.maxRooms} rooms</span>
                    </div>

                    <div className="property-features">
                      {property.features.hasWifi && <span className="property-feature-tag">📶 WiFi</span>}
                      {property.features.hasParking && <span className="property-feature-tag">🚗 Parking</span>}
                      {property.features.isPetFriendly && <span className="property-feature-tag">🐕 Pet Friendly</span>}
                      {property.features.hasLaundry && <span className="property-feature-tag">🧺 Laundry</span>}
                    </div>

                    <div className="property-card-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyForProperty(property.id, false);
                        }}
                        className="btn btn-gradient"
                      >
                        Rent Room
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyForProperty(property.id, true);
                        }}
                        className="btn btn-success"
                      >
                        Rent All
                      </button>
                    </div>
                    
                    {property.isTokenized && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPurchaseTokens(property.id);
                        }}
                        className="w-full mt-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm"
                      >
                        🪙 Buy Property Tokens
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="property-card-list bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="property-card-image-list">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                        onError={handleImageError}
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOccupancyColor(property.occupiedRooms, property.maxRooms)}`}>
                          {getOccupancyText(property.occupiedRooms, property.maxRooms)}
                        </span>
                      </div>
                      {/* {property.isTokenized && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            🪙 Tokenized
                          </span>
                        </div>
                      )} */}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                      <p className="text-gray-700 mb-4">{property.description}</p>
                      
                      <div className="property-features mb-4">
                        {property.features.hasWifi && <span className="property-feature-tag">📶 WiFi</span>}
                        {property.features.hasParking && <span className="property-feature-tag">🚗 Parking</span>}
                        {property.features.isPetFriendly && <span className="property-feature-tag">🐕 Pet Friendly</span>}
                        {property.features.hasLaundry && <span className="property-feature-tag">🧺 Laundry</span>}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold text-blue-600">${property.roomRent}</span>
                          <span className="text-gray-500">/room/month</span>
                          <span className="text-sm text-gray-600">• {property.maxRooms} rooms</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplyForProperty(property.id, false);
                            }}
                            className="btn btn-gradient"
                          >
                            Rent Room
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplyForProperty(property.id, true);
                            }}
                            className="btn btn-success"
                          >
                            Rent All
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="property-modal-overlay">
          <div className="property-modal-content">
            <div className="property-modal-header">
              {selectedProperty.isTokenized ? '🏠💰' : '🏠'}
              <button
                onClick={() => setSelectedProperty(null)}
                className="modal-close absolute top-4 right-4"
              >
                ×
              </button>
            </div>
            <div className="property-modal-body">
              <h2 className="property-modal-title">{selectedProperty.title}</h2>
              <p className="property-modal-location">{selectedProperty.location}</p>

              <div className="property-modal-price">${selectedProperty.roomRent}/room/month</div>
              <p className="property-modal-description">{selectedProperty.description}</p>
              
              <div className="property-modal-features">
                <h3>✨ Property Features</h3>
                <div className="property-modal-features-grid">
                  <div className={`property-modal-feature ${selectedProperty.features.hasWifi ? 'active' : ''}`}>
                    📶 WiFi {selectedProperty.features.hasWifi ? '✓' : '✗'}
                  </div>
                  <div className={`property-modal-feature ${selectedProperty.features.hasParking ? 'active' : ''}`}>
                    🚗 Parking {selectedProperty.features.hasParking ? '✓' : '✗'}
                  </div>
                  <div className={`property-modal-feature ${selectedProperty.features.hasLaundry ? 'active' : ''}`}>
                    🧺 Laundry {selectedProperty.features.hasLaundry ? '✓' : '✗'}
                  </div>
                  <div className={`property-modal-feature ${selectedProperty.features.hasGym ? 'active' : ''}`}>
                    💪 Gym {selectedProperty.features.hasGym ? '✓' : '✗'}
                  </div>
                  <div className={`property-modal-feature ${selectedProperty.features.isPetFriendly ? 'active' : ''}`}>
                    🐕 Pet Friendly {selectedProperty.features.isPetFriendly ? '✓' : '✗'}
                  </div>
                  <div className={`property-modal-feature ${selectedProperty.features.isSmokeFree ? 'active' : ''}`}>
                    🚭 Smoke Free {selectedProperty.features.isSmokeFree ? '✓' : '✗'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">💰 Pricing Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Per Room:</span>
                    <span className="font-semibold">${selectedProperty.roomRent}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Property:</span>
                    <span className="font-semibold">${selectedProperty.totalMonthlyRent}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit:</span>
                    <span className="font-semibold">${selectedProperty.deposit}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">📊 Availability</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rooms:</span>
                    <span className="font-semibold">{selectedProperty.maxRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-semibold">{selectedProperty.occupiedRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-green-600">{selectedProperty.maxRooms - selectedProperty.occupiedRooms}</span>
                  </div>
                </div>
              </div>

              <div className="property-modal-actions">
                <button
                  onClick={() => {
                    onApplyForProperty(selectedProperty.id, false);
                    setSelectedProperty(null);
                  }}
                  className="btn btn-gradient"
                >
                  🔑 Rent Individual Room
                </button>
                <button
                  onClick={() => {
                    onApplyForProperty(selectedProperty.id, true);
                    setSelectedProperty(null);
                  }}
                  className="btn btn-success"
                >
                  🏠 Rent Entire Property
                </button>
                {selectedProperty.isTokenized && (
                  <button
                    onClick={() => {
                      onPurchaseTokens(selectedProperty.id);
                      setSelectedProperty(null);
                    }}
                    className="btn btn-purple"
                  >
                    🪙 Purchase Property Tokens
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};