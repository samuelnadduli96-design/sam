
import React, { useState, useEffect, useMemo } from 'react';
import { Portfolio, MarketData, Transaction } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface DashboardProps {
  portfolio: Portfolio;
  marketData: MarketData[];
  transactions: Transaction[];
  formatValue: (v: number) => string;
  setActiveSection?: (section: any) => void;
}

const CustomTradeDot = (props: any) => {
  const { cx, cy, payload } = props;

  if (payload.trade) {
    const isBuy = payload.trade.description.toLowerCase().includes('buy');
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill={isBuy ? "#10b981" : "#ef4444"} stroke="#fff" strokeWidth={2} />
        <text x={cx} y={cy - 12} textAnchor="middle" fill={isBuy ? "#10b981" : "#ef4444"} fontSize={10} fontWeight="900" className="italic uppercase">
          {isBuy ? 'AI BUY' : 'AI SELL'}
        </text>
      </g>
    );
  }

  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ portfolio, marketData, transactions, formatValue, setActiveSection }) => {
  const [displayBalance, setDisplayBalance] = useState(portfolio.balance);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    setDisplayBalance(portfolio.balance);
  }, [portfolio.balance]);

  // Uptime Counter Logic
  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate chart data with trade markers mapped to points
  const chartData = useMemo(() => {
    const basePoints = [
      { name: '0h', value: portfolio.balance * 0.4 },
      { name: '4h', value: portfolio.balance * 0.55 },
      { name: '8h', value: portfolio.balance * 0.72 },
      { name: '12h', value: portfolio.balance * 0.85 },
      { name: '16h', value: portfolio.balance * 0.94 },
      { name: '20h', value: portfolio.balance * 1.0 },
    ];

    // Overlay real trades from transactions onto the last few points for visualization
    const tradeTxs = transactions.filter(t => t.type === 'TRADE').slice(0, 3);
    
    return basePoints.map((point, index) => {
      // Map up to 3 most recent trades to the last 3 data points
      if (index >= basePoints.length - 3 && tradeTxs[basePoints.length - 1 - index]) {
        return {
          ...point,
          trade: tradeTxs[basePoints.length - 1 - index]
        };
      }
      return point;
    });
  }, [portfolio.balance, transactions]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-[2.5rem] border border-blue-500/20 bg-blue-600/5 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <i className="fas fa-bolt text-4xl"></i>
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Core Expansion</p>
          <p className="text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
            {formatValue(displayBalance)}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
             <span className="text-[9px] font-black text-green-500 uppercase italic">Flawless Growth</span>
             {setActiveSection && (
               <button 
                 onClick={() => setActiveSection('WALLET')}
                 className="px-4 py-1.5 bg-white text-black text-[9px] font-black uppercase rounded-lg hover:bg-blue-500 hover:text-white transition-all italic tracking-tighter"
               >
                 Instant Withdrawal
               </button>
             )}
          </div>
        </div>
        
        <div className="glass-panel p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-all flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">AI Delta Harvest</p>
            <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{formatValue(portfolio.totalProfit)}</p>
          </div>
          <p className="mt-6 text-[9px] text-blue-400 font-black uppercase tracking-widest italic">Nonstop Compounding</p>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-indigo-900/10 to-transparent">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Uptime Integrity</p>
          <p className="text-4xl font-black text-white font-mono tracking-tighter">{formatUptime(uptime)}</p>
          <div className="mt-6 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
            <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest italic">Operational Excellence</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-panel p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-pulse opacity-40"></div>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Neural Trajectory</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Uninterrupted growth vector with AI Trade markers</p>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-2xl border border-white/5">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-2">High Efficiency</span>
              <div className="h-6 w-px bg-white/10"></div>
              <i className="fas fa-broadcast-tower text-blue-500 text-xs px-2 animate-pulse"></i>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#050608', border: '1px solid #ffffff10', borderRadius: '16px' }}
                   labelStyle={{ display: 'none' }}
                   itemStyle={{ color: '#3b82f6', fontWeight: '900', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fill="url(#colorVal)" 
                  animationDuration={1000}
                  dot={<CustomTradeDot />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600/5 blur-[80px]"></div>
          <h2 className="text-2xl font-black text-white mb-8 tracking-tighter italic uppercase">Node Integrity</h2>
          <div className="space-y-6">
            {marketData.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center space-x-4">
                   <div className="w-14 h-14 rounded-2xl bg-[#0a0b0d] border border-white/5 flex items-center justify-center font-black text-blue-500 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all duration-500 shadow-inner">
                     {asset.symbol[0]}
                   </div>
                   <div>
                     <p className="font-black text-white text-base tracking-tight">{asset.symbol}</p>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">{asset.allocation}% Allocation</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-white italic tracking-tighter">
                    {formatValue(asset.price / 1000).split('.')[0]}
                  </p>
                  <p className={`text-[10px] font-black ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Node Sync: FLUID</p>
          </div>
        </div>
      </div>

      <div className="p-10 glass-panel rounded-[3rem] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-br from-blue-600/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="h-full w-px bg-white absolute left-1/4 animate-scan"></div>
          <div className="h-full w-px bg-white absolute left-2/4 animate-scan" style={{animationDelay: '1s'}}></div>
          <div className="h-full w-px bg-white absolute left-3/4 animate-scan" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)]">
            <i className="fas fa-infinity text-white text-3xl animate-pulse"></i>
          </div>
          <div>
            <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Nonstop Flawless Protocol</h4>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-2 max-w-lg">
              Conscious is architected for zero-downtime capital expansion. Your liquidity is always accessible, always growing.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="px-8 py-4 bg-black/40 rounded-2xl border border-white/5 text-center min-w-[140px]">
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Stability</p>
            <p className="text-sm font-black text-green-400 font-mono">100.0%</p>
          </div>
          <div className="px-8 py-4 bg-black/40 rounded-2xl border border-white/5 text-center min-w-[140px]">
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Exit Liquidity</p>
            <p className="text-sm font-black text-blue-400 font-mono uppercase italic">UNLIMITED</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
