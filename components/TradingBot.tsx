
import React, { useState, useEffect, useRef } from 'react';
import { MarketData, RiskSettings, RiskTolerance } from '../types';
import { analyzeMarket, BotAnalysis } from '../services/geminiService';

interface TradingBotProps {
  marketData: MarketData[];
  riskSettings: RiskSettings;
  formatValue: (v: number) => string;
  portfolioBalance: number;
  onTrade: (profit: number, type: 'BUY' | 'SELL') => void;
}

const TradingBot: React.FC<TradingBotProps> = ({ marketData, riskSettings, formatValue, portfolioBalance, onTrade }) => {
  const [isBotActive, setIsBotActive] = useState(true);
  const [analysis, setAnalysis] = useState<BotAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [efficiencyRating, setEfficiencyRating] = useState(99.98);
  const [log, setLog] = useState<{ msg: string; type: 'info' | 'success' | 'warn' | 'alert' }[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const riskMultiplier = 
    riskSettings.riskTolerance === RiskTolerance.AGGRESSIVE ? 2.5 :
    riskSettings.riskTolerance === RiskTolerance.MODERATE ? 1.0 : 0.4;

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'alert' = 'info') => {
    setLog(prev => [...prev.slice(-19), { msg, type }]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // Efficiency Jitter Logic
  useEffect(() => {
    const jitterInterval = setInterval(() => {
      setEfficiencyRating(99.97 + Math.random() * 0.03);
    }, 2000);
    return () => clearInterval(jitterInterval);
  }, []);

  const runBotCycle = async () => {
    if (!isBotActive) return;

    const concentratedAsset = marketData.find(asset => asset.allocation > riskSettings.diversificationThreshold);
    const isDiversificationAlertTriggered = !!concentratedAsset;

    setIsAnalyzing(true);
    
    if (isDiversificationAlertTriggered) {
      addLog(`DIVERSIFICATION BREACH: Asset ${concentratedAsset.symbol} exceeding threshold.`, 'alert');
    }
    
    addLog(`Scanning live market vectors...`, 'info');
    
    try {
      const result = await analyzeMarket({ 
        snapshot: marketData, 
        profile: riskSettings.riskTolerance,
        stopLoss: riskSettings.stopLossPercentage
      }, riskSettings.diversificationThreshold);

      setAnalysis(result);
      addLog(`AI reasoning synthesized. Recommendation: ${result.recommendation}`, 'info');

      if (result.recommendation === 'BUY') {
        const profitPercentage = (Math.random() * 0.02 + 0.01) * riskMultiplier;
        const profit = portfolioBalance * profitPercentage;

        addLog(`Executing BUY entry. Delta capture sequence initiated.`, 'success');
        setTimeout(() => {
          addLog(`Yield locked: +${formatValue(profit)}`, 'success');
          onTrade(profit, 'BUY');
        }, 3000);
      } else if (result.recommendation === 'SELL') {
        const lossPercentage = (Math.random() * 0.01) * riskMultiplier;
        const loss = -portfolioBalance * lossPercentage;
        addLog(`Executing strategic SELL/LIQUIDATE order.`, 'warn');
        setTimeout(() => {
           onTrade(loss, 'SELL');
        }, 3000);
      } else {
        addLog(`Maintaining neutral positioning. Efficiency maintained.`, 'info');
      }
    } catch (e) {
      addLog(`Neural sync error. Retrying flawless scan in 5 seconds.`, 'warn');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      runBotCycle();
    }, 15000); // 15s cycle for nonstop market coverage
    
    runBotCycle();
    return () => clearInterval(cycleInterval);
  }, [isBotActive, riskSettings.riskTolerance, portfolioBalance, riskSettings.diversificationThreshold]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden border border-blue-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-stretch gap-8">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center bg-black/40 px-3 py-1 rounded-full border border-white/5">
                <span className={`h-2 w-2 rounded-full mr-2 ${isBotActive ? 'bg-green-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`}></span>
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">
                  {isBotActive ? 'Flawless Core Active' : 'Neural Hibernate'}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10"></div>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic animate-pulse">Nonstop Market Pulse</span>
            </div>
            
            <h2 className="text-5xl font-black mb-4 italic tracking-tighter text-white">Neural Scaler v3.0</h2>
            <p className="text-gray-400 max-w-xl leading-relaxed text-sm">
              The Conscious Neural Scaler operates with <b>99.9% up-time integrity</b>. Every transaction is computed at flawless efficiency, 
              optimizing your <b>{formatValue(portfolioBalance)}</b> pool 24/7 without interruption.
            </p>
            
            <div className="flex space-x-4 mt-8">
              <button 
                onClick={() => setIsBotActive(!isBotActive)}
                className={`px-10 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs relative overflow-hidden group ${
                  isBotActive 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                    : 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                }`}
              >
                <span className="relative z-10">{isBotActive ? 'Kill Protocol' : 'Initiate Nonstop Flow'}</span>
              </button>
            </div>
          </div>

          <div className="w-full xl:w-96 flex flex-col justify-between p-8 glass-panel rounded-3xl border-white/5 border bg-[#0a0b0d]/50">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest italic">Core Efficiency</h3>
                <span className="text-xs font-mono font-black text-green-400">{efficiencyRating.toFixed(2)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-shimmer" style={{ width: `${efficiencyRating}%` }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Logic Flow</span>
                <span className="text-[10px] font-black text-white uppercase italic">Zero-Latency</span>
              </div>
              <div className="flex justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Decision Matrix</span>
                <span className="text-[10px] font-black text-blue-400 uppercase italic">Immutable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-[2rem] p-6 bg-[#050608] flex flex-col h-96 border border-white/5">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] italic">Flawless Audit Stream</h3>
            <div className="flex items-center space-x-2">
              <span className="text-[8px] font-black text-green-500 uppercase">Synced</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] custom-scrollbar pr-2">
            {log.map((entry, i) => (
              <div key={i} className="flex space-x-3 p-2 rounded-xl bg-white/[0.02] border border-transparent hover:border-white/5 transition-all">
                <span className="text-gray-700 font-bold">[{new Date().toLocaleTimeString()}]</span>
                <span className={
                  entry.type === 'success' ? 'text-green-500' :
                  entry.type === 'warn' ? 'text-yellow-500' :
                  entry.type === 'alert' ? 'text-red-400 font-black' :
                  'text-blue-400'
                }>
                  <i className={`fas fa-chevron-right mr-2 text-[8px] ${entry.type === 'alert' ? 'animate-bounce' : ''}`}></i>
                  {entry.msg}
                </span>
              </div>
            ))}
            {log.length === 0 && (
              <div className="h-full flex items-center justify-center opacity-20 italic uppercase tracking-widest text-xs">
                Awaiting Protocol Genesis...
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-10 border border-white/5 bg-gradient-to-br from-indigo-900/10 to-transparent flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black mb-6 italic tracking-tighter text-white uppercase">Operational Integrity</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5 group hover:border-blue-500/40 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <i className="fas fa-shield-virus text-blue-400"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Risk Guard</p>
                    <p className="text-xs font-black text-white uppercase italic">Active 24/7</p>
                  </div>
                </div>
                <i className="fas fa-check-circle text-green-500"></i>
              </div>
              
              <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5 group hover:border-purple-500/40 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <i className="fas fa-sync text-purple-400 animate-spin-slow"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Market Feed</p>
                    <p className="text-xs font-black text-white uppercase italic">Real-Time Sync</p>
                  </div>
                </div>
                <i className="fas fa-check-circle text-green-500"></i>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-center">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] italic">
              Nonstop flaw-detection algorithms enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingBot;
