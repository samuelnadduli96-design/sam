
import React from 'react';
import { AppSection, User } from '../types';

interface SidebarProps {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, user }) => {
  const menuItems = [
    { id: AppSection.DASHBOARD, label: 'Dashboard', icon: 'fas fa-rocket' },
    { id: AppSection.TRADING_BOT, label: 'AI Day Bot', icon: 'fas fa-bolt' },
    { id: AppSection.RISK_CONTROLS, label: 'Risk Shield', icon: 'fas fa-shield-halved' },
    { id: AppSection.WALLET, label: 'Wallet', icon: 'fas fa-wallet' },
    { id: AppSection.ANALYTICS, label: 'Performance', icon: 'fas fa-wave-square' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#050608] border-r border-white/5 p-6 flex flex-col glass-panel z-50">
      <div className="flex flex-col mb-12">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <i className="fas fa-brain text-white text-xl animate-pulse"></i>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white italic">CONSCIOUS</span>
        </div>
        <div className="flex items-center space-x-2 px-1">
          <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Nonstop Flawless Ops</span>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 relative group ${
              activeSection === item.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {activeSection === item.id && (
              <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full"></div>
            )}
            <i className={`${item.icon} text-lg group-hover:scale-110 transition-transform`}></i>
            <span className="font-black uppercase text-[10px] tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">System Health</p>
          <div className="flex items-center space-x-2">
             <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[99.9%]"></div>
             </div>
             <span className="text-[8px] font-black text-green-500">OPTIMAL</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-lg">
            {user.fullName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user.fullName}</p>
            <p className="text-[10px] text-gray-600 font-bold truncate tracking-widest uppercase">Node Ident: Live</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
