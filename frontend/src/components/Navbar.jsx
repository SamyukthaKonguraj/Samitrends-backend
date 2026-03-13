import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-blue-50 backdrop-blur-md shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">

      {/* Logo and Brand Name */}
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img
          src="/samy_logo.png"
          alt="SAMY TRENDS Logo"
          className="w-40 h-17 rounded-full object-cover border border-gray-300"
        />

      </div>

      {/* Right Side (Optional Buttons) */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold tracking-wide text-gray-700">
          Point of sale system Application
        </h1>
      </div>
    </nav>
  );
};

export default Navbar;
