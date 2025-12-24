import React from 'react';
import { Shield, AlertCircle, CheckCircle, Ban } from 'lucide-react';

const BlockedUsersTab = ({ blockedUsers, users, unblockUser, formatBytes, getTrafficForUser }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 sm:p-6 animate-in fade-in duration-300 shadow-2xl shadow-slate-900/50">
      <h2 className="text-2xl font-bold mb-6">Auto-Blocked Users</h2>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-300 mb-1">Automatic Quota Blocking</h3>
            <p className="text-sm text-yellow-100">
              Users are automatically blocked when they exceed their data quota.
              Set data quotas in the user settings. Blocked users will have their
              internet access restricted until manually unblocked and quota reset.
            </p>
          </div>
        </div>
      </div>

      {blockedUsers.length === 0 ? (
        <div className="text-center py-12 text-blue-200">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No blocked users. Users will appear here when they exceed their quota.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((userId) => {
            const user = users.find(u => u.id === userId);
            if (!user) return null;

            const traffic = getTrafficForUser(userId);
            const totalUsed = traffic.totalDownload + traffic.totalUpload;

            return (
              <div key={userId} className="bg-red-900/20 rounded-lg p-4 border border-red-500/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Ban className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl font-bold">{user.name}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300">
                        BLOCKED
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-red-300">MAC Address</p>
                        <p className="font-mono">{user.mac}</p>
                      </div>
                      <div>
                        <p className="text-red-300">Quota Limit</p>
                        <p className="font-bold">{formatBytes(parseFloat(user.dataQuota))}</p>
                      </div>
                      <div>
                        <p className="text-red-300">Used</p>
                        <p className="font-bold text-red-400">{formatBytes(totalUsed)}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => unblockUser(userId)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition font-semibold flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Unblock & Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlockedUsersTab;
