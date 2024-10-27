import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeList from './components/HomeList';
import MyProperties from './components/MyProperties';
import SellProperty from './components/SellProperty';
import './App.css'; // 引入 CSS 文件
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const App: React.FC = () => {
    return (
        <Router>
            <div className="app-container">
                <h1>去中心化房屋购买系统</h1>
                <div className="components-container">
                    <div className="component">
                        
                        <HomeList />
                    </div>
                    <div className="component">
                        
                        <MyProperties />
                    </div>
                    <div className="component">
                        
                        <SellProperty />
                    </div>
                </div>
            </div>
        </Router>
    );
};

export default App;
