
import React, { useMemo } from 'react';
import { Portfolio, Transaction, MarketData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface AnalyticsProps {
  portfolio: Portfolio;
  transactions: Transaction[];
  marketData: MarketData[];
  formatValue: (v: number) => string;
}

const Analytics: React.FC<AnalyticsProps> = ({ portfolio, transactions, marketData, formatValue }) => {
  const profitData = [
    { name: 'Week 1', profit: 45 },
    { name: 'Week 2', profit: 52 },
    { name: 'Week 3', profit: 38 },
    { name: 'Week 4', profit: 65 },
    { name: 'Week 5', profit: 82 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#6366f1', '#a855f7', '#10b981'];

  const pieData = marketData.map(asset => ({ name: asset.symbol, value: asset.allocation }));

  // Calculate 24h Performance stats
  const performance24h = useMemo(() => {
    const dayAgo = Date.now() - 86400000;
    
    // Sum gains from transactions (Trade, Profit, Reinvest)
    const ledgerGains = transactions
      .filter(tx => tx.timestamp > dayAgo && (tx.type === 'TRADE' || tx.type === 'PROFIT' || tx.type === 'REINVEST'))
      .reduce((acc, tx) => acc + tx.amount, 0);

    // Since the app has an "unstoppable" autonomous yield that isn't always logged as a transaction,
    // we calculate the projected yield over the last 24h to ensure the analytics reflect reality.
    // Autonomous logic is 0.05% every 10 seconds. (86400 / 10) * 0.0005 = 4.32% base daily drift.
    const autonomousDrift = portfolio.balance * 0.0432; 
    
    const totalGain = ledgerGains + autonomousDrift;
    const previousBalance = portfolio.balance - totalGain;
    const percentageChange = previousBalance > 0 ? (totalGain / previousBalance) * 100 : totalGain > 0 ? 100 : 0;

    return {
      totalGain,
      percentageChange,
      isPositive: totalGain >= 0
    };
  }, [transactions, portfolio.balance]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 24-Hour Performance Matrix */}
      <div className="glass-panel p-10 rounded-[2.5rem] border border-blue-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
          <i className="fas fa-chart-line text-8xl"></i>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h3 className="text-xl font-black text-white tracking-tighter mb-1">24-Hour Performance Matrix</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Autonomous yield and market delta analysis</p>
          </div>
          
          <div className="flex items-center space-x-12">
            <div className="text-left">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Net Gain/Loss</p>
              <p className={`text-3xl font-black ${performance24h.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {performance24h.isPositive ? '+' : ''}{formatValue(performance24h.totalGain)}
              </p>
            </div>
            
            <div className="text-left">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Percentage Shift</p>
              <div className={`flex items-center text-3xl font-black ${performance24h.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <i className={`fas fa-caret-${performance24h.isPositive ? 'up' : 'down'} mr-2`}></i>
                {performance24h.percentageChange.toFixed(2)}%
              </div>
            </div>
            
            <div className="hidden xl:flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
                  <i className="fas fa-microchip text-blue-500 text-xs"></i>
                </div>
              </div>
              <span className="text-[8px] font-black text-blue-500 uppercase mt-2">AI Analyzing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-8">Weekly Performance Gradient</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.02)'}}
                   contentStyle={{ backgroundColor: '#050608', border: '1px solid #ffffff10', borderRadius: '16px' }}
                   itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  {profitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-8">Asset Concentration</h3>
          <div className="h-80 relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050608', border: 'none', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white italic">100%</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Liquid Balance</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-panel p-8 rounded-3xl">
            <h3 className="text-lg font-bold mb-6">Efficiency Indices</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                <span className="text-sm font-medium text-gray-400">Sharpe Ratio</span>
                <span className="font-black text-green-400 font-mono text-lg">2.84</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all">
                <span className="text-sm font-medium text-gray-400">Max Drawdown Ceiling</span>
                <span className="font-black text-blue-400 font-mono text-lg">-{portfolio.riskSettings.stopLossPercentage}%</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-blue-600/10 border border-blue-500/30 rounded-2xl">
                <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Volatility Shield</span>
                <span className="text-xs text-blue-400 font-black flex items-center">
                  <i className="fas fa-shield-halved mr-2"></i> REINFORCED
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Diversification Health</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Structural asset integrity score</p>
              
              <div className="flex items-end space-x-4">
                <span className="text-6xl font-black text-white italic leading-none">
                  {Math.max(...marketData.map(a => a.allocation)) < portfolio.riskSettings.diversificationThreshold ? '98' : '62'}
                </span>
                <span className={`font-black uppercase tracking-tighter mb-2 text-sm ${Math.max(...marketData.map(a => a.allocation)) < portfolio.riskSettings.diversificationThreshold ? 'text-green-400' : 'text-yellow-400'}`}>
                  {Math.max(...marketData.map(a => a.allocation)) < portfolio.riskSettings.diversificationThreshold ? 'Optimal Matrix' : 'Correction Needed'}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-8 leading-relaxed font-medium">
              Based on your <b className="text-white">{portfolio.riskSettings.diversificationThreshold}% limit</b>, your current node allocation is 
              {Math.max(...marketData.map(a => a.allocation)) < portfolio.riskSettings.diversificationThreshold ? ' structurally sound and resilient to single-point failure.' : ' showing significant concentration risk in key assets.'}
            </p>
          </div>
      </div>
    </div>
  );
};

export default Analytics;
