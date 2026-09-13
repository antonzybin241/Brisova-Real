// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Escrow
 * @notice Holds funds until property transaction conditions are met
 */
contract Escrow is AccessControl, ReentrancyGuard {
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    enum EscrowStatus { Pending, Funded, Released, Refunded, Disputed }

    struct EscrowDeal {
        address buyer;
        address seller;
        address paymentToken;
        uint256 amount;
        EscrowStatus status;
        uint256 deadline;
    }

    mapping(uint256 => EscrowDeal) public deals;
    uint256 public dealCount;

    event DealCreated(uint256 indexed dealId, address buyer, address seller, uint256 amount);
    event DealFunded(uint256 indexed dealId);
    event DealReleased(uint256 indexed dealId);
    event DealRefunded(uint256 indexed dealId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ARBITER_ROLE, msg.sender);
    }

    function createDeal(
        address buyer,
        address seller,
        address paymentToken,
        uint256 amount,
        uint256 deadline
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 dealId) {
        dealId = ++dealCount;
        deals[dealId] = EscrowDeal({
            buyer: buyer,
            seller: seller,
            paymentToken: paymentToken,
            amount: amount,
            status: EscrowStatus.Pending,
            deadline: deadline
        });
        emit DealCreated(dealId, buyer, seller, amount);
    }

    function fund(uint256 dealId) external nonReentrant {
        EscrowDeal storage deal = deals[dealId];
        require(deal.status == EscrowStatus.Pending, "Invalid status");
        require(msg.sender == deal.buyer, "Not buyer");
        IERC20(deal.paymentToken).transferFrom(msg.sender, address(this), deal.amount);
        deal.status = EscrowStatus.Funded;
        emit DealFunded(dealId);
    }

    function release(uint256 dealId) external nonReentrant onlyRole(ARBITER_ROLE) {
        EscrowDeal storage deal = deals[dealId];
        require(deal.status == EscrowStatus.Funded, "Not funded");
        deal.status = EscrowStatus.Released;
        IERC20(deal.paymentToken).transfer(deal.seller, deal.amount);
        emit DealReleased(dealId);
    }

    function refund(uint256 dealId) external nonReentrant onlyRole(ARBITER_ROLE) {
        EscrowDeal storage deal = deals[dealId];
        require(deal.status == EscrowStatus.Funded, "Not funded");
        deal.status = EscrowStatus.Refunded;
        IERC20(deal.paymentToken).transfer(deal.buyer, deal.amount);
        emit DealRefunded(dealId);
    }
}
