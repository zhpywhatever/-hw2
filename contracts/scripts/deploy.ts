import { ethers } from "hardhat";

async function main() {
  // 部署 MyERC20 合约
  const MyERC20 = await ethers.getContractFactory("MyERC20");
  const myERC20 = await MyERC20.deploy("","");
  await myERC20.deployed();
  console.log(`MyERC20 deployed to ${myERC20.address}`);

  // 部署 BuyMyRoom 合约，并传入 MyERC20 的地址
  const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
  const buyMyRoom = await BuyMyRoom.deploy(myERC20.address); // 传递参数
  await buyMyRoom.deployed();
  console.log(`BuyMyRoom deployed to ${buyMyRoom.address}`);
}

// 使用 async/await 处理错误
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
