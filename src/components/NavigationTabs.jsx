import React from 'react';
import { Globe, Users, BarChart3, Ticket, Shield, Settings, TrendingUp, Activity, FileText } from 'lucide-react';

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'portal', label: 'Captive Portal', icon: Globe },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'traffic', label: 'Traffic', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'vouchers', label: 'Vouchers', icon: Ticket },
    { id: 'blocked', label: 'Blocked', icon: Shield },
    { id: 'router', label: 'Router', icon: Settings },
  ];

  return (
    <div className="mb-6">
      {/* Mobile dropdown */}
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 text-white"
        >
          {tabs.map(({ id, label }) => (
            <option key={id} value={id} className="bg-slate-800 text-white">
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop tabs */}
      <div className="hidden md:flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`px-4 lg:px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-sm lg:text-base transform hover:scale-105 ${
            activeTab === id
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white/10 text-blue-200 hover:bg-white/20 hover:shadow-md'
          }`}
        >
            <Icon className="w-4 h-4 lg:w-5 lg:h-5 inline mr-2" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationTabs;
