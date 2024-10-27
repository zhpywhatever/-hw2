const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
const contract = await BuyMyRoom.deploy();
await contract.deployed();
await contract.mintHouse("0xb97E8C62CdcA71dc4b250c16112413a82505C470", "1");  // 挂单房产 ID 为 1，价格为 1 ETH
console.log(`合约已部署，地址：${contract.address}`);
