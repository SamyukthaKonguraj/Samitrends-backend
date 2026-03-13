import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false); // track checkbox
  const [checkboxError, setCheckboxError] = useState(''); // checkbox error message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCheckboxError('');

    // Check if terms are accepted
    if (!acceptedTerms) {
      setCheckboxError('You must accept the terms and conditions to login.');
      toast.error('Please accept the terms!');
      return;
    }

    const loginUrl = 'http://localhost:5000/api/auth/login';

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Login failed: ${response.statusText}`);
      }

      let userRole;
      if (data.user && data.user.role) {
        userRole = data.user.role;
      } else if (data.role) {
        userRole = data.role;
      } else {
        throw new Error('Invalid response: User role not found');
      }

      const token = data.token;
      if (!token) {
        throw new Error('Invalid response: Token not found');
      }

      localStorage.setItem('token', token);
      toast.success('Login successful! Redirecting...');

      setTimeout(() => {
        if (userRole === 'manager') navigate('/manager');
        else if (userRole === 'cashier') navigate('/cashier');
      }, 1000);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred during login');
      toast.error(err.message || 'Login failed!');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-right  p-10 rounded-lg bg-white shadow-xl overflow-hidden">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="absolute -z-10 w-48 h-48 bg-gradient-radial from-red-400 to-red-500 rounded-full blur-3xl -top-12 -left-14"></div>
      <div className="absolute -z-10 w-24 h-24 bg-gradient-radial from-yellow-400 to-yellow-300 rounded-full blur-3xl top-2 left-28"></div>
      <div className="absolute -z-10 w-72 h-72 bg-gradient-radial from-purple-500 to-purple-400 rounded-full blur-3xl -bottom-32 -right-24"></div>

      <h2 className="text-2xl font-semibold tracking-wide mb-4 text-gray-700 text-center">SAMY TRENDS LOGIN</h2>
      <h6 className="text-1xl font-semibold tracking-wide  text-gray-700 text-center">Welcome to POS Application</h6>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-xs font-medium text-gray-500 tracking-wider mb-1">USERNAME</label>
          <input
            id="username"
            type="text"
            className="w-full p-2 border-b border-gray-200 text-base outline-none focus:border-gray-700 transition-colors"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Checkbox */}
        <div className="flex items-center gap-3">
          <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={setAcceptedTerms} />
          <Label htmlFor="terms">I accept the terms and conditions</Label>
        </div>
        <p className="text-gray-500 text-sm mt-2  text-center">
          New here? Click "REGISTER" to create your account.
        </p>

        <div className="flex border-t mt-0 border-gray-200">
          <div
            className="flex-1 text-center py-4 text-gray-500 font-medium tracking-wider cursor-pointer bg-gray-100 hover:bg-gray-200"
            onClick={() => navigate('/register')}
          >
            REGISTER
          </div>
          <button
            type="submit"
            className="flex-1 text-center py-4 text-white font-medium tracking-wider bg-green-600 hover:bg-gray-800"
          >
            LOGIN
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-2 text-center">
          By logging in, you agree to our terms and conditions.
        </p>

        {/* Checkbox error message */}
        {checkboxError && <p className="text-red-500 text-sm mt-2">{checkboxError}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
