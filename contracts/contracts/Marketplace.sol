// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Marketplace
 * @notice Secondary market for fractional property tokens
 */
contract Marketplace is AccessControl, ReentrancyGuard {
    bytes32 public constant LISTING_ROLE = keccak256("LISTING_ROLE");

    struct Listing {
        address seller;
        address token;
        uint256 amount;
        uint256 pricePerToken;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    event Listed(uint256 indexed listingId, address indexed seller, address token, uint256 amount, uint256 price);
    event Purchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event Cancelled(uint256 indexed listingId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LISTING_ROLE, msg.sender);
    }

    function createListing(
        address token,
        uint256 amount,
        uint256 pricePerToken
    ) external nonReentrant returns (uint256 listingId) {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        listingId = ++listingCount;
        listings[listingId] = Listing({
            seller: msg.sender,
            token: token,
            amount: amount,
            pricePerToken: pricePerToken,
            active: true
        });
        emit Listed(listingId, msg.sender, token, amount, pricePerToken);
    }

    function buyListing(uint256 listingId, address paymentToken) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Not active");
        uint256 totalPrice = listing.amount * listing.pricePerToken;
        IERC20(paymentToken).transferFrom(msg.sender, listing.seller, totalPrice);
        IERC20(listing.token).transfer(msg.sender, listing.amount);
        listing.active = false;
        emit Purchased(listingId, msg.sender, listing.amount, totalPrice);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Not active");
        listing.active = false;
        IERC20(listing.token).transfer(msg.sender, listing.amount);
        emit Cancelled(listingId);
    }
}
