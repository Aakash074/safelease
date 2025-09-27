// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SafeLeaseIdentityVerification.sol";
import "./SafeLeaseFactory.sol";

/**
 * @title SafeLeaseRentalManagement
 * @notice Rental property management for SafeLease platform
 */
contract SafeLeaseRentalManagement is Ownable {
    
    // Rental property structure
    struct RentalProperty {
        uint256 propertyId;
        address owner;
        string title;
        string description;
        string location;
        uint256 totalMonthlyRent;
        uint256 roomRent;
        uint256 deposit;
        uint256 maxRooms;
        uint256 occupiedRooms;
        bool isActive;
        uint256 createdAt;
        string[] images;
        PropertyFeatures features;
        address propertyTokenContract;
    }
    
    // Property features
    struct PropertyFeatures {
        bool hasWifi;
        bool hasParking;
        bool hasLaundry;
        bool hasGym;
        bool isPetFriendly;
        bool isSmokeFree;
        uint256 bedrooms;
        uint256 bathrooms;
    }
    
    // Tenant application structure
    struct TenantApplication {
        uint256 applicationId;
        address tenant;
        uint256 propertyId;
        uint256 monthlyIncome;
        string employmentStatus;
        string additionalInfo;
        ApplicationStatus status;
        uint256 appliedAt;
        bool isFullProperty;
        uint256 roomNumber;
    }
    
    // Application status enum
    enum ApplicationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
    
    // Events
    event PropertyListed(
        uint256 indexed propertyId,
        address indexed owner,
        string title,
        string location
    );
    
    event ApplicationSubmitted(
        uint256 indexed applicationId,
        address indexed tenant,
        uint256 indexed propertyId
    );
    
    event ApplicationReviewed(
        uint256 indexed applicationId,
        ApplicationStatus status,
        address indexed reviewer
    );
    
    // Storage
    mapping(uint256 => RentalProperty) public properties;
    mapping(uint256 => TenantApplication) public applications;
    mapping(address => uint256[]) public ownerProperties;
    mapping(address => uint256[]) public tenantApplications;
    mapping(uint256 => uint256[]) public propertyApplications;
    
    uint256 public nextPropertyId = 1;
    uint256 public nextApplicationId = 1;
    
    // Identity verification contract
    SafeLeaseIdentityVerification public immutable identityVerification;
    
    // Factory contract for deploying property tokens
    SafeLeaseFactory public immutable factory;
    
    constructor(address _identityVerificationContract, address _factoryContract) Ownable(msg.sender) {
        identityVerification = SafeLeaseIdentityVerification(_identityVerificationContract);
        factory = SafeLeaseFactory(_factoryContract);
    }

    modifier onlyVerifiedLandlord() {
        require(
            identityVerification.isUserVerified(msg.sender, SafeLeaseIdentityVerification.VerificationType.LANDLORD),
            "Only verified landlords can perform this action"
        );
        _;
    }

    modifier onlyVerifiedTenant() {
        require(
            identityVerification.isUserVerified(msg.sender, SafeLeaseIdentityVerification.VerificationType.TENANT),
            "Only verified tenants can perform this action"
        );
        _;
    }
    
    /**
     * @notice List a new rental property
     */
    function listProperty(
        string memory _title,
        string memory _description,
        string memory _location,
        uint256 _totalMonthlyRent,
        uint256 _roomRent,
        uint256 _deposit,
        uint256 _maxRooms,
        string[] memory _images,
        PropertyFeatures memory _features
    ) external onlyVerifiedLandlord returns (uint256) {
        require(_totalMonthlyRent > 0, "Total monthly rent must be greater than 0");
        require(_roomRent > 0, "Room rent must be greater than 0");
        require(_deposit > 0, "Deposit must be greater than 0");
        require(_maxRooms > 0, "Max rooms must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        uint256 propertyId = nextPropertyId++;
        
        // Deploy property token contract
        string memory propertyIdStr = string(abi.encodePacked("PROP-", uint2str(propertyId)));
        uint256 totalValue = _totalMonthlyRent * 12 * 30; // 30 years value estimation
        uint256 totalTokens = totalValue / (10**18); // 1 token = 1 wei of property value
        
        address propertyTokenAddress = factory.deployPropertyToken(
            propertyIdStr,
            _location,
            totalValue,
            totalTokens,
            msg.sender
        );
        
        properties[propertyId] = RentalProperty({
            propertyId: propertyId,
            owner: msg.sender,
            title: _title,
            description: _description,
            location: _location,
            totalMonthlyRent: _totalMonthlyRent,
            roomRent: _roomRent,
            deposit: _deposit,
            maxRooms: _maxRooms,
            occupiedRooms: 0,
            isActive: true,
            createdAt: block.timestamp,
            images: _images,
            features: _features,
            propertyTokenContract: propertyTokenAddress
        });
        
        ownerProperties[msg.sender].push(propertyId);
        
        emit PropertyListed(propertyId, msg.sender, _title, _location);
        
        return propertyId;
    }
    
    /**
     * @notice Convert uint256 to string
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    /**
     * @notice Apply for a rental property
     */
    function applyForProperty(
        uint256 _propertyId,
        bool _isFullProperty,
        uint256 _roomNumber,
        uint256 _monthlyIncome,
        string memory _employmentStatus,
        string memory _additionalInfo
    ) external onlyVerifiedTenant returns (uint256) {
        RentalProperty storage property = properties[_propertyId];
        require(property.isActive, "Property is not active");
        require(property.owner != msg.sender, "Owner cannot apply for their own property");
        
        if (_isFullProperty) {
            require(property.occupiedRooms == 0, "Property is already fully occupied");
            require(_roomNumber == 0, "Room number must be 0 for full property rental");
        } else {
            require(_roomNumber > 0 && _roomNumber <= property.maxRooms, "Invalid room number");
        }

        // Check if tenant already applied for this property/room
        for (uint i = 0; i < propertyApplications[_propertyId].length; i++) {
            TenantApplication storage existingApp = applications[propertyApplications[_propertyId][i]];
            if (existingApp.tenant == msg.sender && existingApp.status == ApplicationStatus.PENDING) {
                if (_isFullProperty && existingApp.isFullProperty) {
                    revert("Already applied for this full property");
                } else if (!_isFullProperty && !existingApp.isFullProperty && existingApp.roomNumber == _roomNumber) {
                    revert("Already applied for this room");
                }
            }
        }
        
        uint256 applicationId = nextApplicationId++;
        
        applications[applicationId] = TenantApplication({
            applicationId: applicationId,
            tenant: msg.sender,
            propertyId: _propertyId,
            monthlyIncome: _monthlyIncome,
            employmentStatus: _employmentStatus,
            additionalInfo: _additionalInfo,
            status: ApplicationStatus.PENDING,
            appliedAt: block.timestamp,
            isFullProperty: _isFullProperty,
            roomNumber: _roomNumber
        });
        
        tenantApplications[msg.sender].push(applicationId);
        propertyApplications[_propertyId].push(applicationId);
        
        emit ApplicationSubmitted(applicationId, msg.sender, _propertyId);
        
        return applicationId;
    }
    
    /**
     * @notice Review a tenant application
     */
    function reviewApplication(
        uint256 _applicationId,
        ApplicationStatus _status
    ) external onlyVerifiedLandlord {
        TenantApplication storage application = applications[_applicationId];
        require(application.applicationId != 0, "Application does not exist");
        require(properties[application.propertyId].owner == msg.sender, "Only property owner can review application");
        require(application.status == ApplicationStatus.PENDING, "Application already reviewed");
        require(_status == ApplicationStatus.APPROVED || _status == ApplicationStatus.REJECTED, "Invalid status");
        
        application.status = _status;

        if (_status == ApplicationStatus.APPROVED) {
            RentalProperty storage property = properties[application.propertyId];
            if (application.isFullProperty) {
                property.occupiedRooms = property.maxRooms;
            } else {
                property.occupiedRooms++;
            }
        }
        
        emit ApplicationReviewed(_applicationId, _status, msg.sender);
    }
    
    /**
     * @notice Get properties by owner
     */
    function getPropertiesByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }
    
    /**
     * @notice Get applications for a property
     */
    function getPropertyApplications(uint256 _propertyId) external view returns (uint256[] memory) {
        return propertyApplications[_propertyId];
    }
    
    /**
     * @notice Get tenant applications
     */
    function getTenantApplications(address _tenant) external view returns (uint256[] memory) {
        return tenantApplications[_tenant];
    }
}
