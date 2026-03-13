import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [checkboxError, setCheckboxError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    location: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  // OTP states
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOTP] = useState('');
  const [serverUsername, setServerUsername] = useState(''); // store username for verification

  // Step 1: Request OTP
  const handleVerificationClick = async () => {
    if (!acceptedTerms) {
      setCheckboxError('You must accept the terms');
      return;
    }
    setCheckboxError('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/cashiers/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to request OTP');

      toast.success('OTP sent to manager! Enter OTP to complete registration.');
      setServerUsername(formData.username);
      setShowOTPDialog(true); // show OTP input dialog
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to request OTP');
      toast.error(err.message || 'Failed to request OTP');
    }
  };

  // Step 2: Verify OTP and register cashier
  const handleOTPSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cashiers/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: serverUsername, otp })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OTP verification failed');

      toast.success('Cashier registered successfully! Redirecting...');
      setShowOTPDialog(false);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'OTP verification failed');
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="relative w-full max-w-md mx-auto p-10 rounded-lg bg-white shadow-xl overflow-hidden">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Background gradients */}
      <div className="absolute -z-10 w-48 h-48 bg-gradient-radial from-red-400 to-red-500 rounded-full blur-3xl -top-12 -left-14"></div>
      <div className="absolute -z-10 w-24 h-24 bg-gradient-radial from-yellow-400 to-yellow-300 rounded-full blur-3xl top-2 left-28"></div>
      <div className="absolute -z-10 w-72 h-72 bg-gradient-radial from-purple-500 to-purple-400 rounded-full blur-3xl -bottom-32 -right-24"></div>

      <h2 className="text-2xl font-semibold tracking-wide mb-2 text-gray-700 text-center">SAMY TRENDS REGISTER CASHIER</h2>
      <h6 className="text-1xl font-semibold tracking-wide mb-2 text-gray-700 text-center">Welcome to SAMY TRENDS Family</h6>

      <form className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-medium text-gray-500 tracking-wider mb-1">FULL NAME</label>
          <input
            id="fullName"
            type="text"
            className="w-full p-2 border-b border-gray-200 text-base outline-none focus:border-gray-700 transition-colors"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Mobile & Location */}
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="mobile" className="block text-xs font-medium text-gray-500 tracking-wider mb-1">MOBILE</label>
            <input
              id="mobile"
              type="text"
              className="w-full p-2 border-b border-gray-200 text-base outline-none focus:border-gray-700 transition-colors"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="location" className="block text-xs font-medium text-gray-500 tracking-wider mb-1">LOCATION</label>
            <input
              id="location"
              type="text"
              className="w-full p-2 border-b border-gray-200 text-base outline-none focus:border-gray-700 transition-colors"
              placeholder="Enter location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-500 tracking-wider mb-1">EMAIL</label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border-b border-gray-200 text-base outline-none focus:border-gray-700 transition-colors"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Username */}
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

        {/* Password */}
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
        {checkboxError && <p className="text-red-500 text-sm">{checkboxError}</p>}

        <div className="flex items-center gap-3">
          <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={setAcceptedTerms} />
          <Label htmlFor="terms">I accept the terms and conditions</Label>
        </div>

        <div className="flex border-t border-gray-200">
          <div
            className="flex-1 text-center py-4 text-gray-500 font-medium tracking-wider cursor-pointer bg-gray-100 hover:bg-gray-200"
            onClick={() => navigate('/')}
          >
            LOGIN
          </div>
          <button
            type="button"
            className="flex-1 text-center py-4 text-white font-medium tracking-wider bg-green-600 hover:bg-green-700"
            onClick={handleVerificationClick}
          >
            VERIFICATION
          </button>
        </div>

        <p className="text-yellow-600 text-sm mt-2 text-center">
          ⚠️ Please contact the manager for authentication before starting the registration process.
        </p>
      </form>

      {/* OTP Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
            />
            <Button className="w-full" onClick={handleOTPSubmit}>
              Verify OTP & Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterForm;
