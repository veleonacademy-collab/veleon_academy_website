import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/landing-page#enroll-section', { replace: true });
    
    // Smooth scroll down to the enrollment section after redirect
    setTimeout(() => {
      const element = document.getElementById('enroll-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Redirecting to Secure Checkout...</p>
      </div>
    </div>
  );
};

export default PaymentPage;
