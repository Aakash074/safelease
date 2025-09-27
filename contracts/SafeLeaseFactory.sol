// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SafeLeaseIdentityVerification.sol";
import "./SafeLeaseRentalManagement.sol";
import "./SafeLeaseDepositEscrow.sol";
import "./SafeLeasePropertyToken.sol";

/**
 * @title SafeLeaseFactory
 * @notice Factory contract to deploy SafeLease contracts
 */
contract SafeLeaseFactory is Ownable {
    
    // Deployed contracts
    SafeLeaseIdentityVerification public identityVerification;
    SafeLeaseRentalManagement public rentalManagement;
    SafeLeaseDepositEscrow public depositEscrow;
    
    // Contract addresses for easy access
    address public immutable identityVerificationAddress;
    address public immutable rentalManagementAddress;
    address public immutable depositEscrowAddress;
    
    // Mapping to track authorized contracts
    mapping(address => bool) public authorizedContracts;
    
    // Events
    event FactoryInitialized(
        address indexed identityVerificationHub,
        uint256 scope
    );
    
    event ContractAuthorized(
        address indexed contractAddress,
        bool authorized
    );
    
    constructor(
        address _identityVerificationHubV2Address,
        uint256 _scope
    ) Ownable(msg.sender) {
        // Store configuration for later deployment
        identityVerificationAddress = address(0); // Will be set when deployed
        rentalManagementAddress = address(0); // Will be set when deployed
        depositEscrowAddress = address(0); // Will be set when deployed
        
        emit FactoryInitialized(_identityVerificationHubV2Address, _scope);
    }
    
    /**
     * @notice Get all contract addresses
     */
    function getContractAddresses() external view returns (address[3] memory) {
        return [
            identityVerificationAddress,
            rentalManagementAddress,
            depositEscrowAddress
        ];
    }
    
    /**
     * @notice Get contract information
     */
    function getContractInfo() external view returns (
        address identity,
        address rental,
        address escrow,
        address contractOwner
    ) {
        return (
            identityVerificationAddress,
            rentalManagementAddress,
            depositEscrowAddress,
            owner()
        );
    }
    
    /**
     * @notice Authorize a contract to deploy property tokens
     * @param _contractAddress Contract address to authorize
     * @param _authorized Whether to authorize or revoke authorization
     */
    function authorizeContract(address _contractAddress, bool _authorized) external onlyOwner {
        authorizedContracts[_contractAddress] = _authorized;
        emit ContractAuthorized(_contractAddress, _authorized);
    }
    
    /**
     * @notice Deploy a new property token
     */
    function deployPropertyToken(
        string memory _propertyId,
        string memory _propertyAddress,
        uint256 _totalValue,
        uint256 _totalTokens,
        address _propertyOwner
    ) external returns (address) {
        require(
            authorizedContracts[msg.sender] || msg.sender == owner(),
            "Only authorized contracts or owner can deploy property tokens"
        );
        
        // Use a default identity verification address for now
        address identityContract = identityVerificationAddress != address(0) 
            ? identityVerificationAddress 
            : msg.sender; // Fallback to deployer
            
        SafeLeasePropertyToken propertyToken = new SafeLeasePropertyToken(
            _propertyId,
            _propertyAddress,
            _totalValue,
            _totalTokens,
            _propertyOwner,
            identityContract
        );
        
        return address(propertyToken);
    }
}
