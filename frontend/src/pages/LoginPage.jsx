import React from 'react';
import LoginForm from '../components/LoginForm';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  return (
    <div className="flex flex-col min-h-screen">


      <main className="flex flex-grow">
        {/* Left half - Branding */}
        <div className="flex-1  flex flex-col items-center justify-center p-8 border-r">
          <img
            src="/samy_logo.png"
            alt="Logo"
            className="w-40 mb-6"
          />
          <h1 className="text-4xl font-bold mb-4 text-center">Welcome to Our POS Application</h1>
          <p className="text-lg text-gray-700 text-center">
            Experience seamless shopping for your store. Join thousands of supermarkets that trust us for efficiency, reliability, and smarter operations.
          </p>
        </div>

        {/* Right half - Login Form */}
        <div className="flex-1 flex items-center justify-center bg-white p-8">
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
