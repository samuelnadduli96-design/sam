
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface SecurityLockProps {
  user: User;
  onUnlock: () => void;
}

const SecurityLock: React.FC<SecurityLockProps> = ({ user, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === user.pinCode) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050608] p-6 relative overflow-hidden">
      {/* Pulse background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/20">
          <i className="fas fa-lock text-white text-xl"></i>
        </div>
        
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Matrix Access</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-10">Identify to authorize terminal</p>

        <div className={`flex justify-center space-x-4 mb-12 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                pin.length > idx 
                  ? 'bg-blue-500 border-blue-500 scale-125 shadow-[0_0_10px_#3b82f6]' 
                  : 'bg-transparent border-white/20'
              } ${error ? 'border-red-500 bg-red-500 shadow-[0_0_10px_#ef4444]' : ''}`}
            ></div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full px-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button 
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-20 h-20 rounded-full glass-panel flex items-center justify-center text-2xl font-black text-white hover:bg-white/5 active:scale-90 transition-all border border-white/5"
            >
              {num}
            </button>
          ))}
          <div className="w-20 h-20"></div>
          <button 
            onClick={() => handleKeyPress('0')}
            className="w-20 h-20 rounded-full glass-panel flex items-center justify-center text-2xl font-black text-white hover:bg-white/5 active:scale-90 transition-all border border-white/5"
          >
            0
          </button>
          <button 
            onClick={handleBackspace}
            className="w-20 h-20 rounded-full flex items-center justify-center text-xl text-gray-500 hover:text-white transition-all active:scale-90"
          >
            <i className="fas fa-backspace"></i>
          </button>
        </div>

        <button 
           onClick={() => window.location.reload()}
           className="mt-12 text-[9px] font-black text-gray-700 uppercase tracking-[0.3em] hover:text-red-500 transition-colors"
        >
          Reset Session Nodes
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default SecurityLock;
