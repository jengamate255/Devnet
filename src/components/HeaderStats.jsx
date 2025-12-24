import React from 'react';
import { Wifi, Users, Activity, Ban, Zap, Ticket, AlertTriangle, RefreshCw } from 'lucide-react';

const HeaderStats = ({ stats, alerts = [], onSync, isSyncing, isConnected }) => {
  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Wifi className={`w-10 h-10 ${isConnected ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Devnet
              </h1>
              {alerts.length > 0 && (
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-1">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm font-medium">{alerts.length} Alert{alerts.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <p className="text-blue-200 text-sm lg:text-base">Network Management System</p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 ${isConnected
                ? 'bg-green-500/10 border-green-500/50 text-green-400'
                : 'bg-red-500/10 border-red-500/50 text-red-400'
              }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              {isConnected ? 'LIVE' : 'DISCONNECTED'}
            </div>

            <button
              onClick={onSync}
              disabled={isSyncing || !isConnected}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform active:scale-95 ${isSyncing
                  ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                  : isConnected
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed opactiy-50'
                }`}
              title="Sync data from router"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-blue-200 text-xs lg:text-sm truncate">Total Users</p>
              <p className="text-2xl lg:text-3xl font-bold transition-all duration-300">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 lg:w-10 lg:h-10 text-blue-400 flex-shrink-0 ml-2 transition-transform duration-300 hover:scale-110" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-green-500/10 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-green-200 text-xs lg:text-sm truncate">Active</p>
              <p className="text-2xl lg:text-3xl font-bold transition-all duration-300">{stats.activeUsers}</p>
            </div>
            <Activity className="w-8 h-8 lg:w-10 lg:h-10 text-green-400 flex-shrink-0 ml-2 transition-transform duration-300 hover:scale-110" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-red-500/10 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-red-200 text-xs lg:text-sm truncate">Blocked</p>
              <p className="text-2xl lg:text-3xl font-bold transition-all duration-300">{stats.blockedUsers}</p>
            </div>
            <Ban className="w-8 h-8 lg:w-10 lg:h-10 text-red-400 flex-shrink-0 ml-2 transition-transform duration-300 hover:scale-110" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-purple-200 text-xs lg:text-sm truncate">Bandwidth</p>
              <p className="text-2xl lg:text-3xl font-bold transition-all duration-300">{stats.totalBandwidth}M</p>
            </div>
            <Zap className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400 flex-shrink-0 ml-2 transition-transform duration-300 hover:scale-110" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-yellow-500/10 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-yellow-200 text-xs lg:text-sm truncate">Vouchers</p>
              <p className="text-2xl lg:text-3xl font-bold transition-all duration-300">{stats.activeVouchers}</p>
            </div>
            <Ticket className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-400 flex-shrink-0 ml-2 transition-transform duration-300 hover:scale-110" />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderStats;
