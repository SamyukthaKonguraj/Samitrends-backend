import React from 'react';
import CashierDashboard from '../components/CashierDashboard';
import FooterAll from '../components/FootorAll';

const CashierPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CashierDashboard />
      <FooterAll />
    </div>
  );
};

export default CashierPage;