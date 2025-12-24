import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Zap,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const ReportsTab = ({
  users,
  vouchers,
  trafficData,
  historicalData,
  stats
}) => {
  const [reportType, setReportType] = useState('traffic');
  const [dateRange, setDateRange] = useState('7d');

  // Generate reports based on selected type and date range
  const reports = useMemo(() => {
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const generateTrafficReport = () => {
      const trafficByUser = users.map(user => {
        const userTraffic = trafficData.find(t => t.userId === user.id);
        const historicalTraffic = historicalData?.traffic?.filter(record =>
          new Date(record.timestamp) >= cutoffDate
        ) || [];

        const totalUsage = historicalTraffic.reduce((sum, record) => sum + record.totalDownload + record.totalUpload, 0);

        return {
          user: user.name,
          mac: user.mac,
          totalDownload: userTraffic?.totalDownload || 0,
          totalUpload: userTraffic?.totalUpload || 0,
          totalUsage,
          downloadLimit: user.downloadLimit || '∞',
          uploadLimit: user.uploadLimit || '∞',
          quota: user.dataQuota || '∞',
          status: user.enabled ? 'Active' : 'Disabled'
        };
      });

      return {
        title: 'Traffic Usage Report',
        period: `${days} days`,
        generated: now.toLocaleString(),
        data: trafficByUser,
        summary: {
          totalUsers: users.length,
          activeUsers: stats.activeUsers,
          totalTraffic: trafficByUser.reduce((sum, user) => sum + user.totalUsage, 0),
          avgUsagePerUser: trafficByUser.length > 0 ?
            trafficByUser.reduce((sum, user) => sum + user.totalUsage, 0) / trafficByUser.length : 0
        }
      };
    };

    const generateUserActivityReport = () => {
      const userActivity = users.map(user => {
        const historicalActivity = historicalData?.users?.filter(record =>
          new Date(record.timestamp) >= cutoffDate
        ) || [];

        const avgActiveUsers = historicalActivity.reduce((sum, record) => sum + record.activeUsers, 0) /
          Math.max(historicalActivity.length, 1);

        const sessions = historicalActivity.length;
        const lastSeen = user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'Never';

        return {
          user: user.name,
          mac: user.mac,
          status: user.enabled ? 'Active' : 'Disabled',
          sessions,
          avgActivity: avgActiveUsers,
          lastSeen,
          joined: user.addedAt ? new Date(user.addedAt).toLocaleDateString() : 'Unknown'
        };
      });

      return {
        title: 'User Activity Report',
        period: `${days} days`,
        generated: now.toLocaleString(),
        data: userActivity,
        summary: {
          totalUsers: users.length,
          activeUsers: stats.activeUsers,
          totalSessions: userActivity.reduce((sum, user) => sum + user.sessions, 0),
          avgSessionsPerUser: userActivity.length > 0 ?
            userActivity.reduce((sum, user) => sum + user.sessions, 0) / userActivity.length : 0
        }
      };
    };

    const generateVoucherReport = () => {
      const voucherStats = vouchers.map(voucher => ({
        code: voucher.code,
        status: voucher.status,
        duration: voucher.duration,
        bandwidth: voucher.bandwidth,
        quota: voucher.quota,
        created: voucher.createdAt ? new Date(voucher.createdAt).toLocaleDateString() : 'Unknown',
        activated: voucher.usedAt ? new Date(voucher.usedAt).toLocaleDateString() : 'Not used',
        expires: voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : 'N/A'
      }));

      const statusCounts = voucherStats.reduce((acc, voucher) => {
        acc[voucher.status] = (acc[voucher.status] || 0) + 1;
        return acc;
      }, {});

      return {
        title: 'Voucher Usage Report',
        period: `${days} days`,
        generated: now.toLocaleString(),
        data: voucherStats,
        summary: {
          totalVouchers: vouchers.length,
          activeVouchers: statusCounts.active || 0,
          usedVouchers: statusCounts.used || 0,
          expiredVouchers: statusCounts.expired || 0,
          unusedVouchers: statusCounts.unused || 0
        }
      };
    };

    const generateBillingReport = () => {
      const billingData = users.map(user => {
        const userTraffic = trafficData.find(t => t.userId === user.id);
        const usage = (userTraffic?.totalDownload || 0) + (userTraffic?.totalUpload || 0);

        // Simple billing calculation (customize based on your pricing)
        const baseRate = 0.1; // per MB
        const overageRate = 0.2; // per MB over quota
        const quotaMB = parseFloat(user.dataQuota) || 0;
        const overageMB = Math.max(0, usage - quotaMB);
        const baseCharge = Math.min(usage, quotaMB) * baseRate;
        const overageCharge = overageMB * overageRate;
        const totalCharge = baseCharge + overageCharge;

        return {
          user: user.name,
          mac: user.mac,
          usage,
          quota: user.dataQuota || '∞',
          overage: overageMB,
          baseCharge: baseCharge.toFixed(2),
          overageCharge: overageCharge.toFixed(2),
          totalCharge: totalCharge.toFixed(2),
          status: user.enabled ? 'Active' : 'Disabled'
        };
      });

      const totalRevenue = billingData.reduce((sum, item) => sum + parseFloat(item.totalCharge), 0);

      return {
        title: 'Billing Report',
        period: `${days} days`,
        generated: now.toLocaleString(),
        data: billingData,
        summary: {
          totalUsers: users.length,
          activeUsers: stats.activeUsers,
          totalRevenue: totalRevenue.toFixed(2),
          avgRevenuePerUser: users.length > 0 ? (totalRevenue / users.length).toFixed(2) : '0.00'
        }
      };
    };

    switch (reportType) {
      case 'traffic':
        return generateTrafficReport();
      case 'activity':
        return generateUserActivityReport();
      case 'vouchers':
        return generateVoucherReport();
      case 'billing':
        return generateBillingReport();
      default:
        return generateTrafficReport();
    }
  }, [reportType, dateRange, users, vouchers, trafficData, historicalData, stats]);

  const exportReport = () => {
    const csvContent = [
      [`${reports.title} - ${reports.period}`],
      [`Generated: ${reports.generated}`],
      [''],
      // Summary section
      ['SUMMARY'],
      Object.entries(reports.summary).map(([key, value]) => `${key}: ${value}`),
      [''],
      // Data headers
      Object.keys(reports.data[0] || {}).join(','),
      // Data rows
      ...reports.data.map(row => Object.values(row).join(','))
    ].flat().join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reports.title.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes) => {
    if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' GB';
    }
    return bytes.toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <div className="flex gap-2">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
          >
            <option value="traffic">Traffic Report</option>
            <option value="activity">User Activity</option>
            <option value="vouchers">Voucher Report</option>
            <option value="billing">Billing Report</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(reports.summary).map(([key, value]) => (
          <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-sm text-blue-200 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      {/* Report Data Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {reports.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Period: {reports.period} | Generated: {reports.generated}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                {reports.data.length > 0 && Object.keys(reports.data[0]).map(header => (
                  <th key={header} className="px-4 py-3 text-left text-sm font-medium text-blue-200 capitalize">
                    {header.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {reports.data.map((row, index) => (
                <tr key={index} className="hover:bg-white/5">
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-sm text-white">
                      {typeof value === 'number' && value > 1000000 ?
                        formatBytes(value) :
                        value
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reports.data.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No data available for the selected period.</p>
          </div>
        )}
      </div>

      {/* Report Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Key Insights
          </h3>
          <div className="space-y-3">
            {reportType === 'traffic' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-300">Highest Usage:</span>
                  <span className="text-white">
                    {reports.data.reduce((max, user) =>
                      user.totalUsage > max.totalUsage ? user : max,
                      reports.data[0] || { user: 'None', totalUsage: 0 }
                    ).user}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Average Usage:</span>
                  <span className="text-white">{formatBytes(reports.summary.avgUsagePerUser)}</span>
                </div>
              </>
            )}
            {reportType === 'activity' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-300">Most Active User:</span>
                  <span className="text-white">
                    {reports.data.reduce((max, user) =>
                      user.sessions > max.sessions ? user : max,
                      reports.data[0] || { user: 'None', sessions: 0 }
                    ).user}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Sessions/User:</span>
                  <span className="text-white">{reports.summary.avgSessionsPerUser.toFixed(1)}</span>
                </div>
              </>
            )}
            {reportType === 'vouchers' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-300">Usage Rate:</span>
                  <span className="text-white">
                    {((reports.summary.usedVouchers / reports.summary.totalVouchers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Active Vouchers:</span>
                  <span className="text-white">{reports.summary.activeVouchers}</span>
                </div>
              </>
            )}
            {reportType === 'billing' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Revenue:</span>
                  <span className="text-white">${reports.summary.totalRevenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Revenue/User:</span>
                  <span className="text-white">${reports.summary.avgRevenuePerUser}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Report Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Report Type:</span>
              <span className="text-white capitalize">{reportType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Time Period:</span>
              <span className="text-white">{reports.period}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Generated:</span>
              <span className="text-white">{new Date(reports.generated).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Records:</span>
              <span className="text-white">{reports.data.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
