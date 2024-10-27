import Web3 from 'web3';
import Address from './contract-address.json'; // 合约地址配置
import BuyMyRoom from './abis/BuyMyRoom.json'; // BuyMyRoom 合约 ABI
import MyERC20 from './abis/MyERC20.json'; // MyERC20 合约 ABI

let web3: Web3;

// 检测是否存在 MetaMask 的 ethereum 对象
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    // 请求账户授权
    window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .catch((err: any) => {
            console.error('账户授权失败：', err);
            alert('请授权 MetaMask 以继续。');
        });
} else {
    alert('请安装 MetaMask 扩展以使用该应用！');
    throw new Error('MetaMask 未安装');
}

// 获取 BuyMyRoom 和 MyERC20 合约的地址和 ABI
const BuyMyRoomAddress = Address.BuyMyRoom;
const MyERC20Address = Address.MyERC20;
const BuyMyRoomABI = BuyMyRoom.abi;
const MyERC20ABI = MyERC20.abi;

// 创建合约实例
const BuyMyRoomContract = new web3.eth.Contract(BuyMyRoomABI, BuyMyRoomAddress);
const MyERC20Contract = new web3.eth.Contract(MyERC20ABI, MyERC20Address);

// 导出 web3 实例和合约实例
export { web3, BuyMyRoomContract, MyERC20Contract };
