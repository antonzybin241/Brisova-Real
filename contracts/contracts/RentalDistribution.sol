// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RentalDistribution
 * @notice Distributes rental income pro-rata to fractional token holders
 */
contract RentalDistribution is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    IERC20 public immutable fractionalToken;
    IERC20 public paymentToken;
    uint256 public totalDistributed;

    mapping(address => uint256) public claimed;

    event RentalDeposited(uint256 amount);
    event RentalClaimed(address indexed holder, uint256 amount);

    constructor(address fractionalToken_, address paymentToken_) {
        fractionalToken = IERC20(fractionalToken_);
        paymentToken = IERC20(paymentToken_);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    function depositRental(uint256 amount) external onlyRole(DISTRIBUTOR_ROLE) {
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        totalDistributed += amount;
        emit RentalDeposited(amount);
    }

    function claim(address holder) external nonReentrant returns (uint256 amount) {
        uint256 balance = fractionalToken.balanceOf(holder);
        uint256 totalSupply = fractionalToken.totalSupply();
        require(totalSupply > 0, "No supply");
        amount = (totalDistributed * balance / totalSupply) - claimed[holder];
        require(amount > 0, "Nothing to claim");
        claimed[holder] += amount;
        paymentToken.safeTransfer(holder, amount);
        emit RentalClaimed(holder, amount);
    }
}
