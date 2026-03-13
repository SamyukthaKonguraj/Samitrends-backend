import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CashierPage from './pages/CashierPage';
import ManagerPage from './pages/ManagerPage';
import ManagerRegisterPage from './pages/ManagerRegisterPage';
import TransactionsPage from './pages/TransactionsPage';
import CouponsPage from './pages/CouponsPage';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Cashiers from './pages/Cashiers';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/manager-register" element={<ManagerRegisterPage />} />
        <Route path="/cashier" element={<CashierPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/cashiers" element={<Cashiers />} />
      </Routes>
    </Router>
  );
};

export default App;
