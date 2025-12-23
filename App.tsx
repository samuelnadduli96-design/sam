import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppSection, Transaction, Portfolio, MarketData, RiskTolerance, RiskSettings, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TradingBot from './components/TradingBot';
import Wallet from './components/Wallet';
import Analytics from './components/Analytics';
import RiskControls from './components/RiskControls';
import Auth from './components/Auth';
import SecurityLock from './components/SecurityLock';

// The hardcoded Master Access Key - Only the owner knows this.
const MASTER_ACCESS_KEY = "0705714742";

const INITIAL_RISK_SETTINGS: RiskSettings = {
  stopLossPercentage: 5,
  riskTolerance: RiskTolerance.AGGRESSIVE,
  autoRebalance: true,
  diversificationThreshold: 50
};

const CURRENCIES: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  JPY: { symbol: '¥', rate: 151 },
  KES: { symbol: 'KSh', rate: 130 },
  NGN: { symbol: '₦', rate: 1500 },
  GHS: { symbol: 'GH₵', rate: 14 },
  ZAR: { symbol: 'R', rate: 19 },
  INR: { symbol: '₹', rate: 83 },
  CNY: { symbol: '¥', rate: 7.2 },
  CAD: { symbol: 'C$', rate: 1.36 },
  AUD: { symbol: 'A$', rate: 1.52 },
  BRL: { symbol: 'R$', rate: 5.1 },
  BTC: { symbol: '₿', rate: 0.000015 },
  ETH: { symbol: 'Ξ', rate: 0.00029 },
  SOL: { symbol: 'S', rate: 0.0068 },
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('CONSCIOUS_USER');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [masterVerified, setMasterVerified] = useState(() => {
    // If a user already exists, they've passed the master gate previously
    return !!localStorage.getItem('CONSCIOUS_USER');
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const saved = localStorage.getItem('CONSCIOUS_PORTFOLIO');
    return saved ? JSON.parse(saved) : {
      balance: 1000,
      totalProfit: 0,
      reinvestEnabled: true,
      riskSettings: INITIAL_RISK_SETTINGS
    };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('CONSCIOUS_TXS');
    return saved ? JSON.parse(saved) : [];
  });

  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: 'BTC', price: 64230, change24h: 2.4, volume: 15.2, allocation: 40 },
    { symbol: 'ETH', price: 3450, change24h: -1.1, volume: 8.4, allocation: 30 },
    { symbol: 'SOL', price: 145, change24h: 5.7, volume: 4.2, allocation: 20 },
    { symbol: 'CON', price: 1.25, change24h: 12.3, volume: 0.8, allocation: 10 },
  ]);

  // Persist Data Changes
  useEffect(() => {
    if (user) localStorage.setItem('CONSCIOUS_USER', JSON.stringify(user));
    localStorage.setItem('CONSCIOUS_PORTFOLIO', JSON.stringify(portfolio));
    localStorage.setItem('CONSCIOUS_TXS', JSON.stringify(transactions));
  }, [user, portfolio, transactions]);

  const currencyData = useMemo(() => {
    const code = user?.currency || 'USD';
    return CURRENCIES[code] || { symbol: code, rate: 1 };
  }, [user?.currency]);

  const lastUpdateRef = useRef<number>(Date.now());
  useEffect(() => {
    if (!user || !isUnlocked || !portfolio.reinvestEnabled || portfolio.balance <= 0) return;

    const autonomousTimer = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      const yieldFactorPerMs = 0.0001 / 1000;
      const yieldGain = portfolio.balance * (yieldFactorPerMs * deltaMs);
      
      setPortfolio(prev => ({
        ...prev,
        balance: prev.balance + yieldGain,
        totalProfit: prev.totalProfit + yieldGain
      }));
    }, 100);

    return () => clearInterval(autonomousTimer);
  }, [user, isUnlocked, portfolio.reinvestEnabled, portfolio.balance]);

  const formatValue = (val: number) => {
    const converted = val * currencyData.rate;
    return `${currencyData.symbol}${converted.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 8 
    })}`;
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setIsUnlocked(true);
    setMasterVerified(true);
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const handleMasterVerify = (key: string) => {
    if (key === MASTER_ACCESS_KEY) {
      setMasterVerified(true);
      return true;
    }
    return false;
  };

  const handleWipeData = () => {
    if (window.confirm("CRITICAL: This will wipe all local data and lock the terminal. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleDeposit = (amount: number, sim: string, specificCurrency?: string) => {
    const currencyToUse = specificCurrency || user?.currency || 'USD';
    const rate = CURRENCIES[currencyToUse]?.rate || 1;
    const usdAmount = amount / rate;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'DEPOSIT',
      amount: usdAmount,
      currency: currencyToUse,
      timestamp: Date.now(),
      status: 'COMPLETED',
      description: `Universal Deposit [${currencyToUse}] via SIM ${sim}`
    };

    setTransactions(prev => [newTx, ...prev]);
    setPortfolio(prev => ({
      ...prev,
      balance: prev.balance + usdAmount
    }));
  };

  const handleWithdrawal = (amount: number) => {
    const usdAmount = amount / currencyData.rate;
    if (usdAmount > portfolio.balance) return false;
    
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'WITHDRAWAL',
      amount: usdAmount,
      currency: user?.currency || 'USD',
      timestamp: Date.now(),
      status: 'COMPLETED',
      description: `Universal Withdrawal to SIM ${user?.mobileNumber}`
    };

    setTransactions(prev => [newTx, ...prev]);
    setPortfolio(prev => ({
      ...prev,
      balance: prev.balance - usdAmount
    }));
    return true;
  };

  const handleBotTrade = (profit: number, recommendation: 'BUY' | 'SELL') => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'TRADE',
      amount: profit,
      currency: user?.currency || 'USD',
      timestamp: Date.now(),
      status: 'COMPLETED',
      description: `AI ${recommendation} Operation: Delta Yield Capture`
    };
    
    setTransactions(prev => [newTx, ...prev]);
    setPortfolio(prev => ({ 
      ...prev, 
      balance: prev.balance + profit, 
      totalProfit: prev.totalProfit + profit 
    }));
  };

  // If the owner hasn't verified the master key and no user exists
  if (!masterVerified && !user) {
    return <Auth onAuth={handleLogin} onVerifyMaster={handleMasterVerify} step="MASTER" />;
  }

  // Profile creation step for the authorized owner
  if (!user) {
    return <Auth onAuth={handleLogin} onVerifyMaster={handleMasterVerify} step="PROFILE" />;
  }

  // Routine security lock for the owner
  if (!isUnlocked) {
    return <SecurityLock user={user} onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#050608] selection:bg-blue-500/30">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} user={user} />
      
      <main className="flex-1 ml-64 p-8 relative min-h-screen">
        <div className="fixed top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 via-transparent to-blue-500 opacity-20 pointer-events-none z-50"></div>
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-4xl font-black tracking-tighter text-white">
                {activeSection.replace('_', ' ')}
              </h1>
              <div className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Node Bound: {user.fullName.split(' ')[0]}</span>
              </div>
            </div>
            <p className="text-gray-500 mt-1 font-medium italic">Authorized terminal access restricted to primary identity.</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Liquid Matrix Value</p>
              <p className="text-3xl font-black text-blue-500 tabular-nums drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">{formatValue(portfolio.balance)}</p>
            </div>
            <button 
              onClick={() => setIsUnlocked(false)}
              className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-blue-600/10 group active:scale-95 transition-all"
              title="Lock Terminal"
            >
              <div className="w-full h-full bg-[#0a0b0d] rounded-[13px] flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <i className="fas fa-lock text-blue-500 group-hover:text-white transition-colors"></i>
              </div>
            </button>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
          {activeSection === AppSection.DASHBOARD && (
            <Dashboard portfolio={portfolio} marketData={marketData} transactions={transactions} formatValue={formatValue} setActiveSection={setActiveSection} />
          )}
          {activeSection === AppSection.TRADING_BOT && (
            <TradingBot 
              marketData={marketData} 
              riskSettings={portfolio.riskSettings} 
              formatValue={formatValue} 
              portfolioBalance={portfolio.balance}
              onTrade={handleBotTrade} 
            />
          )}
          {activeSection === AppSection.WALLET && (
            <Wallet 
              portfolio={portfolio} 
              transactions={transactions} 
              user={user}
              formatValue={formatValue}
              onDeposit={handleDeposit} 
              onWithdrawal={handleWithdrawal}
              toggleReinvest={() => setPortfolio(p => ({ ...p, reinvestEnabled: !p.reinvestEnabled }))}
              onCurrencyChange={(c) => setUser({ ...user, currency: c })}
              availableCurrencies={CURRENCIES}
              onUpdateUser={handleUpdateUser}
            />
          )}
          {activeSection === AppSection.ANALYTICS && (
            <Analytics portfolio={portfolio} transactions={transactions} marketData={marketData} formatValue={formatValue} />
          )}
          {activeSection === AppSection.RISK_CONTROLS && (
            <RiskControls 
              settings={portfolio.riskSettings} 
              onUpdate={(s) => setPortfolio(p => ({ ...p, riskSettings: { ...p.riskSettings, ...s } }))} 
              onWipe={handleWipeData}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;