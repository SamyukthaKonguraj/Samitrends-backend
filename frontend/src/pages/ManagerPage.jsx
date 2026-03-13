import React from 'react';
import ManagerDashboard from '../components/ManagerDashboard';
import FooterAll from '../components/FootorAll';

const ManagerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerDashboard />
      <FooterAll />
    </div>
  );
};

export default ManagerPage;