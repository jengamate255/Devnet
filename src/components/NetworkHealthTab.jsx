import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  Wifi,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const NetworkHealthTab = ({
  routerConfig,
  historicalData,
  trafficData,
  onFetchHealth
}) => {
  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    uptime: 0,
    temperature: 0,
    interfaces: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock system health data (in real implementation, this would come from router API)
  useEffect(() => {
    if (routerConfig.connected) {
      fetchSystemHealth();
    } else {
      // Generate mock data when not connected
      setSystemHealth({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        uptime: Math.floor(Math.random() * 86400),
        temperature: 35 + Math.random() * 20,
        interfaces: [
          { name: 'ether1', status: 'running', rx: Math.random() * 1000000, tx: Math.random() * 500000 },
          { name: 'ether2', status: 'running', rx: Math.random() * 1000000, tx: Math.random() * 500000 },
          { name: 'wlan1', status: 'running', rx: Math.random() * 500000, tx: Math.random() * 200000 },
        ]
      });
    }
  }, [routerConfig.connected]);

  const fetchSystemHealth = async () => {
    if (!routerConfig.connected) return;

    if (onFetchHealth) {
      try {
        const data = await onFetchHealth();

        // Parse Resource Data
        const cpu = parseFloat(data.resource['cpu-load']) || 0;
        const totalMem = parseFloat(data.resource['total-memory']) || 1;
        const freeMem = parseFloat(data.resource['free-memory']) || 0;
        const memory = ((totalMem - freeMem) / totalMem) * 100;

        // Parse Health Data
        const temp = parseFloat(data.health?.temperature) || 0;

        // Parse Interface Data
        const ifaces = (data.interfaces || []).map(iface => ({
          name: iface.name,
          status: iface.running === 'true' || iface.running === true ? 'running' : 'down',
          rx: parseFloat(iface['rx-byte']) || 0,
          tx: parseFloat(iface['tx-byte']) || 0
        }));

        setSystemHealth({
          cpu,
          memory,
          uptime: data.resource.uptime, // Pass raw string
          temperature: temp,
          interfaces: ifaces
        });
      } catch (error) {
        console.error('Failed to fetch real system health:', error);
      }
    } else {
      // Fallback for demo/dev without onFetchHealth
      setSystemHealth({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        uptime: Math.floor(Math.random() * 86400),
        temperature: 35 + Math.random() * 20,
        interfaces: [
          { name: 'ether1', status: 'running', rx: Math.random() * 1000000, tx: Math.random() * 500000 },
          { name: 'ether2', status: 'running', rx: Math.random() * 1000000, tx: Math.random() * 500000 },
          { name: 'wlan1', status: 'running', rx: Math.random() * 500000, tx: Math.random() * 200000 },
        ]
      });
    }
  };

  const refreshHealth = async () => {
    setIsRefreshing(true);
    await fetchSystemHealth();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatUptime = (input) => {
    if (typeof input === 'string') return input;

    const seconds = input || 0;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB/s`;
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB/s`;
    return `${bytes} B/s`;
  };

  const getHealthStatus = (value, thresholds) => {
    if (value >= thresholds.critical) return { status: 'critical', color: 'text-red-400' };
    if (value >= thresholds.warning) return { status: 'warning', color: 'text-yellow-400' };
    return { status: 'good', color: 'text-green-400' };
  };

  const cpuStatus = getHealthStatus(systemHealth.cpu, { warning: 70, critical: 90 });
  const memoryStatus = getHealthStatus(systemHealth.memory, { warning: 80, critical: 95 });
  const tempStatus = getHealthStatus(systemHealth.temperature, { warning: 50, critical: 65 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Network Health</h2>
        <button
          onClick={refreshHealth}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Connection Status */}
      {!routerConfig.connected && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-300">Router Disconnected</h4>
              <p className="text-yellow-200 text-sm">
                System health monitoring is not available. Connect to router to view real-time metrics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* CPU Usage */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className={`w-6 h-6 ${cpuStatus.color}`} />
            <span className="text-sm font-medium">CPU Usage</span>
          </div>
          <div className="text-2xl font-bold mb-2">{systemHealth.cpu.toFixed(1)}%</div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${cpuStatus.status === 'critical' ? 'bg-red-500' :
                  cpuStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(systemHealth.cpu, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className={`w-6 h-6 ${memoryStatus.color}`} />
            <span className="text-sm font-medium">Memory</span>
          </div>
          <div className="text-2xl font-bold mb-2">{systemHealth.memory.toFixed(1)}%</div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${memoryStatus.status === 'critical' ? 'bg-red-500' :
                  memoryStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(systemHealth.memory, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-medium">Uptime</span>
          </div>
          <div className="text-xl font-bold mb-2">{formatUptime(systemHealth.uptime)}</div>
          <div className="text-xs text-blue-300">System uptime</div>
        </div>

        {/* Temperature */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Activity className={`w-6 h-6 ${tempStatus.color}`} />
            <span className="text-sm font-medium">Temperature</span>
          </div>
          <div className="text-2xl font-bold mb-2">{systemHealth.temperature.toFixed(1)}°C</div>
          <div className="text-xs text-gray-400">System temperature</div>
        </div>
      </div>

      {/* Interface Status */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-blue-400" />
          Network Interfaces
        </h3>
        <div className="space-y-3">
          {systemHealth.interfaces.map((iface, index) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-medium">{iface.name}</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    {iface.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-300">RX:</span>
                  <span className="ml-2 text-white">{formatBytes(iface.rx)}</span>
                </div>
                <div>
                  <span className="text-green-300">TX:</span>
                  <span className="ml-2 text-white">{formatBytes(iface.tx)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health History */}
      {historicalData?.system && historicalData.system.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            System Health History (Last 24h)
          </h3>
          <div className="space-y-2">
            {historicalData.system.slice(-24).map((record, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                <span className="text-sm text-gray-400">
                  {new Date(record.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex gap-4 text-sm">
                  <span className={record.cpuUsage > 70 ? 'text-red-400' : 'text-green-400'}>
                    CPU: {record.cpuUsage.toFixed(1)}%
                  </span>
                  <span className={record.memoryUsage > 80 ? 'text-red-400' : 'text-green-400'}>
                    MEM: {record.memoryUsage.toFixed(1)}%
                  </span>
                  <span className={record.connected ? 'text-green-400' : 'text-red-400'}>
                    {record.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Alerts */}
      {(cpuStatus.status === 'critical' || memoryStatus.status === 'critical' || tempStatus.status === 'critical') && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-300">Critical System Alert</h4>
              <p className="text-red-200 text-sm">
                One or more system metrics are in critical range. Immediate attention required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkHealthTab;
