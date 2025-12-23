import React, { useState, useMemo } from 'react';
import { Portfolio, Transaction, User } from '../types';

interface WalletProps {
  portfolio: Portfolio;
  transactions: Transaction[];
  user: User;
  formatValue: (v: number) => string;
  onDeposit: (amt: number, sim: string, currency?: string) => void;
  onWithdrawal: (amt: number) => boolean;
  toggleReinvest: () => void;
  onCurrencyChange: (c: string) => void;
  availableCurrencies: Record<string, { symbol: string; rate: number }>;
  onUpdateUser: (updates: Partial<User>) => void;
}

const Wallet: React.FC<WalletProps> = ({ 
  portfolio, 
  transactions, 
  user, 
  formatValue, 
  onDeposit, 
  onWithdrawal, 
  toggleReinvest, 
  onCurrencyChange,
  availableCurrencies,
  onUpdateUser
}) => {
  const [amt, setAmt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isCustomCurrency, setIsCustomCurrency] = useState(false);
  const [customCurrencyCode, setCustomCurrencyCode] = useState('');
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({ mobileNumber: user.mobileNumber, email: user.email });

  const currentRate = useMemo(() => {
    const code = isCustomCurrency ? customCurrencyCode.toUpperCase() : user.currency;
    return availableCurrencies[code]?.rate || 1;
  }, [isCustomCurrency, customCurrencyCode, user.currency, availableCurrencies]);

  const handleAction = (type: 'DEP' | 'WIT', overrideAmount?: number) => {
    const val = overrideAmount ?? parseFloat(amt);
    if (isNaN(val) || val <= 0) return;
    
    setIsProcessing(true);
    setStatusMsg(null);
    const currencyToUse = isCustomCurrency ? customCurrencyCode.toUpperCase() : user.currency;

    setTimeout(() => {
      if (type === 'DEP') {
        onDeposit(val, user.mobileNumber, currencyToUse);
        setStatusMsg({ text: 'Deposit Synced to SIM Successfully', type: 'success' });
      } else {
        const success = onWithdrawal(val);
        if (success) {
          setStatusMsg({ text: 'Instant SIM Transfer Initiated', type: 'success' });
        } else {
          setStatusMsg({ text: 'Insufficient Liquidity in Matrix', type: 'error' });
        }
      }
      if (!overrideAmount) setAmt('');
      setIsProcessing(false);
      
      // Clear message after 3s
      setTimeout(() => setStatusMsg(null), 3000);
    }, 1200);
  };

  const handleWithdrawAll = () => {
    const totalInCurrentCurrency = portfolio.balance * currentRate;
    handleAction('WIT', totalInCurrentCurrency);
  };

  const handleSaveProfile = () => {
    onUpdateUser(editData);
    setIsEditingProfile(false);
    setStatusMsg({ text: 'Profile Integrity Updated', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const completedTransactions = useMemo(() => {
    return transactions
      .filter(tx => tx.status === 'COMPLETED')
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        {/* Universal Liquidity Card */}
        <div className="glass-panel p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 to-black/50 border border-blue-500/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Global Liquidity</p>
              <h2 className="text-5xl font-black text-white tracking-tighter tabular-nums">
                {formatValue(portfolio.balance)}
              </h2>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <select 
                className="bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-blue-400 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                value={isCustomCurrency ? 'CUSTOM' : user.currency}
                onChange={(e) => {
                  if (e.target.value === 'CUSTOM') {
                    setIsCustomCurrency(true);
                  } else {
                    setIsCustomCurrency(false);
                    onCurrencyChange(e.target.value);
                  }
                }}
              >
                {Object.keys(availableCurrencies).map(code => (
                  <option key={code} value={code}>{code} ({availableCurrencies[code].symbol})</option>
                ))}
                <option value="CUSTOM">OTHER...</option>
              </select>
              
              {isCustomCurrency && (
                <input 
                  type="text"
                  placeholder="CODE (e.g. BTC)"
                  className="w-24 bg-[#0a0b0d] border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white uppercase placeholder:text-gray-700"
                  value={customCurrencyCode}
                  onChange={(e) => setCustomCurrencyCode(e.target.value)}
                />
              )}
            </div>
          </div>
          
          <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
              <i className="fas fa-sim-card text-blue-500 text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Universal SIM Link</p>
              <p className="text-sm font-bold text-white font-mono tracking-widest">{user.mobileNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-green-500 uppercase italic">Instant Liberty</p>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Withdraw Anytime</p>
            </div>
          </div>
        </div>

        {/* Universal SIM Transfer Controls */}
        <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
          <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
            <span className="italic tracking-tighter uppercase">Universal SIM Transfer</span>
            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400 font-bold uppercase tracking-widest">No Hold Period</span>
          </h3>
          
          <div className="space-y-6">
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 font-bold group-focus-within:text-blue-500 transition-colors uppercase text-[10px]">Value</span>
              <input 
                type="number"
                step="any"
                placeholder="0.00"
                className="w-full bg-[#0a0b0d] border border-white/5 rounded-2xl pl-16 pr-32 py-6 focus:border-blue-500 focus:outline-none transition-all text-white font-black text-2xl placeholder:text-gray-800"
                value={amt}
                onChange={e => setAmt(e.target.value)}
              />
              <button 
                onClick={() => setAmt((portfolio.balance * currentRate).toString())}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Max
              </button>
            </div>

            {statusMsg && (
              <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center italic animate-in slide-in-from-top-2 duration-300 ${
                statusMsg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {statusMsg.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAction('DEP')}
                disabled={isProcessing || !amt}
                className="py-6 bg-white text-black font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 disabled:opacity-20 relative overflow-hidden uppercase tracking-widest text-xs"
              >
                {isProcessing ? 'PROCESSING...' : 'DEPOSIT'}
              </button>
              <button 
                onClick={() => handleAction('WIT')}
                disabled={isProcessing || !amt}
                className="py-6 border border-blue-500/20 bg-blue-600/5 text-blue-400 font-black rounded-2xl hover:bg-blue-600/20 transition-all active:scale-95 disabled:opacity-20 uppercase tracking-widest text-xs"
              >
                WITHDRAW
              </button>
            </div>
            
            <button 
              onClick={handleWithdrawAll}
              disabled={isProcessing || portfolio.balance <= 0}
              className="w-full py-4 border border-white/10 text-gray-500 hover:text-white hover:border-white/20 font-bold rounded-2xl transition-all uppercase tracking-[0.3em] text-[10px] italic"
            >
              Express Withdrawal: Full Balance
            </button>
            
            <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
              Your money is yours at all times. <br/>Withdrawals are processed instantly to your linked SIM.
            </p>
          </div>
        </div>

        {/* Autonomous Yield Relay */}
        <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold italic tracking-tighter uppercase">Yield Compounding</h3>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Growth continues until the moment you withdraw.</p>
            </div>
            <button 
              onClick={toggleReinvest}
              className={`w-14 h-8 rounded-full transition-all duration-500 relative ${portfolio.reinvestEnabled ? 'bg-blue-600' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-lg ${portfolio.reinvestEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <div className="p-6 rounded-3xl bg-[#0a0b0d] border border-white/5 grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Gateway Status</span>
               <span className="text-xs text-green-500 font-black flex items-center">
                 <i className="fas fa-bolt mr-2 animate-pulse"></i> UNRESTRICTED
               </span>
             </div>
             <div className="space-y-1 text-right">
               <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Liberty Protocol</span>
               <span className="text-xs text-blue-400 font-black uppercase">LIVE ACCESS</span>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Intelligence (Adjustable) */}
        <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold italic tracking-tighter uppercase">Node Identity</h3>
            <button 
              onClick={() => {
                if(isEditingProfile) handleSaveProfile();
                else setIsEditingProfile(true);
              }}
              className="text-[10px] font-black uppercase text-blue-500 tracking-widest hover:text-white transition-colors flex items-center space-x-2"
            >
              <i className={`fas ${isEditingProfile ? 'fa-save' : 'fa-pen'}`}></i>
              <span>{isEditingProfile ? 'Lock Updates' : 'Adjust Matrix'}</span>
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-blue-400">
                <i className="fas fa-user-tag"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Principal Identity</p>
                <p className="text-sm font-bold text-white truncate uppercase">{user.fullName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-purple-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-purple-400">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Instant Relay SIM</p>
                {isEditingProfile ? (
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-white mt-1"
                    value={editData.mobileNumber}
                    onChange={e => setEditData({...editData, mobileNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm font-bold text-white truncate">{user.mobileNumber}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-indigo-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-indigo-400">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Encryption Email</p>
                {isEditingProfile ? (
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-white mt-1"
                    value={editData.email}
                    onChange={e => setEditData({...editData, email: e.target.value})}
                  />
                ) : (
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quantum Immutable Ledger */}
        <div className="glass-panel p-10 rounded-[3rem] border border-blue-500/10 h-[580px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
            <i className="fas fa-dna text-6xl text-blue-500"></i>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tighter italic uppercase">Quantum Ledger</h3>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-400 rounded-lg tracking-widest uppercase">
                V-SHIELD PROTECTED
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest">
              Cryptographically signed records. Integrity: <span className="text-green-500 font-black">100% SECURE</span>
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-3">
            {completedTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                <i className="fas fa-network-wired text-6xl mb-4"></i>
                <p className="text-xs font-bold uppercase tracking-widest">Genesis Block Awaiting Data</p>
              </div>
            ) : (
              completedTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="group flex items-center justify-between p-5 rounded-3xl bg-[#0a0b0d] border border-white/5 hover:border-blue-500/30 transition-all duration-500"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${
                      tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' :
                      tx.type === 'WITHDRAWAL' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-purple-500/10 text-purple-500'
                    }`}>
                      <i className={`fas ${
                        tx.type === 'DEPOSIT' ? 'fa-arrow-down' :
                        tx.type === 'WITHDRAWAL' ? 'fa-arrow-up' :
                        tx.type === 'TRADE' ? 'fa-robot' :
                        'fa-sync-alt'
                      }`}></i>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-black text-white uppercase tracking-tighter">{tx.type}</p>
                        <span className="text-[8px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded font-mono">#{tx.id.toUpperCase()}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium italic">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black font-mono tracking-tighter ${
                      tx.type === 'WITHDRAWAL' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {tx.type === 'WITHDRAWAL' ? '-' : '+'}{formatValue(tx.amount)}
                    </p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <i className="fas fa-shield-check text-[8px] text-blue-500"></i>
                      <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-gray-700">
            <span className="flex items-center uppercase tracking-widest">
              <i className="fas fa-atom mr-2 text-blue-900 animate-spin-slow"></i>
              Protocol Entropy Verified
            </span>
            <span className="uppercase tracking-widest">Instant Exit Priority Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;