import React from 'react';
import { RiskSettings, RiskTolerance } from '../types';

interface RiskControlsProps {
  settings: RiskSettings;
  onUpdate: (settings: Partial<RiskSettings>) => void;
  onWipe?: () => void;
}

const RiskControls: React.FC<RiskControlsProps> = ({ settings, onUpdate, onWipe }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stop Loss Configuration */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <i className="fas fa-hand-dots"></i>
            </div>
            <h3 className="text-xl font-bold">Smart Stop-Loss</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Automatically exit positions if an asset's value drops below your defined threshold to preserve capital.
          </p>
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase">Global Stop-Loss %</label>
            <div className="flex items-center space-x-4">
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={settings.stopLossPercentage}
                onChange={(e) => onUpdate({ stopLossPercentage: parseInt(e.target.value) })}
                className="flex-1 accent-blue-600"
              />
              <span className="w-12 text-center font-mono font-bold bg-gray-800 py-1 rounded-lg">
                {settings.stopLossPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Risk Tolerance Profile */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <i className="fas fa-sliders"></i>
            </div>
            <h3 className="text-xl font-bold">Investment Profile</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Define your appetite for volatility. Our AI adjusts its trading aggression based on this profile.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(RiskTolerance).map((tolerance) => (
              <button
                key={tolerance}
                onClick={() => onUpdate({ riskTolerance: tolerance })}
                className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                  settings.riskTolerance === tolerance 
                    ? 'bg-purple-600 border-purple-400 text-white neon-glow' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {tolerance}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Auto Rebalancing */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                <i className="fas fa-arrows-spin"></i>
              </div>
              <h3 className="text-xl font-bold">Auto-Rebalancing</h3>
            </div>
            <button 
              onClick={() => onUpdate({ autoRebalance: !settings.autoRebalance })}
              className={`w-14 h-8 rounded-full transition-all relative ${settings.autoRebalance ? 'bg-blue-600' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.autoRebalance ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            When enabled, the bot periodically adjusts asset allocations to match your target risk profile.
          </p>
          <div className="p-4 rounded-xl bg-gray-800 text-xs text-gray-400">
            <i className="fas fa-clock mr-2"></i> Next scheduled rebalance in: 42m 12s
          </div>
        </div>

        {/* Security / System Management */}
        <div className="glass-panel p-8 rounded-3xl border border-red-500/10 bg-red-500/[0.02]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-500/20 text-red-500 rounded-lg">
              <i className="fas fa-microchip"></i>
            </div>
            <h3 className="text-xl font-bold">Terminal Integrity</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Perform a complete node reset. This wipes all local encryption, transaction history, and ownership binding.
          </p>
          <button 
            onClick={onWipe}
            className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-500 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
          >
            Wipe Node & Reset Terminal
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskControls;