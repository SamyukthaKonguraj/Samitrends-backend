import React from 'react';
import ManagerRegisterForm from '../components/ManagerRegisterForm';
import FooterAll from '../components/FootorAll';
const ManagerRegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <ManagerRegisterForm />
    <FooterAll />
    </div>
  );
};

export default ManagerRegisterPage;