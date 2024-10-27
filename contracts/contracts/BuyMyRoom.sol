// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./MyERC20.sol"; // 自定义的 ERC20 合约

contract BuyMyRoom is ERC721Enumerable {
    event HouseListed(uint256 tokenId, uint256 price, address indexed owner);
    event HouseSold(uint256 tokenId, address indexed buyer, uint256 price);
    event EtherExchanged(address indexed user, uint256 etherAmount, uint256 tokenAmount);
    
    struct House {
        address owner;
        uint256 price;
        uint256 listedTimestamp;
        bool isListed;
    }

    mapping(uint256 => House) public houses;

    address public platformOwner;
    uint256 public constant FEE_RATE = 1; // 每秒手续费比例
    uint256 public constant EXCHANGE_RATE = 1; // 1 ETH = 1 积分

    MyERC20 public myERC20;

    constructor(MyERC20 _myERC20) ERC721("MyRoomToken", "ROOM") {
        platformOwner = msg.sender;
        myERC20 = _myERC20;
    }

    function mintHouse(address to, uint256 tokenId) external {
        _mint(to, tokenId);
        houses[tokenId] = House(to, 0, 0, false);
    }

    function listHouse(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!houses[tokenId].isListed, "Already listed");

        houses[tokenId].price = price;
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].isListed = true;

        emit HouseListed(tokenId, price, msg.sender);
    }

    function buyHouse(uint256 tokenId) external {
        
        House storage house = houses[tokenId];
        require(house.isListed, "House not listed");

        uint256 duration = block.timestamp - house.listedTimestamp;
        uint256 fee = duration * FEE_RATE;
        uint256 sellerAmount = house.price - fee;

        require(myERC20.balanceOf(msg.sender) >= house.price, "Insufficient token balance");

        myERC20.transferFrom(msg.sender, platformOwner, fee);
        myERC20.transferFrom(msg.sender, house.owner, sellerAmount);

        _transfer(house.owner, msg.sender, tokenId);

        house.owner = msg.sender;
        house.isListed = false;

        emit HouseSold(tokenId, msg.sender, house.price);
    }

    // **新增功能：用户将 ETH 兑换成 ERC20 代币**
    function exchangeEtherForTokens() external payable {
        require(msg.value > 0, "Must send ETH");

        uint256 tokenAmount = msg.value * EXCHANGE_RATE; // 计算可以兑换的代币数量

        require(myERC20.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");

        myERC20.transfer(msg.sender, tokenAmount); // 将代币发送给用户

        emit EtherExchanged(msg.sender, msg.value, tokenAmount);
    }

    // 查询用户拥有的房产
    function getOwnedHouses(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory userHouses = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            userHouses[i] = tokenOfOwnerByIndex(user, i);
        }
        return userHouses;
    }

    function getListedHouses() external view returns (uint256[] memory) {
        uint256 totalSupply = totalSupply();
        uint256 listedCount = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (houses[tokenId].isListed) {
                listedCount++;
            }
        }

        uint256[] memory listedHouses = new uint256[](listedCount);
        uint256 index = 0;
        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (houses[tokenId].isListed) {
                listedHouses[index] = tokenId;
                index++;
            }
        }
        return listedHouses;
    }

    function getHouseDetails(uint256 tokenId) external view returns (
        address owner,
        uint256 price,
        uint256 listedTimestamp,
        bool isListed
    ) {
        House memory house = houses[tokenId];
        return (house.owner, house.price, house.listedTimestamp, house.isListed);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getPlatformOwnerBalance() external view returns (uint256) {
        return platformOwner.balance;
    }

    // **新增功能：向合约存入代币（用于兑换功能）**
    function depositTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        myERC20.transferFrom(msg.sender, address(this), amount);
    }
}
