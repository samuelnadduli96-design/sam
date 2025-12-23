import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onAuth: (user: User) => void;
  onVerifyMaster: (key: string) => boolean;
  step: 'MASTER' | 'PROFILE';
}

const Auth: React.FC<AuthProps> = ({ onAuth, onVerifyMaster, step }) => {
  const [masterKey, setMasterKey] = useState('');
  const [masterError, setMasterError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [formData, setFormData] = useState({
    fullName: 'Nadduli Samuel',
    mobileNumber: '',
    email: '',
    currency: 'USD',
    pinCode: '2008'
  });

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData({ ...formData, pinCode: val });
  };

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setMasterError(false);
    
    // Simulate complex decryption/verification delay
    setTimeout(() => {
      const success = onVerifyMaster(masterKey);
      if (!success) {
        setMasterError(true);
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.mobileNumber && formData.email && formData.pinCode.length === 4) {
      onAuth(formData);
    }
  };

  if (step === 'MASTER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050608] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>
        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-12">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 ${
              masterError ? 'bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)]' : 'bg-blue-600 neon-glow'
            }`}>
              <i className={`fas ${masterError ? 'fa-triangle-exclamation animate-bounce' : isVerifying ? 'fa-spinner fa-spin' : 'fa-shield-halved'} text-white text-4xl`}></i>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Terminal Locked</h1>
            <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Restricted Access Area</p>
          </div>

          <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 relative">
            <form onSubmit={handleMasterSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Security Clearance Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Enter Master Access Key"
                    className={`w-full bg-[#0a0b0d] border rounded-2xl px-6 py-5 focus:outline-none transition-all text-white font-mono text-center tracking-widest uppercase ${
                      masterError ? 'border-red-500/50 text-red-500 animate-shake' : 'border-white/5 focus:border-blue-500'
                    }`}
                    value={masterKey}
                    onChange={e => setMasterKey(e.target.value)}
                    disabled={isVerifying}
                  />
                  {isVerifying && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isVerifying || !masterKey}
                className={`w-full py-5 rounded-2xl transition-all uppercase tracking-widest text-sm font-black active:scale-95 ${
                  masterError ? 'bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/10'
                }`}
              >
                {isVerifying ? 'Verifying Integrity...' : masterError ? 'Access Denied: Retry' : 'Decrypt Terminal'}
              </button>
            </form>
            
            <p className="mt-8 text-center text-[8px] text-gray-600 font-black uppercase tracking-[0.4em] leading-relaxed">
              Unauthorized access attempts are logged. <br/>Protocol V-SHIELD is active.
            </p>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
          .animate-shake { animation: shake 0.15s ease-in-out infinite; }
        `}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050608] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center neon-glow mb-6 rotate-12">
            <i className="fas fa-brain text-white text-4xl"></i>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Conscious</h1>
          <p className="text-gray-500 mt-2 font-black uppercase tracking-widest text-[10px]">Primary Identity Setup</p>
        </div>

        <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Owner Identity</label>
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-[#0a0b0d] border border-white/5 rounded-2xl px-6 py-4 focus:border-blue-500 focus:outline-none transition-all text-white font-medium"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Linked SIM</label>
                <input 
                  type="tel" 
                  placeholder="+..."
                  className="w-full bg-[#0a0b0d] border border-white/5 rounded-2xl px-6 py-4 focus:border-blue-500 focus:outline-none transition-all text-white font-mono text-sm"
                  value={formData.mobileNumber}
                  onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Terminal PIN</label>
                <input 
                  type="password" 
                  inputMode="numeric"
                  placeholder="****"
                  maxLength={4}
                  className="w-full bg-[#0a0b0d] border border-white/5 rounded-2xl px-6 py-4 focus:border-blue-500 focus:outline-none transition-all text-white font-mono tracking-[0.5em] text-center"
                  value={formData.pinCode}
                  onChange={handlePinChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Encryption Email</label>
              <input 
                type="email" 
                placeholder="owner@conscious.matrix"
                className="w-full bg-[#0a0b0d] border border-white/5 rounded-2xl px-6 py-4 focus:border-blue-500 focus:outline-none transition-all text-white"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={formData.pinCode.length !== 4}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-sm disabled:opacity-30"
            >
              Bind Node to Identity
            </button>
          </form>
          
          <p className="text-center text-[9px] text-gray-600 mt-8 font-bold uppercase tracking-widest leading-relaxed">
            This device will be bound to your identity. <br/>Only your 4-digit PIN can unlock the matrix from now on.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;