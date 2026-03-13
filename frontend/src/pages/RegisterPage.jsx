import React from 'react';
import RegisterForm from '../components/RegisterForm';
import FooterAll from '../components/FootorAll';
import Navbar from '../components/Navbar';

const RegisterPage = () => {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Main content: centered form */}

      <main className="flex flex-grow">
        {/* Left half - Branding */}
        <div className="flex-1  flex flex-col items-center justify-center p-8 border-r">
          <img
            src="/samy_logo.png"
            alt="Logo"
            className="w-40 mb-6"
          />
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform</h1>
          <p className="text-lg text-gray-700 text-center">
            Experience seamless shopping for your store. Join thousands of supermarkets that trust us for efficiency, reliability, and smarter operations.
          </p>
        </div>

        {/* Right half - Login Form */}
        <div className="flex-1 flex items-center justify-center bg-white p-8">
          <RegisterForm />
        </div>
      </main>


    </div>
  );
};

export default RegisterPage;
