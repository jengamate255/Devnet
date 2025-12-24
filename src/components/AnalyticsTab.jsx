import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, Zap, Clock, AlertTriangle, Activity } from 'lucide-react';

const AnalyticsTab = ({
  users,
  vouchers,
  trafficData,
  blockedUsers,
  routerConfig,
  stats,
  historicalData
}) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [analyticsData, setAnalyticsData] = useState({
    trafficOverTime: [],
    userActivity: [],
    voucherUsage: [],
    bandwidthDistribution: []
  });

  // Generate mock analytics data (in real implementation, this would come from stored historical data)
  useEffect(() => {
    generateAnalyticsData();
  }, [users, vouchers, trafficData, timeRange]);

  const generateAnalyticsData = () => {
    const now = new Date();
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720; // hours

    // Use real historical traffic data if available
    let trafficOverTime = [];
    if (historicalData?.traffic && historicalData.traffic.length > 0) {
      // Filter data based on time range
      const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
      const filteredTraffic = historicalData.traffic.filter(record =>
        new Date(record.timestamp) >= cutoffTime
      );

      trafficOverTime = filteredTraffic.map(record => ({
        time: new Date(record.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        download: Math.round(record.totalDownload || 0),
        upload: Math.round(record.totalUpload || 0),
        total: Math.round((record.totalDownload || 0) + (record.totalUpload || 0))
      }));
    } else {
      // Fallback to mock data if no historical data
      for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const download = Math.random() * 100 + (trafficData.reduce((sum, t) => sum + t.totalDownload, 0) / trafficData.length || 50);
        const upload = Math.random() * 50 + (trafficData.reduce((sum, t) => sum + t.totalUpload, 0) / trafficData.length || 25);

        trafficOverTime.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          download: Math.round(download),
          upload: Math.round(upload),
          total: Math.round(download + upload)
        });
      }
    }

    // User activity data
    const userActivity = [
      { name: 'Active Users', value: stats.activeUsers, color: '#10b981' },
      { name: 'Inactive Users', value: users.length - stats.activeUsers, color: '#6b7280' },
      { name: 'Blocked Users', value: stats.blockedUsers, color: '#ef4444' }
    ];

    // Voucher usage data
    const voucherStatus = vouchers.reduce((acc, voucher) => {
      acc[voucher.status] = (acc[voucher.status] || 0) + 1;
      return acc;
    }, {});

    const voucherUsage = [
      { name: 'Active', value: voucherStatus.active || 0, color: '#3b82f6' },
      { name: 'Used', value: voucherStatus.used || 0, color: '#10b981' },
      { name: 'Expired', value: voucherStatus.expired || 0, color: '#ef4444' },
      { name: 'Unused', value: voucherStatus.unused || 0, color: '#f59e0b' }
    ];

    // Bandwidth distribution (mock data based on user limits)
    const bandwidthDistribution = users.slice(0, 10).map((user, index) => ({
      user: user.name.substring(0, 8),
      download: parseFloat(user.downloadLimit) || Math.random() * 50 + 10,
      upload: parseFloat(user.uploadLimit) || Math.random() * 25 + 5
    }));

    setAnalyticsData({
      trafficOverTime,
      userActivity,
      voucherUsage,
      bandwidthDistribution
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.toLowerCase().includes('download') || entry.name.toLowerCase().includes('upload') ? ' Mbps' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatBytes = (bytes) => {
    if (bytes >= 1024) {
      return (bytes / 1024).toFixed(1) + ' GB';
    }
    return bytes.toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-blue-200 text-sm">Total Traffic</p>
              <p className="text-2xl font-bold text-white">
                {formatBytes(trafficData.reduce((sum, t) => sum + t.totalDownload + t.totalUpload, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-green-200 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-purple-200 text-sm">Avg Bandwidth</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalBandwidth > 0 ? `${(stats.totalBandwidth / users.length).toFixed(1)}M` : '0M'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-yellow-200 text-sm">Active Vouchers</p>
              <p className="text-2xl font-bold text-white">{stats.activeVouchers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Over Time */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Network Traffic Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.trafficOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="download"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Download (Mbps)"
              />
              <Line
                type="monotone"
                dataKey="upload"
                stroke="#10b981"
                strokeWidth={2}
                name="Upload (Mbps)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity Distribution */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            User Activity Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.userActivity}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {analyticsData.userActivity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Voucher Usage Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Voucher Usage Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.voucherUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {analyticsData.voucherUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bandwidth Distribution by User */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Bandwidth Distribution by User
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.bandwidthDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="user" type="category" stroke="#9ca3af" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="download" fill="#3b82f6" name="Download (Mbps)" />
              <Bar dataKey="upload" fill="#10b981" name="Upload (Mbps)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts and Warnings */}
      {blockedUsers.length > 0 && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-300">Attention Required</h4>
              <p className="text-red-200 text-sm">
                {blockedUsers.length} user(s) are currently blocked due to quota exceeded or other issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {!routerConfig.connected && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-300">Router Disconnected</h4>
              <p className="text-yellow-200 text-sm">
                Real-time data collection is not available. Connect to router for live analytics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
