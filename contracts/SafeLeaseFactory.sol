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
    
    // Events
    event ContractsDeployed(
        address indexed identityVerification,
        address indexed rentalManagement,
        address indexed depositEscrow
    );
    
    constructor(
        address _identityVerificationHubV2Address,
        uint256 _scope
    ) Ownable(msg.sender) {
        // Deploy identity verification contract
        identityVerification = new SafeLeaseIdentityVerification(
            _identityVerificationHubV2Address,
            _scope
        );
        
        // Deploy rental management contract
        rentalManagement = new SafeLeaseRentalManagement(
            address(identityVerification)
        );
        
        // Deploy deposit escrow contract
        depositEscrow = new SafeLeaseDepositEscrow(
            address(identityVerification)
        );
        
        // Store addresses
        identityVerificationAddress = address(identityVerification);
        rentalManagementAddress = address(rentalManagement);
        depositEscrowAddress = address(depositEscrow);
        
        emit ContractsDeployed(
            identityVerificationAddress,
            rentalManagementAddress,
            depositEscrowAddress
        );
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
     * @notice Deploy a new property token
     */
    function deployPropertyToken(
        string memory _propertyId,
        string memory _propertyAddress,
        uint256 _totalValue,
        uint256 _totalTokens,
        address _propertyOwner
    ) external onlyOwner returns (address) {
        SafeLeasePropertyToken propertyToken = new SafeLeasePropertyToken(
            _propertyId,
            _propertyAddress,
            _totalValue,
            _totalTokens,
            _propertyOwner,
            identityVerificationAddress
        );
        
        return address(propertyToken);
    }
}
