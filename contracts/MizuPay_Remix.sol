// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// For Remix: Use GitHub import or copy contracts inline
// Option 1: Use GitHub import (recommended)
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC20/IERC20.sol";

/**
 * @title MizuPay
 * @dev Accepts cUSD payments and tracks them by session ID
 */
contract MizuPay is Ownable {
    IERC20 public cusdToken;

    struct PaymentInfo {
        address payer;
        uint256 amount;
        uint256 timestamp;
        bool paid;
    }

    mapping(string => PaymentInfo) public payments; 
    mapping(address => uint256) public totalReceived; 

    event PaymentReceived(
        string indexed sessionId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentWithdrawn(
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _cusdToken) Ownable(msg.sender) {
        require(_cusdToken != address(0), "Invalid token address");
        cusdToken = IERC20(_cusdToken);
    }

    function payForSession(string memory sessionId, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(!payments[sessionId].paid, "Session already paid");
        require(bytes(sessionId).length > 0, "Session ID cannot be empty");

        require(
            cusdToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        payments[sessionId] = PaymentInfo({
            payer: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            paid: true
        });

        totalReceived[msg.sender] += amount;

        emit PaymentReceived(sessionId, msg.sender, amount, block.timestamp);
    }

    function getPaymentInfo(string memory sessionId) 
        external 
        view 
        returns (bool paid, address payer, uint256 amount, uint256 timestamp) 
    {
        PaymentInfo memory payment = payments[sessionId];
        return (payment.paid, payment.payer, payment.amount, payment.timestamp);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than 0");

        require(
            cusdToken.balanceOf(address(this)) >= amount,
            "Insufficient balance"
        );

        require(cusdToken.transfer(to, amount), "Transfer failed");

        emit PaymentWithdrawn(to, amount, block.timestamp);
    }

    function getBalance() external view returns (uint256) {
        return cusdToken.balanceOf(address(this));
    }

    function setCusdToken(address _newToken) external onlyOwner {
        require(_newToken != address(0), "Invalid token");
        cusdToken = IERC20(_newToken);
    }
}

