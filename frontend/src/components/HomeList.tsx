import React, { useEffect, useState } from 'react';
import { web3, BuyMyRoomContract, MyERC20Contract } from '../utils/contracts';
import styles from './HomeList.module.css'; // 引入 CSS 模块

// 定义 House 类型，明确房产对象的结构
interface House {
    id: number;
    owner: string;
    price: string; // 合约中的价格是字符串格式
    isListed: boolean;
}

const formatPrice = (price: any): string => {
    if (!price) return '0.0'; // 如果 price 是 null 或 undefined，则返回默认值 '0.0'

    // 将 price 转换为字符串
    const priceStr = String(price);

    if (priceStr.length <= 18) {
        // 如果长度小于或等于 18，用 '0' 填充并在开头加 "0."
        return `0.${priceStr.padStart(18, '0')}`;
    }

    // 在倒数第 18 位插入小数点
    const integerPart = priceStr.slice(0, priceStr.length - 18);
    const decimalPart = priceStr.slice(priceStr.length - 18);
    return `${integerPart}.${decimalPart}`;
};

const HomeList: React.FC = () => {
    const [homes, setHomes] = useState<House[]>([]);
    const [account, setAccount] = useState<string | null>(null);

    // 加载账户和合约数据
    useEffect(() => {
        const loadContracts = async () => {
            try {
                // 请求用户授权使用账户
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

                if (accounts.length === 0) {
                    alert('未检测到账户，请在 MetaMask 中登录！');
                    return;
                }
                setAccount(accounts[0]);
                console.log(`当前账户地址：${accounts[0]}`);

                // 加载并展示房产信息
                await loadHomes();
            } catch (error) {
                console.error('加载合约或账户时出错：', error);
            }
        };

        loadContracts();
    }, []);

    // 加载房产信息的函数
    const loadHomes = async () => {
        try {
            const homeCount: number = await BuyMyRoomContract.methods.totalSupply().call();
            const homesArray: House[] = [];

            console.log('homeCount:', homeCount);
            for (let i = 1; i <= homeCount; i++) {
                const houseDetails: House = await BuyMyRoomContract.methods.getHouseDetails(i).call();
                console.log('houseDetails:', houseDetails);

                if (houseDetails.isListed) {
                    homesArray.push({
                        id: i,
                        owner: houseDetails.owner,
                        price: houseDetails.price,
                        isListed: houseDetails.isListed,
                    });
                }
            }

            setHomes(homesArray);
        } catch (error) {
            console.error('加载房产信息时出错：', error);
        }
    };

    // 购买房产的处理逻辑
    const handleBuy = async (id: number, price: string) => {
        if (!account) {
            alert('请连接 MetaMask 账户');
            return;
        }

        try {
            console.log(`购买房屋 #${id}，价格：${price}`);
            await MyERC20Contract.methods.approve(BuyMyRoomContract.options.address, price).send({
                from: account,
                gas: '300000' // 限制 gas 上限
            });
            await BuyMyRoomContract.methods.buyHouse(id).send({
                from: account,
                gas: '300000' 
            });

            alert(`房屋 #${id} 购买成功！`);
            await loadHomes(); // 重新加载房产列表以更新状态
        } catch (error) {
            console.error('购买失败：', error);
            alert('购买失败，请重试。');
        }
    };

    return (
        <div className={styles.container}>
            <h1>房产列表</h1>
            <ul className={styles.list}>
                {homes.length > 0 ? (
                    homes.map((home) => (
                        
                        <li key={home.id} className={styles['list-item']}>
                            <span>房屋 #{home.id} 所有者：{home.owner}  </span>
                            <span className={styles.price}>{`价格：${formatPrice(home.price)} RoomB`}</span>
                            <button
                                className={styles.button}
                                onClick={() => handleBuy(home.id, home.price)}
                                disabled={home.owner === account}
                            >
                                {home.owner === account ? '已拥有' : '购买'}
                            </button>
                            <img 
                                    src={`/images/${Math.floor(Math.random() * 5) + 1}.jpg`} 
                                    alt={`房产 #${String(home)}`} 
                                    className={styles.image} 
                                />
                        </li>
                    ))
                ) : (
                    <p>当前无在售房产</p>
                )}
            </ul>
        </div>
    );
};

export default HomeList;
