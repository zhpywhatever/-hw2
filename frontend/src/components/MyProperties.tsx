import React, { useEffect, useState } from 'react';
import { web3, BuyMyRoomContract, MyERC20Contract } from '../utils/contracts'; // 导入 MyERC20 合约实例
import styles from './MyProperties.module.css'; // 引入 CSS 模块
import { randomBytes } from 'crypto';

const MyProperties: React.FC = () => {
    const [myHomes, setMyHomes] = useState<string[]>([]);
    const [account, setAccount] = useState<string | null>(null);
    const [erc20Balance, setERC20Balance] = useState<string | null>(null); // ERC20 余额
    const [ethAmount, setEthAmount] = useState<string>(''); // 要兑换的 ETH 数量
    const [newTokenId, setNewTokenId] = useState<string>(''); // 新房产的 tokenId

    useEffect(() => {
        const loadAccountData = async () => {
            try {
                const accounts = await web3.eth.getAccounts();
                if (accounts.length === 0) {
                    alert('请连接 MetaMask，并确保已登录。');
                    return;
                }
                const userAccount = accounts[0];
                setAccount(userAccount);

                await loadERC20Balance(userAccount); // 加载 ERC20 余额
                await loadProperties(userAccount);   // 加载房产信息
            } catch (error) {
                console.error('加载账户数据时发生错误：', error);
            }
        };

        loadAccountData();
    }, []);

    // 加载用户的 ERC20 代币余额
    const loadERC20Balance = async (userAccount: string) => {
        try {
            const balance: number = await MyERC20Contract.methods.balanceOf(userAccount).call();
            const formattedBalance = web3.utils.fromWei(balance.toString(), 'ether'); // 格式化为 ether 单位
            setERC20Balance(formattedBalance);
        } catch (error) {
            console.error('加载 ERC20 余额时发生错误：', error);
        }
    };

    // 加载用户拥有的房产列表
    const loadProperties = async (userAccount: string) => {
        try {
            const homes: string[] = await BuyMyRoomContract.methods
                .getOwnedHouses(userAccount)
                .call();
            setMyHomes(homes); // 更新状态
        } catch (error) {
            console.error('加载房产信息时出错：', error);
        }
    };

    // 处理铸造新房产 NFT 的逻辑
    const handleAddProperty = async () => {
        if (!newTokenId) {
            alert('请输入 tokenId');
            return;
        }

        try {
            if (!account) {
                alert('未检测到账户，请确保连接了钱包。');
                return;
            }

            await BuyMyRoomContract.methods
                .mintHouse(account, newTokenId)
                .send({ from: account });

            alert(`成功添加房产 #${newTokenId}`);
            setNewTokenId(''); // 清空输入框
            await loadProperties(account); // 重新加载房产列表
        } catch (error) {
            console.error('添加房产时出错：', error);
            alert('添加房产失败，请重试。');
        }
    };

    // 处理 ETH 兑换 ERC20 代币的逻辑
    const handleExchange = async () => {
        if (!ethAmount || parseFloat(ethAmount) <= 0) {
            alert('请输入有效的 ETH 数量');
            return;
        }

        try {
            if (!account) {
                alert('未检测到账户，请确保连接了钱包。');
                return;
            }

            const weiAmount = web3.utils.toWei(ethAmount, 'ether'); // 将 ETH 转换为 Wei
            console.log("weiAmount: ", weiAmount);
            await MyERC20Contract.methods
                .exchangeEtherForTokens()
                .send({ from: account, value: weiAmount, gas: '300000' });

            alert(`成功兑换 ${ethAmount} ETH 为代币`);
            setEthAmount(''); // 清空输入框
            await loadERC20Balance(account); // 更新 ERC20 余额
        } catch (error) {
            console.error('兑换失败：', error);
            alert('兑换失败，请重试。');
        }
    };

    return (
        <div className={styles.container}>
            <h1>我的房产</h1>
            {account ? (
                <>
                    <p>当前账户：{account}</p>
                    <p>账户 ERC20 余额：{erc20Balance ? `${erc20Balance} RoomB` : '加载中...'}</p>
                </>
            ) : (
                <p>未连接账户</p>
            )}

            <h2>房产列表</h2>
            <ul className={styles.list}>
                {myHomes.length > 0 ? (
                    myHomes.map((home, index) => {
                        const randomImageIndex = Math.floor(Math.random() * 5) + 1; // 随机数 1~5
                        return (
                            <li key={index} className={styles.listItem}>
                                <img 
                                    src={`/images/${randomImageIndex}.jpg`} 
                                    alt={`房产 #${String(home)}`} 
                                    className={styles.image} 
                                />
                                <span className={styles.text}>房产 #{String(home)}</span>
                            </li>
                        );
                    })
                ) : (
                    <p>没有找到房产。</p>
                )}
            </ul>


            {/* <h2>添加新房产</h2>
            <input
                type="text"
                value={newTokenId}
                onChange={(e) => setNewTokenId(e.target.value)}
                placeholder="输入 tokenId"
            />
            <button onClick={handleAddProperty}>添加房产</button> */}

            <h2>兑换 ETH 为 ERC20 代币</h2>
            <input
                type="text"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="输入 ETH 数量"
            />
            <button onClick={handleExchange}>兑换</button>
        </div>
    );
};

export default MyProperties;
