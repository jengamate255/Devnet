import React from 'react';
import { Users, Plus, Save, CheckCircle, Power, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const UsersTab = ({
  users,
  setUsers,
  showAddUser,
  setShowAddUser,
  newUser,
  setNewUser,
  editingUser,
  setEditingUser,
  addUser,
  deleteUser,
  toggleUserStatus,
  unblockUser,
  startEdit,
  saveEdit,
  applyToRouter,
  routerConfig,
  blockedUsers,
  getTrafficForUser,
  formatBytes,
  isLoading,
  validationErrors = {}
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 sm:p-6 animate-in fade-in duration-300 shadow-2xl shadow-slate-900/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
          <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-2 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add User
                </button>
                <button
                  onClick={applyToRouter}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 transform hover:scale-105 ${
                    routerConfig.connected
                      ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30'
                      : 'bg-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  disabled={!routerConfig.connected}
                >
                  <Save className="w-5 h-5" />
                  Apply to Router
                </button>
              </div>
      </div>

            {showAddUser && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-blue-500/50">
                <h3 className="text-lg lg:text-xl font-bold mb-4">Add New User</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className={`px-4 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-200 ${
                  validationErrors.name ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                }`}
              />
              {validationErrors.name && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="MAC Address (00:00:00:00:00:00)"
                value={newUser.mac}
                onChange={(e) => setNewUser({ ...newUser, mac: e.target.value })}
                className={`px-4 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-200 ${
                  validationErrors.mac ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                }`}
              />
              {validationErrors.mac && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.mac}</p>
              )}
            </div>
            <input
              type="text"
              placeholder="IP Address (optional)"
              value={newUser.ip}
              onChange={(e) => setNewUser({ ...newUser, ip: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
            />
            <input
              type="number"
              placeholder="Download Limit (Mbps)"
              value={newUser.downloadLimit}
              onChange={(e) => setNewUser({ ...newUser, downloadLimit: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
            />
            <input
              type="number"
              placeholder="Upload Limit (Mbps)"
              value={newUser.uploadLimit}
              onChange={(e) => setNewUser({ ...newUser, uploadLimit: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
            />
            <input
              type="number"
              placeholder="Data Quota (MB)"
              value={newUser.dataQuota}
              onChange={(e) => setNewUser({ ...newUser, dataQuota: e.target.value })}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
            />
          </div>
          <div className="flex gap-2 mt-4">
                  <button
                    onClick={addUser}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 transform hover:scale-105 flex items-center gap-2"
                  >
                    {isLoading ? <LoadingSpinner /> : <Plus className="w-4 h-4" />}
                    {isLoading ? 'Adding...' : 'Add User'}
                  </button>
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-slate-500/30 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
        </div>
      )}

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-12 text-blue-200">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No users yet. Add your first user to get started!</p>
          </div>
        ) : (
          users.map((user) => {
            const traffic = getTrafficForUser(user.id);
            const isBlocked = blockedUsers.includes(user.id);
            const quotaPercent = user.dataQuota
              ? ((traffic.totalDownload + traffic.totalUpload) / parseFloat(user.dataQuota) * 100).toFixed(1)
              : 0;

            return (
              <div
                key={user.id}
                className={`bg-slate-800/50 rounded-lg p-4 border ${
                  isBlocked ? 'border-red-500/50' :
                  user.enabled ? 'border-green-500/30' : 'border-red-500/30'
                }`}
              >
                      {editingUser?.id === user.id ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                    />
                    <input
                      type="text"
                      value={editingUser.mac}
                      onChange={(e) => setEditingUser({ ...editingUser, mac: e.target.value })}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                    />
                    <input
                      type="text"
                      value={editingUser.ip}
                      onChange={(e) => setEditingUser({ ...editingUser, ip: e.target.value })}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                    />
                    <input
                      type="number"
                      placeholder="Download (Mbps)"
                      value={editingUser.downloadLimit}
                      onChange={(e) => setEditingUser({ ...editingUser, downloadLimit: e.target.value })}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                    />
                    <input
                      type="number"
                      placeholder="Upload (Mbps)"
                      value={editingUser.uploadLimit}
                      onChange={(e) => setEditingUser({ ...editingUser, uploadLimit: e.target.value })}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                    />
                    <input
                      type="number"
                      placeholder="Data Quota (MB)"
                      value={editingUser.dataQuota}
                      onChange={(e) => setEditingUser({ ...editingUser, dataQuota: e.target.value })}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{user.name}</h3>
                        {isBlocked ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300">
                            Quota Exceeded
                          </span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </span>
                        )}
                      </div>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 text-sm mb-3">
                        <div>
                          <p className="text-blue-300">MAC Address</p>
                          <p className="font-mono text-xs">{user.mac}</p>
                        </div>
                        <div>
                          <p className="text-blue-300">IP Address</p>
                          <p className="font-mono text-xs">{user.ip || 'DHCP'}</p>
                        </div>
                        <div>
                          <p className="text-blue-300">Download</p>
                          <p>{user.downloadLimit || '∞'} {user.downloadLimit && 'Mbps'}</p>
                        </div>
                        <div>
                          <p className="text-blue-300">Upload</p>
                          <p>{user.uploadLimit || '∞'} {user.uploadLimit && 'Mbps'}</p>
                        </div>
                        <div>
                          <p className="text-blue-300">Data Quota</p>
                          <p>{user.dataQuota ? formatBytes(parseFloat(user.dataQuota)) : '∞'}</p>
                        </div>
                      </div>
                      {user.dataQuota && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Usage: {formatBytes(traffic.totalDownload + traffic.totalUpload)} / {formatBytes(parseFloat(user.dataQuota))}</span>
                            <span>{quotaPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                quotaPercent >= 100 ? 'bg-red-500' :
                                quotaPercent >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                          <div className="flex gap-1 sm:gap-2 ml-2 sm:ml-4 flex-wrap">
                      {isBlocked && (
                        <button
                          onClick={() => unblockUser(user.id)}
                          className="p-1.5 sm:p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition"
                          title="Unblock & Reset"
                        >
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-1.5 sm:p-2 rounded-lg transition ${
                          user.enabled
                            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                        }`}
                        title={user.enabled ? 'Disable' : 'Enable'}
                      >
                        <Power className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => startEdit(user)}
                        className="p-1.5 sm:p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 sm:p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UsersTab;
