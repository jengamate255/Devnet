import React from 'react';
import { Ticket, BarChart3, Download, Plus, CheckCircle, Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const VouchersTab = ({
  vouchers,
  setVouchers,
  showAddVoucher,
  setShowAddVoucher,
  newVoucher,
  setNewVoucher,
  generateVouchers,
  voucherTemplates,
  applyVoucherTemplate,
  getFilteredVouchers,
  voucherFilter,
  setVoucherFilter,
  voucherSearch,
  setVoucherSearch,
  selectedVouchers,
  setSelectedVouchers,
  toggleVoucherSelection,
  selectAllVouchers,
  clearSelection,
  bulkActivateVouchers,
  bulkDeleteVouchers,
  activateVoucher,
  deleteVoucher,
  exportVouchers,
  showVoucherStats,
  setShowVoucherStats,
  getVoucherStats,
  formatBytes,
  cleanupExpiredVouchers,
  isLoading
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 sm:p-6 animate-in fade-in duration-300 shadow-2xl shadow-slate-900/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hotspot Vouchers</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowVoucherStats(!showVoucherStats)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Stats
          </button>
          <button
            onClick={exportVouchers}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setShowAddVoucher(!showAddVoucher)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Generate Vouchers
          </button>
        </div>
      </div>

      {/* Voucher Statistics */}
      {showVoucherStats && (
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-purple-500/50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Voucher Statistics
          </h3>
          {(() => {
            const stats = getVoucherStats();
            return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
                  <p className="text-sm text-blue-300">Total</p>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{stats.unused}</p>
                  <p className="text-sm text-yellow-300">Unused</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                  <p className="text-sm text-green-300">Active</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
                  <p className="text-sm text-red-300">Expired</p>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">{stats.totalBandwidth}M</p>
                  <p className="text-sm text-purple-300">Total BW</p>
                </div>
                <div className="bg-indigo-500/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-400">{formatBytes(stats.totalQuota)}</p>
                  <p className="text-sm text-indigo-300">Total Quota</p>
                </div>
              </div>
            );
          })()}
          <div className="flex gap-2 mt-4">
            <button
              onClick={cleanupExpiredVouchers}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition text-sm"
            >
              Cleanup Expired
            </button>
            <button
              onClick={() => setShowVoucherStats(false)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-semibold transition text-sm"
            >
              Close Stats
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search vouchers by code..."
            value={voucherSearch}
            onChange={(e) => setVoucherSearch(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </div>
        <select
          value={voucherFilter}
          onChange={(e) => setVoucherFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
        >
          <option value="all">All Vouchers</option>
          <option value="unused">Unused</option>
          <option value="active">Active</option>
          <option value="trial">Trial Vouchers</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedVouchers.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-300">
              {selectedVouchers.length} voucher{selectedVouchers.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={bulkActivateVouchers}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition text-sm"
              >
                Activate Selected
              </button>
              <button
                onClick={bulkDeleteVouchers}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition text-sm"
              >
                Delete Selected
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-semibold transition text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddVoucher && (
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-blue-500/50">
          <h3 className="text-xl font-bold mb-4">Generate New Vouchers</h3>

          {/* Voucher Templates */}
          <div className="mb-6">
            <label className="block text-blue-200 mb-2 font-semibold">Quick Templates</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {voucherTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyVoucherTemplate(template.id)}
                  className="p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition text-left"
                >
                  <div className="font-semibold text-blue-300">{template.name}</div>
                  <div className="text-sm text-blue-200">
                    {template.duration}h • {template.bandwidth}Mbps • {formatBytes(template.quota)}
                  </div>
                </button>
              ))}
            </div>
          </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Custom Code (leave empty for random)"
              value={newVoucher.code}
              onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <input
              type="number"
              placeholder="Duration (hours)"
              value={newVoucher.duration}
              onChange={(e) => setNewVoucher({ ...newVoucher, duration: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <input
              type="number"
              placeholder="Bandwidth Limit (Mbps)"
              value={newVoucher.bandwidth}
              onChange={(e) => setNewVoucher({ ...newVoucher, bandwidth: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <input
              type="number"
              placeholder="Data Quota (MB)"
              value={newVoucher.quota}
              onChange={(e) => setNewVoucher({ ...newVoucher, quota: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newVoucher.quantity}
              onChange={(e) => setNewVoucher({ ...newVoucher, quantity: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <input
              type="number"
              placeholder="Device Limit"
              value={newVoucher.deviceLimit}
              onChange={(e) => setNewVoucher({ ...newVoucher, deviceLimit: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={generateVouchers}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-700 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center gap-2"
            >
              {isLoading ? <LoadingSpinner /> : <Plus className="w-4 h-4" />}
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
            <button
              onClick={() => setShowAddVoucher(false)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Voucher List Container */}
      <div className="space-y-4">
        <div>
          {getFilteredVouchers().length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={selectedVouchers.length === getFilteredVouchers().length && getFilteredVouchers().length > 0}
                onChange={() => selectedVouchers.length === getFilteredVouchers().length ? clearSelection() : selectAllVouchers()}
                className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <span className="text-blue-200 text-sm">
                {selectedVouchers.length === getFilteredVouchers().length && getFilteredVouchers().length > 0
                  ? 'Deselect All'
                  : `Select All (${getFilteredVouchers().length})`}
              </span>
            </div>
          )}

          <div className="space-y-3">
            {getFilteredVouchers().length === 0 ? (
              <div className="text-center py-12 text-blue-200">
                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>
                  {voucherSearch || voucherFilter !== 'all'
                    ? 'No vouchers match your search criteria.'
                    : 'No vouchers yet. Generate vouchers for guest access!'
                  }
                </p>
              </div>
            ) : (
              getFilteredVouchers().map((voucher) => (
                <div
                  key={voucher.id}
                  className={`bg-slate-800/50 rounded-lg p-4 border ${
                    voucher.status === 'active' ? 'border-green-500/30' :
                    voucher.status === 'expired' ? 'border-red-500/30' :
                    'border-blue-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedVouchers.includes(voucher.id)}
                        onChange={() => toggleVoucherSelection(voucher.id)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold font-mono">{voucher.code}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            voucher.status === 'active' ? 'bg-green-500/20 text-green-300' :
                            voucher.status === 'expired' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {voucher.status.toUpperCase()}
                          </span>
                        </div>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-sm">
                          <div>
                            <p className="text-blue-300">Duration</p>
                            <p className="font-bold">{voucher.duration} hours</p>
                          </div>
                          <div>
                            <p className="text-blue-300">Bandwidth</p>
                            <p className="font-bold">{voucher.bandwidth} Mbps</p>
                          </div>
                          <div>
                            <p className="text-blue-300">Data Quota</p>
                            <p className="font-bold">{formatBytes(voucher.quota)}</p>
                          </div>
                          <div>
                            <p className="text-blue-300">Created</p>
                            <p className="font-bold">{new Date(voucher.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {voucher.status === 'active' && voucher.expiresAt && (
                          <div className="mt-2 text-sm">
                            <p className="text-yellow-300">
                              Expires: {new Date(voucher.expiresAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {voucher.status === 'unused' && (
                          <button
                            onClick={() => activateVoucher(voucher.id)}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition"
                            title="Activate"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteVoucher(voucher.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VouchersTab;
