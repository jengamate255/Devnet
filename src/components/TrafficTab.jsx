import React from 'react';
import { BarChart3, Download, Upload } from 'lucide-react';

const TrafficTab = ({ trafficData, users, formatBytes }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 sm:p-6 animate-in fade-in duration-300 shadow-2xl shadow-slate-900/50">
      <h2 className="text-2xl font-bold mb-6">Real-Time Traffic Monitoring</h2>

      {trafficData.length === 0 ? (
        <div className="text-center py-12 text-blue-200">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No traffic data yet. Traffic will appear when users are active.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trafficData.map((traffic) => {
            const user = users.find(u => u.id === traffic.userId);
            if (!user) return null;

            return (
              <div key={traffic.userId} className="bg-slate-800/50 rounded-lg p-4 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{traffic.userName}</h3>
                    <p className="text-sm text-blue-300">{user.mac}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-300">Total Usage</p>
                    <p className="text-2xl font-bold">
                      {formatBytes(traffic.totalDownload + traffic.totalUpload)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold">Download</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">{formatBytes(traffic.totalDownload)}</p>
                    <p className="text-sm text-blue-300">
                      Current: {traffic.currentDownload.toFixed(2)} MB/s
                    </p>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-5 h-5 text-green-400" />
                      <span className="font-semibold">Upload</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">{formatBytes(traffic.totalUpload)}</p>
                    <p className="text-sm text-green-300">
                      Current: {traffic.currentUpload.toFixed(2)} MB/s
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrafficTab;
