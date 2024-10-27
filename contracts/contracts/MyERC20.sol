// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {

    mapping(address => bool) public claimedAirdropPlayerList; // 记录领取空投的用户
    uint256 public constant EXCHANGE_RATE = 1; // 1 ETH = 1 MyERC20 代币
    address public owner; // 合约所有者

    // 构造函数，为合约部署者分配初始代币
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        owner = msg.sender;
        _mint(msg.sender, 1000 * (10 ** uint256(decimals()))); // 创建者初始 1000 代币
    }

    // 用户领取空投
    function airdrop() external {
        require(!claimedAirdropPlayerList[msg.sender], "This user has claimed airdrop already");
        _mint(msg.sender, 10000 * (10 ** uint256(decimals()))); // 每个用户空投 10000 代币
        claimedAirdropPlayerList[msg.sender] = true;
    }

    // **新增功能：用户将 ETH 兑换为 ERC20 代币**
    function exchangeEtherForTokens() external payable {
        require(msg.value > 0, "Must send ETH");

        uint256 tokenAmount = msg.value * EXCHANGE_RATE; // 根据汇率计算代币数量
        //require(balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");
        _mint(msg.sender, tokenAmount);
        //_transfer(address(this), msg.sender, tokenAmount); // 将代币转给用户
    }

    // **新增功能：合约所有者可以存入代币以支持兑换**
    function depositTokens(uint256 amount) external {
        require(msg.sender == owner, "Only owner can deposit tokens");
        require(amount > 0, "Amount must be greater than zero");

        _transfer(msg.sender, address(this), amount); // 将代币转入合约地址
    }

    // **新增功能：合约所有者可以提取合约中的 ETH**
    function withdrawEther(uint256 amount) external {
        require(msg.sender == owner, "Only owner can withdraw Ether");
        require(address(this).balance >= amount, "Insufficient Ether balance");

        payable(owner).transfer(amount); // 将 ETH 提取到所有者地址
    }

    // **获取合约中的 ETH 余额**
    function getContractEtherBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
