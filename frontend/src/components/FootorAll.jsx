// src/components/Footer.jsx
import React from "react";

const FooterAll = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm">SDC Ecommerce &copy; {new Date().getFullYear()} . All rights reserved.</p>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <a href="#" className="hover:text-gray-400">Privacy Policy</a>
          <a href="#" className="hover:text-gray-400">Terms of Service</a>
          <a href="#" className="hover:text-gray-400">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterAll;
