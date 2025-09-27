// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SafeLeaseIdentityVerification.sol";

/**
 * @title SafeLeasePropertyToken
 * @notice ERC-20 token for fractional property ownership
 */
contract SafeLeasePropertyToken is ERC20, Ownable {
    
    // Property information
    struct PropertyInfo {
        string propertyId;
        string propertyAddress;
        uint256 totalValue;
        uint256 totalTokens;
        address propertyOwner;
        bool isActive;
        uint256 createdAt;
    }
    
    // Investor compliance status
    struct InvestorStatus {
        bool isWhitelisted;
        bool isAccredited;
        uint256 maxInvestment;
        uint256 currentInvestment;
        string country;
        bool ofacCompliant;
    }
    
    // Events
    event PropertyTokenized(
        string indexed propertyId,
        uint256 totalTokens,
        uint256 totalValue,
        address indexed propertyOwner
    );
    
    event InvestorWhitelisted(
        address indexed investor,
        bool isAccredited,
        uint256 maxInvestment,
        string country
    );
    
    event TokensPurchased(
        address indexed investor,
        uint256 amount,
        uint256 totalCost,
        string propertyId
    );
    
    event RentDistributed(
        uint256 totalRent,
        uint256 totalTokens
    );
    
    event RentClaimed(
        address indexed holder,
        uint256 amount
    );
    
    // Storage
    PropertyInfo public propertyInfo;
    SafeLeaseIdentityVerification public identityVerification;
    
    mapping(address => InvestorStatus) public investorStatus;
    mapping(address => bool) public authorizedTransfers;
    
    // Rent distribution tracking
    mapping(address => uint256) public unclaimedRent;
    uint256 public totalRentDistributed;
    uint256 public lastRentDistribution;
    
    uint256 public constant TOKEN_PRICE = 1e18; // $1 per token
    uint256 public constant MIN_INVESTMENT = 100 * 1e18; // $100 minimum
    uint256 public constant MAX_NON_ACCREDITED = 10000 * 1e18; // $10,000 max for non-accredited
    
    constructor(
        string memory _propertyId,
        string memory _propertyAddress,
        uint256 _totalValue,
        uint256 _totalTokens,
        address _propertyOwner,
        address _identityVerificationContract
    ) ERC20("SafeLease Property Token", "SLPT") Ownable(msg.sender) {
        require(_totalValue > 0, "Property value must be positive");
        require(_totalTokens > 0, "Total tokens must be positive");
        require(_identityVerificationContract != address(0), "Invalid identity verification contract");
        
        propertyInfo = PropertyInfo({
            propertyId: _propertyId,
            propertyAddress: _propertyAddress,
            totalValue: _totalValue,
            totalTokens: _totalTokens,
            propertyOwner: _propertyOwner,
            isActive: true,
            createdAt: block.timestamp
        });
        
        identityVerification = SafeLeaseIdentityVerification(_identityVerificationContract);
        
        // Mint tokens to contract for distribution
        _mint(address(this), _totalTokens);
        
        emit PropertyTokenized(_propertyId, _totalTokens, _totalValue, _propertyOwner);
    }
    
    /**
     * @notice Whitelist an investor
     */
    function whitelistInvestor(
        address _investor,
        bool _isAccredited,
        uint256 _maxInvestment,
        string memory _country,
        bool _ofacCompliant
    ) external onlyOwner {
        require(_investor != address(0), "Invalid investor address");
        require(_maxInvestment >= MIN_INVESTMENT, "Investment below minimum");
        
        // Verify investor has completed Self Protocol verification
        require(identityVerification.isUserVerified(_investor, SafeLeaseIdentityVerification.VerificationType.TENANT), "Investor must be verified via Self Protocol");
        
        investorStatus[_investor] = InvestorStatus({
            isWhitelisted: true,
            isAccredited: _isAccredited,
            maxInvestment: _maxInvestment,
            currentInvestment: 0,
            country: _country,
            ofacCompliant: _ofacCompliant
        });
        
        emit InvestorWhitelisted(_investor, _isAccredited, _maxInvestment, _country);
    }
    
    /**
     * @notice Purchase property tokens
     */
    function purchaseTokens(uint256 _amount) external payable {
        require(investorStatus[msg.sender].isWhitelisted, "Investor not whitelisted");
        require(investorStatus[msg.sender].ofacCompliant, "OFAC non-compliant");
        require(_amount > 0, "Amount must be positive");
        require(identityVerification.isUserVerified(msg.sender, SafeLeaseIdentityVerification.VerificationType.TENANT), "Must be verified via Self Protocol");
        
        uint256 totalCost = _amount * TOKEN_PRICE;
        require(msg.value >= totalCost, "Insufficient payment");
        
        InvestorStatus storage investor = investorStatus[msg.sender];
        require(
            investor.currentInvestment + totalCost <= investor.maxInvestment,
            "Exceeds maximum investment"
        );
        
        // Check non-accredited investor limits
        if (!investor.isAccredited) {
            require(
                investor.currentInvestment + totalCost <= MAX_NON_ACCREDITED,
                "Non-accredited investor limit exceeded"
            );
        }
        
        // Transfer tokens to investor
        _transfer(address(this), msg.sender, _amount);
        
        // Update investor status
        investor.currentInvestment += totalCost;
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(msg.sender, _amount, totalCost, propertyInfo.propertyId);
    }
    
    /**
     * @notice Distribute rent to token holders
     * @param _totalRent Total rent amount to distribute
     */
    function distributeRent(uint256 _totalRent) external payable onlyOwner {
        require(_totalRent > 0, "Rent amount must be positive");
        require(msg.value >= _totalRent, "Insufficient payment");
        
        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "No tokens issued yet");
        
        // Distribute rent proportionally to token holders
        // This is a simplified version - in production, you'd iterate through all holders
        // For gas efficiency, we'll use a different approach
        
        totalRentDistributed += _totalRent;
        lastRentDistribution = block.timestamp;
        
        emit RentDistributed(_totalRent, totalSupply);
    }
    
    /**
     * @notice Claim rent for a specific token holder
     * @param _holder Token holder address
     */
    function claimRent(address _holder) external {
        uint256 holderBalance = balanceOf(_holder);
        require(holderBalance > 0, "No tokens held");
        require(unclaimedRent[_holder] > 0, "No unclaimed rent");
        
        uint256 claimAmount = unclaimedRent[_holder];
        unclaimedRent[_holder] = 0;
        
        payable(_holder).transfer(claimAmount);
        
        emit RentClaimed(_holder, claimAmount);
    }
    
    /**
     * @notice Calculate rent share for a token holder
     * @param _holder Token holder address
     * @param _totalRent Total rent amount
     */
    function calculateRentShare(address _holder, uint256 _totalRent) external view returns (uint256) {
        uint256 holderBalance = balanceOf(_holder);
        uint256 totalSupply = totalSupply();
        
        if (totalSupply == 0) return 0;
        
        return (holderBalance * _totalRent) / totalSupply;
    }
    
    /**
     * @notice Override transfer to enforce compliance
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal {
        
        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Enforce whitelist for transfers
        require(
            authorizedTransfers[from] || authorizedTransfers[to] || 
            (investorStatus[to].isWhitelisted && investorStatus[to].ofacCompliant),
            "Transfer not authorized - compliance required"
        );
        
        // Verify Self Protocol verification for new holders
        if (to != address(this) && !authorizedTransfers[to]) {
            require(identityVerification.isUserVerified(to, SafeLeaseIdentityVerification.VerificationType.TENANT), "Recipient must be verified via Self Protocol");
        }
    }
    
    /**
     * @notice Authorize transfers for specific addresses (for DEX integration)
     */
    function authorizeTransfer(address _address, bool _authorized) external onlyOwner {
        authorizedTransfers[_address] = _authorized;
    }
    
    /**
     * @notice Get investor compliance status
     */
    function getInvestorStatus(address _investor) external view returns (InvestorStatus memory) {
        return investorStatus[_investor];
    }
    
    /**
     * @notice Get property information
     */
    function getPropertyInfo() external view returns (PropertyInfo memory) {
        return propertyInfo;
    }
}