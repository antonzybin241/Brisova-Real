// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PropertyRegistry
 * @notice Canonical on-chain registry for verified real estate assets
 */
contract PropertyRegistry is AccessControl {
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant BROKER_ROLE = keccak256("BROKER_ROLE");

    struct PropertyRecord {
        string metadataURI;
        address owner;
        address nftContract;
        uint256 nftTokenId;
        address fractionalToken;
        bool verified;
        uint256 registeredAt;
    }

    mapping(uint256 => PropertyRecord) public properties;
    uint256 public propertyCount;

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string metadataURI);
    event PropertyVerified(uint256 indexed propertyId, address indexed verifier);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
    }

    function registerProperty(
        string calldata metadataURI,
        address owner,
        address nftContract,
        uint256 nftTokenId,
        address fractionalToken
    ) external onlyRole(BROKER_ROLE) returns (uint256 propertyId) {
        propertyId = ++propertyCount;
        properties[propertyId] = PropertyRecord({
            metadataURI: metadataURI,
            owner: owner,
            nftContract: nftContract,
            nftTokenId: nftTokenId,
            fractionalToken: fractionalToken,
            verified: false,
            registeredAt: block.timestamp
        });
        emit PropertyRegistered(propertyId, owner, metadataURI);
    }

    function verifyProperty(uint256 propertyId) external onlyRole(COMPLIANCE_ROLE) {
        require(propertyId > 0 && propertyId <= propertyCount, "Invalid property");
        properties[propertyId].verified = true;
        emit PropertyVerified(propertyId, msg.sender);
    }
}
