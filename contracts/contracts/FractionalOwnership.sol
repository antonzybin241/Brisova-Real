// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title FractionalOwnership
 * @notice ERC-20 fractional shares for property investment
 */
contract FractionalOwnership is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public immutable propertyId;
    uint256 public tokenPrice;
    address public propertyNFT;

    event SharesPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event SharesSold(address indexed seller, uint256 amount, uint256 proceeds);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 propertyId_,
        uint256 totalSupply_,
        uint256 tokenPrice_,
        address propertyNFT_
    ) ERC20(name_, symbol_) {
        propertyId = propertyId_;
        tokenPrice = tokenPrice_;
        propertyNFT = propertyNFT_;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _mint(msg.sender, totalSupply_);
    }

    function setTokenPrice(uint256 newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenPrice = newPrice;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        _burn(from, amount);
    }
}
