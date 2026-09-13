// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PropertyStaking
 * @notice Stake fractional tokens to earn platform rewards
 */
contract PropertyStaking is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");

    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 stakedAt;
    }

    IERC20 public immutable stakingToken;
    IERC20 public rewardToken;
    uint256 public rewardRatePerSecond;
    uint256 public totalStaked;
    uint256 public accRewardPerShare;

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address stakingToken_, address rewardToken_, uint256 rewardRatePerSecond_) {
        stakingToken = IERC20(stakingToken_);
        rewardToken = IERC20(rewardToken_);
        rewardRatePerSecond = rewardRatePerSecond_;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REWARDER_ROLE, msg.sender);
    }

    function stake(uint256 amount) external nonReentrant {
        _updatePool();
        StakeInfo storage info = stakes[msg.sender];
        if (info.amount > 0) {
            uint256 pending = _pendingReward(msg.sender);
            if (pending > 0) {
                rewardToken.safeTransfer(msg.sender, pending);
                emit RewardClaimed(msg.sender, pending);
            }
        }
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        info.amount += amount;
        info.rewardDebt = (info.amount * accRewardPerShare) / 1e18;
        info.stakedAt = block.timestamp;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        require(info.amount >= amount, "Insufficient stake");
        _updatePool();
        uint256 pending = _pendingReward(msg.sender);
        info.amount -= amount;
        info.rewardDebt = (info.amount * accRewardPerShare) / 1e18;
        totalStaked -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        if (pending > 0) {
            rewardToken.safeTransfer(msg.sender, pending);
            emit RewardClaimed(msg.sender, pending);
        }
        emit Unstaked(msg.sender, amount);
    }

    function _pendingReward(address user) internal view returns (uint256) {
        StakeInfo storage info = stakes[user];
        if (info.amount == 0) return 0;
        return (info.amount * accRewardPerShare) / 1e18 - info.rewardDebt;
    }

    function _updatePool() internal {
        if (totalStaked == 0) return;
        accRewardPerShare += (rewardRatePerSecond * 1e18) / totalStaked;
    }
}
