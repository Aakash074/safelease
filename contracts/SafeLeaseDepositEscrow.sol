// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SafeLeaseIdentityVerification.sol";
import "./SafeLeasePropertyToken.sol";

/**
 * @title SafeLeaseDepositEscrow
 * @notice Manages deposits, rent payments, and AI-powered deposit refunds
 */
contract SafeLeaseDepositEscrow is ReentrancyGuard, Ownable {
    
    // Lease agreement structure
    struct LeaseAgreement {
        uint256 agreementId;
        uint256 propertyId;
        address landlord;
        address tenant;
        uint256 monthlyRent;
        uint256 deposit;
        uint256 startDate;
        uint256 endDate;
        uint256 createdAt;
        bool isActive;
        bool depositRefunded;
        uint256 totalRentPaid;
        AgreementStatus status;
        address propertyTokenContract;
    }
    
    // Damage verification structure (AI-powered)
    struct DamageVerification {
        uint256 verificationId;
        uint256 agreementId;
        address tenant;
        string[] beforeImages; // IPFS hashes
        string[] afterImages; // IPFS hashes
        uint256 damageAmount;
        string damageDescription;
        bool isVerified;
        uint256 verifiedAt;
        address verifier; // AI service
        VerificationStatus status;
    }
    
    // Agreement status enum
    enum AgreementStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        DISPUTED
    }
    
    // Verification status enum
    enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED,
        DISPUTED
    }
    
    // Events
    event LeaseAgreementCreated(
        uint256 indexed agreementId,
        uint256 indexed propertyId,
        address indexed landlord,
        address tenant
    );
    
    event PropertyTokenContractUpdated(
        uint256 indexed agreementId,
        address indexed propertyTokenContract
    );
    
    event DepositPaid(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount
    );
    
    event RentPaid(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount
    );
    
    event RentDistributedToTokenHolders(
        uint256 indexed agreementId,
        address indexed propertyTokenContract,
        uint256 amount
    );
    
    event DepositRefunded(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 refundAmount,
        uint256 damageDeduction
    );
    
    event DamageVerificationRequested(
        uint256 indexed verificationId,
        uint256 indexed agreementId,
        address indexed tenant
    );
    
    event DamageVerified(
        uint256 indexed verificationId,
        uint256 damageAmount,
        VerificationStatus status
    );
    
    // Storage
    mapping(uint256 => LeaseAgreement) public leaseAgreements;
    mapping(uint256 => DamageVerification) public damageVerifications;
    mapping(address => uint256[]) public tenantAgreements;
    mapping(address => uint256[]) public landlordAgreements;
    mapping(uint256 => uint256[]) public agreementDamageVerifications;
    
    uint256 public nextAgreementId = 1;
    uint256 public nextVerificationId = 1;
    
    // AI verification service (mock address for demo)
    address public aiVerificationService;
    
    // Identity verification contract
    SafeLeaseIdentityVerification public immutable identityVerification;
    
    constructor(address _identityVerificationContract) Ownable(msg.sender) {
        identityVerification = SafeLeaseIdentityVerification(_identityVerificationContract);
        aiVerificationService = msg.sender; // Mock AI service
    }
    
    /**
     * @notice Create a new lease agreement
     */
    function createLeaseAgreement(
        uint256 _propertyId,
        address _tenant,
        uint256 _monthlyRent,
        uint256 _deposit,
        uint256 _startDate,
        uint256 _endDate
    ) external nonReentrant returns (uint256) {
        require(
            identityVerification.isUserVerified(msg.sender, SafeLeaseIdentityVerification.VerificationType.LANDLORD),
            "Only verified landlords can create agreements"
        );
        require(
            identityVerification.isUserVerified(_tenant, SafeLeaseIdentityVerification.VerificationType.TENANT),
            "Tenant must be verified"
        );
        require(_monthlyRent > 0, "Monthly rent must be positive");
        require(_deposit > 0, "Deposit must be positive");
        require(_startDate > block.timestamp, "Start date must be in the future");
        require(_endDate > _startDate, "End date must be after start date");
        
        uint256 agreementId = nextAgreementId++;
        
        leaseAgreements[agreementId] = LeaseAgreement({
            agreementId: agreementId,
            propertyId: _propertyId,
            landlord: msg.sender,
            tenant: _tenant,
            monthlyRent: _monthlyRent,
            deposit: _deposit,
            startDate: _startDate,
            endDate: _endDate,
            createdAt: block.timestamp,
            isActive: false,
            depositRefunded: false,
            totalRentPaid: 0,
            status: AgreementStatus.PENDING,
            propertyTokenContract: address(0) // Will be set when property is tokenized
        });
        
        landlordAgreements[msg.sender].push(agreementId);
        tenantAgreements[_tenant].push(agreementId);
        
        emit LeaseAgreementCreated(agreementId, _propertyId, msg.sender, _tenant);
        
        return agreementId;
    }
    
    /**
     * @notice Update property token contract address for a lease agreement
     * @param _agreementId Agreement ID
     * @param _propertyTokenContract Property token contract address
     */
    function updatePropertyTokenContract(uint256 _agreementId, address _propertyTokenContract) external {
        LeaseAgreement storage agreement = leaseAgreements[_agreementId];
        require(agreement.landlord == msg.sender, "Only landlord can update token contract");
        require(_agreementId < nextAgreementId, "Agreement does not exist");
        
        agreement.propertyTokenContract = _propertyTokenContract;
        
        emit PropertyTokenContractUpdated(_agreementId, _propertyTokenContract);
    }
    
    /**
     * @notice Accept lease agreement and pay deposit
     */
    function acceptLeaseAgreement(uint256 _agreementId) external payable nonReentrant {
        LeaseAgreement storage agreement = leaseAgreements[_agreementId];
        require(agreement.tenant == msg.sender, "Only designated tenant can accept agreement");
        require(agreement.status == AgreementStatus.PENDING, "Agreement is not pending");
        require(msg.value >= agreement.deposit, "Insufficient deposit amount");
        
        // Activate agreement
        agreement.isActive = true;
        agreement.status = AgreementStatus.ACTIVE;
        
        emit DepositPaid(_agreementId, msg.sender, agreement.deposit);
    }
    
    /**
     * @notice Pay monthly rent
     */
    function payRent(uint256 _agreementId) external payable nonReentrant {
        LeaseAgreement storage agreement = leaseAgreements[_agreementId];
        require(agreement.tenant == msg.sender, "Only tenant can pay rent");
        require(agreement.isActive, "Agreement is not active");
        require(msg.value >= agreement.monthlyRent, "Insufficient rent amount");
        
        // Get property token contract address
        address propertyTokenContract = agreement.propertyTokenContract;
        
        if (propertyTokenContract != address(0)) {
            // Property is tokenized - distribute rent to token holders
            SafeLeasePropertyToken tokenContract = SafeLeasePropertyToken(propertyTokenContract);
            
            // Distribute rent to token holders (property owner can claim their share)
            tokenContract.distributeRent{value: agreement.monthlyRent}(agreement.monthlyRent);
            
            emit RentPaid(_agreementId, msg.sender, agreement.monthlyRent);
            emit RentDistributedToTokenHolders(_agreementId, propertyTokenContract, agreement.monthlyRent);
        } else {
            // Property is not tokenized - pay directly to landlord
            payable(agreement.landlord).transfer(agreement.monthlyRent);
            
            emit RentPaid(_agreementId, msg.sender, agreement.monthlyRent);
        }
        
        agreement.totalRentPaid += agreement.monthlyRent;
        
        // Refund excess payment
        if (msg.value > agreement.monthlyRent) {
            payable(msg.sender).transfer(msg.value - agreement.monthlyRent);
        }
    }
    
    /**
     * @notice Create damage verification request (AI-powered)
     */
    function createDamageVerification(
        uint256 _agreementId,
        string[] memory _beforeImages,
        string[] memory _afterImages,
        string memory _damageDescription
    ) external nonReentrant returns (uint256) {
        LeaseAgreement storage agreement = leaseAgreements[_agreementId];
        require(agreement.tenant == msg.sender, "Only tenant can request damage verification");
        require(agreement.isActive, "Agreement must be active");
        require(block.timestamp >= agreement.endDate, "Agreement must be completed");
        
        uint256 verificationId = nextVerificationId++;
        
        damageVerifications[verificationId] = DamageVerification({
            verificationId: verificationId,
            agreementId: _agreementId,
            tenant: msg.sender,
            beforeImages: _beforeImages,
            afterImages: _afterImages,
            damageAmount: 0, // To be set by AI
            damageDescription: _damageDescription,
            isVerified: false,
            verifiedAt: 0,
            verifier: aiVerificationService,
            status: VerificationStatus.PENDING
        });
        
        agreementDamageVerifications[_agreementId].push(verificationId);
        
        emit DamageVerificationRequested(verificationId, _agreementId, msg.sender);
        
        return verificationId;
    }
    
    /**
     * @notice AI verifies damage and calculates deduction (mock for demo)
     */
    function verifyDamage(
        uint256 _verificationId,
        uint256 _damageAmount,
        VerificationStatus _status
    ) external {
        require(msg.sender == aiVerificationService, "Only AI service can verify damage");
        
        DamageVerification storage verification = damageVerifications[_verificationId];
        require(verification.verificationId != 0, "Verification does not exist");
        require(verification.status == VerificationStatus.PENDING, "Verification already processed");
        
        verification.damageAmount = _damageAmount;
        verification.status = _status;
        verification.isVerified = true;
        verification.verifiedAt = block.timestamp;
        
        emit DamageVerified(_verificationId, _damageAmount, _status);
    }
    
    /**
     * @notice Refund deposit based on AI damage verification
     */
    function refundDeposit(uint256 _agreementId) external nonReentrant {
        LeaseAgreement storage agreement = leaseAgreements[_agreementId];
        require(agreement.tenant == msg.sender || agreement.landlord == msg.sender, "Not authorized");
        require(agreement.isActive, "Agreement must be active");
        require(!agreement.depositRefunded, "Deposit already refunded");
        require(block.timestamp >= agreement.endDate, "Agreement must be completed");
        
        // Get latest damage verification
        uint256[] memory verifications = agreementDamageVerifications[_agreementId];
        require(verifications.length > 0, "No damage verification found");
        
        uint256 latestVerificationId = verifications[verifications.length - 1];
        DamageVerification storage verification = damageVerifications[latestVerificationId];
        require(verification.isVerified, "Damage verification not completed");
        
        uint256 damageDeduction = 0;
        if (verification.status == VerificationStatus.APPROVED) {
            damageDeduction = verification.damageAmount;
        }
        
        uint256 refundAmount = agreement.deposit - damageDeduction;
        
        if (refundAmount > 0) {
            payable(agreement.tenant).transfer(refundAmount);
        }
        
        if (damageDeduction > 0) {
            payable(agreement.landlord).transfer(damageDeduction);
        }
        
        agreement.depositRefunded = true;
        agreement.status = AgreementStatus.COMPLETED;
        
        emit DepositRefunded(_agreementId, agreement.tenant, refundAmount, damageDeduction);
    }
    
    /**
     * @notice Get lease agreement details
     */
    function getLeaseAgreement(uint256 _agreementId) external view returns (LeaseAgreement memory) {
        return leaseAgreements[_agreementId];
    }
    
    /**
     * @notice Get damage verifications for an agreement
     */
    function getDamageVerifications(uint256 _agreementId) external view returns (uint256[] memory) {
        return agreementDamageVerifications[_agreementId];
    }
    
    /**
     * @notice Get damage verification details
     */
    function getDamageVerification(uint256 _verificationId) external view returns (DamageVerification memory) {
        return damageVerifications[_verificationId];
    }
    
    /**
     * @notice Get tenant agreements
     */
    function getTenantAgreements(address _tenant) external view returns (uint256[] memory) {
        return tenantAgreements[_tenant];
    }
    
    /**
     * @notice Get landlord agreements
     */
    function getLandlordAgreements(address _landlord) external view returns (uint256[] memory) {
        return landlordAgreements[_landlord];
    }
}
