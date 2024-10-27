import React, { useEffect, useState } from 'react';
import { web3, BuyMyRoomContract } from '../utils/contracts';
import styles from './SellProperty.module.css'; // 引入 CSS 模块

const SellProperty: React.FC = () => {
    const [propertyURI, setPropertyURI] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [account, setAccount] = useState<string | null>(null);

    // 获取用户账户信息
    useEffect(() => {
        const loadAccount = async () => {
            try {
                const accounts = await web3.eth.getAccounts();
                if (accounts.length === 0) {
                    alert('请连接 MetaMask，并确保已登录。');
                    return;
                }
                setAccount(accounts[0]);
            } catch (error) {
                console.error('无法获取账户信息：', error);
            }
        };

        loadAccount();
    }, []);

    // 上架房产的处理逻辑
    const handleSell = async () => {
        if (!propertyURI || !price || !account) {
            alert('请填写完整信息并确保已连接账户。');
            return;
        }

        try {
            console.log('上架房产：',account, propertyURI, price);
            await BuyMyRoomContract.methods
                .listHouse(propertyURI, web3.utils.toWei(price, 'ether'))
                .send({ from: account });

            alert('房产已成功上架！');
        } catch (error) {
            console.error('上架失败：', error);
            alert('上架失败，请重试。');
        }
    };

    return (
        <div className={styles.container}>
            <h1>上架房产</h1>
            <input
                type="text"
                placeholder="房产 URI"
                value={propertyURI}
                onChange={(e) => setPropertyURI(e.target.value)}
            />
            <input
                type="number"
                placeholder="价格（RoomB）"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <button onClick={handleSell}>上架</button>
        </div>
    );
};

export default SellProperty;
