// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SafeLeaseIdentityVerification
 * @notice Identity verification contract for SafeLease platform using Self Protocol
 * @dev Supports landlord and tenant verification only
 */
contract SafeLeaseIdentityVerification is SelfVerificationRoot, Ownable {
    
    // Verification types
    enum VerificationType {
        LANDLORD,    // Property owner verification
        TENANT       // Tenant verification
    }
    
    // User verification status
    struct UserVerification {
        bool isVerified;
        VerificationType userType;
        uint256 verifiedAt;
        string country;
        uint256 age;
        bool isOFACCompliant;
        string additionalData;
    }
    
    // Events
    event UserVerified(
        address indexed user,
        VerificationType userType,
        string country,
        uint256 age,
        bytes userData
    );
    
    // Storage
    mapping(address => UserVerification) public userVerifications;
    mapping(VerificationType => bytes32) public configIds;
    
    // Configuration - Updated with generated config ID from tools.self.xyz
    bytes32 public constant LANDLORD_CONFIG_ID = 0x766466f264a44af31cd388cd05801bcc5dfff4980ee97503579db8b3d0742a7e;
    bytes32 public constant TENANT_CONFIG_ID = 0x766466f264a44af31cd388cd05801bcc5dfff4980ee97503579db8b3d0742a7e;
    
    constructor(
        address _identityVerificationHubV2Address,
        uint256 _scope
    ) SelfVerificationRoot(_identityVerificationHubV2Address, _scope) Ownable(msg.sender) {
        configIds[VerificationType.LANDLORD] = LANDLORD_CONFIG_ID;
        configIds[VerificationType.TENANT] = TENANT_CONFIG_ID;
    }
    
    /**
     * @notice Custom verification hook called after successful verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory _output,
        bytes memory _userData
    ) internal override {
        (VerificationType userType, string memory additionalData) = parseUserData(_userData);
        address user = address(uint160(_output.userIdentifier));
        
        string memory country = string(_output.nationality);
        uint256 age = 25; // Mock age for demo (in production, extract from _output.birthDate or _output.ageRange)
        
        userVerifications[user] = UserVerification({
            isVerified: true,
            userType: userType,
            verifiedAt: block.timestamp,
            country: country,
            age: age,
            isOFACCompliant: true, // Mock OFAC compliance for demo
            additionalData: additionalData
        });
        
        emit UserVerified(user, userType, country, age, _userData);
    }
    
    /**
     * @notice Get configuration ID based on verification type
     */
    function getConfigId(
        bytes32 _destinationChainId,
        bytes32 _userIdentifier,
        bytes memory _userDefinedData
    ) public view override returns (bytes32) {
        (VerificationType userType,) = parseUserData(_userDefinedData);
        return configIds[userType];
    }
    
    /**
     * @notice Check if a user is verified for a specific type
     */
    function isUserVerified(address _user, VerificationType _userType) external view returns (bool) {
        UserVerification memory verification = userVerifications[_user];
        return verification.isVerified && verification.userType == _userType;
    }
    
    /**
     * @notice Get user verification details
     */
    function getUserVerification(address _user) external view returns (UserVerification memory) {
        return userVerifications[_user];
    }
    
    /**
     * @notice Parse user data to extract verification type and additional data
     */
    function parseUserData(bytes memory _userData) internal pure returns (
        VerificationType userType,
        string memory additionalData
    ) {
        require(_userData.length >= 1, "Invalid user data length");
        
        uint8 typeByte = uint8(_userData[0]);
        require(typeByte <= uint8(VerificationType.TENANT), "Invalid verification type");
        
        userType = VerificationType(typeByte);
        
        if (_userData.length > 1) {
            bytes memory dataBytes = new bytes(_userData.length - 1);
            for (uint i = 1; i < _userData.length; i++) {
                dataBytes[i-1] = _userData[i];
            }
            additionalData = string(dataBytes);
        }
    }
    
    /**
     * @notice Update the scope for Self Protocol verification
     * @dev Only the contract owner can update the scope
     * @param _newScope The new scope value from tools.self.xyz
     */
    function updateScope(uint256 _newScope) external onlyOwner {
        _setScope(_newScope);
    }
    
    /**
     * @notice Update the config ID for a verification type
     * @dev Only the contract owner can update the config ID
     * @param _userType The verification type (LANDLORD or TENANT)
     * @param _newConfigId The new config ID from tools.self.xyz
     */
    function updateConfigId(VerificationType _userType, bytes32 _newConfigId) external onlyOwner {
        configIds[_userType] = _newConfigId;
        emit ConfigIdUpdated(_userType, _newConfigId);
    }
    
    /**
     * @notice Event emitted when config ID is updated
     */
    event ConfigIdUpdated(VerificationType userType, bytes32 newConfigId);
}
