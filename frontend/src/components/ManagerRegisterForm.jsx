import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManagerRegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/manager/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Registration failed');

      const data = await response.json();
      
      navigate('/'); // Redirect to login page after registration
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-16 p-10 rounded-lg bg-white shadow-xl overflow-hidden">
      <div className="absolute -z-10 w-48 h-48 bg-gradient-radial from-red-400 to-red-500 rounded-full blur-3xl -top-12 -left-14"></div>
      <div className="absolute -z-10 w-24 h-24 bg-gradient-radial from-yellow-400 to-yellow-300 rounded-full blur-3xl top-2 left-28"></div>
      <div className="absolute -z-10 w-72 h-72 bg-gradient-radial from-purple-500 to-purple-400 rounded-full blur-3xl -bottom-32 -right-24"></div>

      <h2 className="text-2xl font-semibold tracking-wide mb-8 text-gray-700 text-center">REGISTER MANAGER</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-xs font-medium text-gray-500 tracking-wider mb-1">USERNAME</label>
          <input
            id="username"
            type="text"
            className="w-full p-2 border-b border-gray-200 text-base outline-none focus:border-gray-700 transition-colors"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-500 tracking-wider mb-1">PASSWORD</label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border-b border-gray-200 text-base outline-none focus:border-gray-700 transition-colors"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex border-t border-gray-200">
          <div
            className="flex-1 text-center py-4 text-gray-500 font-medium tracking-wider cursor-pointer bg-gray-100 hover:bg-gray-200"
            onClick={() => navigate('/')}
          >
            LOGIN
          </div>
          <button
            type="submit"
            className="flex-1 text-center py-4 text-white font-medium tracking-wider bg-green-600 hover:bg-green-700"
          >
            REGISTER
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerRegisterForm;