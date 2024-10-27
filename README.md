# 项目文档：**去中心化房屋交易系统**

## 一、项目介绍

这是一个**基于区块链的去中心化房产交易系统**，集成了ERC20代币与ERC721房产NFT。用户可以通过系统完成房屋的铸造、上架、交易，并使用ERC20代币与以太坊进行兑换。该系统实现了透明、安全的房产交易，同时支持与MetaMask等钱包的交互。

**主要特点：**  
1. **ERC721** 实现房产NFT，每个房屋为独特的不可替代资产。  
2. **ERC20** 代币用于房屋交易和ETH兑换。  
3. 系统支持**房产上架、购买、铸造**以及**代币兑换**功能。  
4. 集成**MetaMask**进行钱包授权及账户管理。  

---

## 二、功能与实现分析

### 功能列表：
1. **房屋铸造与上架**  
   用户可以铸造房屋NFT，并设置价格将其上架市场。(增加房产的功能在前端已进行注释，需要时可以将`/frontend/src/components/MyProperties.tsx:145`处的代码块取消注释)
   
`添加房产`

![alt text](<imgs/截屏2024-10-27 19.20.53.png>)
`上架房产`

![alt text](<imgs/截屏2024-10-27 19.15.06.png>)
`交互界面`

![alt text](<imgs/截屏2024-10-27 19.23.18.png>)
`成功上架`

![alt text](<imgs/截屏2024-10-27 19.24.23.png>)


2. **房屋交易与手续费计算**  
   使用ERC20代币购买上架的房产NFT，系统按持有时间动态收取手续费。

`房产列表界面`

![alt text](<imgs/截屏2024-10-27 19.27.11.png>)  

`定义支出上限`

![alt text](<imgs/截屏2024-10-27 19.28.21.png>)
![alt text](<imgs/截屏2024-10-27 20.13.05.png>)
![alt text](<imgs/截屏2024-10-27 20.14.44.png>)
`成功购买`

![alt text](<imgs/截屏2024-10-27 20.15.07.png>)


3. **ETH 与 ERC20 兑换**  
   用户可以通过系统用ETH兑换ERC20代币，用于房屋购买和其他支付。

`兑换界面`

![alt text](<imgs/截屏2024-10-27 20.18.10.png>)
`交互界面`

![alt text](<imgs/截屏2024-10-27 20.19.11.png>)
`兑换成功`

![alt text](<imgs/截屏2024-10-27 20.19.51.png>)
4. **钱包交互与余额查询**  
   用户登录MetaMask钱包查看账户资产和余额。
![alt text](<imgs/截屏2024-10-27 20.21.09.png>)

---

## 三、项目运行步骤

### 1. 环境准备
- 安装 **Node.js** 和 **MetaMask** 插件。
- 使用 **Hardhat** 进行合约部署。
- 确保本地或测试网络上有足够的ETH用于合约操作。

### 2. 合约部署与配置
1. 在项目根目录执行以下命令，安装必要的依赖：
   ```bash
   npm install
   npm install @openzeppelin/contracts web3
   ```

2. 部署合约：
   - 部署 **ERC20** 合约 `MyERC20.sol`
   - 部署 **房产交易合约** `BuyMyRoom.sol`
   - 获取部署后的合约地址并配置在前端代码中的 `contracts.js` 文件。
- 这里可以直接在contracts目录下执行
  ```bash
   npx hardhat compile
   npx hardhat run ./scripts/deploy.ts --network ganache
  ```

### 3. 启动前端项目
1. 启动前端应用：
   ```bash
   npm install
   npm start
   ```
2. 使用MetaMask连接钱包，并选择正确的网络。

---

## 四、关键界面和操作流程截图

### 1. **登录钱包并加载房产列表**
用户使用MetaMask授权后加载当前可购买的房产。

### 2. **房屋上架**
房屋所有者为NFT设置价格并上架。



### 3. **购买房产流程**
用户使用ERC20代币购买上架房屋，交易成功后NFT所有权变更。



### 4. **ETH与代币兑换**
用户用ETH兑换ERC20代币，用于未来的房屋交易。



---

## 五、关键合约代码片段

### 1. **ERC20代币合约**
```solidity
function exchangeEtherForTokens() external payable {
    require(msg.value > 0, "Must send ETH");
    uint256 tokenAmount = msg.value * EXCHANGE_RATE;
    _mint(msg.sender, tokenAmount);
}
```

### 2. **房屋交易逻辑**
```solidity
function buyHouse(uint256 tokenId) external {
    House storage house = houses[tokenId];
    require(house.isListed, "House not listed");
    
    uint256 duration = block.timestamp - house.listedTimestamp;
    uint256 fee = duration * FEE_RATE;
    uint256 sellerAmount = house.price - fee;

    myERC20.transferFrom(msg.sender, platformOwner, fee);
    myERC20.transferFrom(msg.sender, house.owner, sellerAmount);

    _transfer(house.owner, msg.sender, tokenId);
    house.owner = msg.sender;
    house.isListed = false;
}
```

---

## 六、项目总结

该系统结合了**区块链技术与智能合约**，实现了透明、去中心化的房产交易流程。使用ERC20代币作为支付手段提升了流通性，并借助ERC721确保房产NFT的唯一性。未来可以进一步优化用户体验，如**支持更多支付方式**，**添加房产管理功能**等，以提升系统的实用性和市场价值。

---

**联系方式**  
如有任何问题，请联系开发者：[19582110889]