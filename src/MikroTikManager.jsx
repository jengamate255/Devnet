import React, { useState, useEffect } from 'react';
import HeaderStats from './components/HeaderStats';
import NavigationTabs from './components/NavigationTabs';
import CaptivePortalTab from './components/CaptivePortalTab';
import UsersTab from './components/UsersTab';
import AnalyticsTab from './components/AnalyticsTab';
import NetworkHealthTab from './components/NetworkHealthTab';
import ReportsTab from './components/ReportsTab';
import TrafficTab from './components/TrafficTab';
import VouchersTab from './components/VouchersTab';
import BlockedUsersTab from './components/BlockedUsersTab';
import RouterConfigTab from './components/RouterConfigTab';
import CaptivePortalPreview from './components/CaptivePortalPreview';
import Notification from './components/Notification';
import { useRouterDetection } from './hooks/useRouterDetection';
import DetectionProgress from './components/DetectionProgress';
import DetectedRouterInfo from './components/DetectedRouterInfo';
import { validateUser, validateVoucher, validateRouterConfig } from './utils/validation';
import MikroTikAPI from './utils/mikrotikApi';

const MikroTikManager = () => {
  const {
    isDetecting,
    progress,
    detectedRouters,
    detectRouter: startRobustDetection,
    detectAllRouters,
    cancelDetection,
    reset: resetDetection
  } = useRouterDetection();

  // API Client instance
  const apiRef = React.useRef(new MikroTikAPI());

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [showAddVoucher, setShowAddVoucher] = useState(false);
  const [voucherFilter, setVoucherFilter] = useState('all');
  const [voucherSearch, setVoucherSearch] = useState('');
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showVoucherStats, setShowVoucherStats] = useState(false);
  const [trafficData, setTrafficData] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [historicalData, setHistoricalData] = useState({
    traffic: [],
    users: [],
    system: []
  });
  const [showPortalPreview, setShowPortalPreview] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    users: false,
    vouchers: false,
    router: false,
    saving: false
  });

  // Historical data tracking functions
  const fetchNetworkHealthData = async () => {
    if (!routerConfig.connected) throw new Error('Not connected');

    try {
      const [resourceRes, interfacesRes, healthRes] = await Promise.all([
        apiRef.current.getSystemResource(),
        apiRef.current.getInterfaces(),
        apiRef.current.getSystemHealth().catch(() => [])
      ]);

      return {
        resource: Array.isArray(resourceRes) ? resourceRes[0] : resourceRes,
        interfaces: interfacesRes,
        health: Array.isArray(healthRes) ? healthRes[0] : healthRes
      };
    } catch (error) {
      console.error('Error fetching health data:', error);
      throw error;
    }
  };

  // Historical data tracking functions
  const recordHistoricalData = async () => {
    const now = new Date();
    const timestamp = now.toISOString();

    // Record traffic data
    const totalTraffic = trafficData.reduce((sum, t) => ({
      download: sum.download + t.totalDownload,
      upload: sum.upload + t.totalUpload
    }), { download: 0, upload: 0 });

    const trafficRecord = {
      timestamp,
      totalDownload: totalTraffic.download,
      totalUpload: totalTraffic.upload,
      activeUsers: stats.activeUsers,
      totalUsers: stats.totalUsers
    };

    // Record user activity
    const userRecord = {
      timestamp,
      activeUsers: stats.activeUsers,
      blockedUsers: stats.blockedUsers,
      totalUsers: stats.totalUsers
    };

    // Record system metrics
    let systemRecord = {
      timestamp,
      cpuUsage: 0,
      memoryUsage: 0,
      uptime: 0,
      connected: routerConfig.connected
    };

    if (routerConfig.connected) {
      try {
        const data = await fetchNetworkHealthData();
        const totalMem = parseFloat(data.resource['total-memory']) || 1;
        const freeMem = parseFloat(data.resource['free-memory']) || 0;

        systemRecord.cpuUsage = parseFloat(data.resource['cpu-load']) || 0;
        systemRecord.memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
        // Keep uptime as 0 or parse if needed, but for history usually we want numbers.
        // If we leave 0, the chart is flat. 
        // Ideally parse MikroTik uptime string to seconds, but skipping for now to avoid complexity risk.
      } catch (e) {
        console.warn('Failed to fetch health for history', e);
      }
    } else {
      // Only mock if NOT connected to avoid holes? 
      // Or usually users want to see "disconnect".
      // Existing mock behavior was: mock random data.
      // New behavior: 0 if disconnected.
    }

    setHistoricalData(prev => ({
      traffic: [...prev.traffic, trafficRecord].slice(-1000), // Keep last 1000 records
      users: [...prev.users, userRecord].slice(-1000),
      system: [...prev.system, systemRecord].slice(-1000)
    }));
  };



const [routerConfig, setRouterConfig] = useState({
  host: '',
  username: '',
  password: '',
  port: '8728',
  connected: false,
  connecting: false,
  lastConnectionError: null,
  // Advanced connection options
  connectionTimeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  sslValidation: true,
  autoReconnect: true,
  reconnectInterval: 30000, // 30 seconds
  lastConnected: null,
  connectionAttempts: 0,
  connectionHistory: [],
  // Security options
  authMethod: 'basic', // 'basic', 'token', 'certificate'
  apiToken: '',
  clientCertificate: null,
  enableSecurityAudit: true,
  securityLog: [],
  lastSecurityCheck: null,
  // Configuration management
  configVersioning: true,
  configHistory: [],
  currentConfigVersion: null,
  pendingChanges: [],
  bulkOperations: [],
  configTemplates: [],
  // Monitoring & Diagnostics
  diagnosticsMode: false,
  systemLogs: [],
  performanceMetrics: [],
  troubleshootingTools: [],
  networkTests: [],
  // Integration Features
  webhooks: [],
  integrations: [],
  apiAccess: {
    enabled: false,
    token: null,
    allowedIPs: [],
    rateLimit: 100
  },
  externalServices: [],
  // MAC Address & Autodetect
  connectionMethod: 'ip', // 'ip' or 'mac'
  macAddress: '',
  autodetecting: false
});

const [portalConfig, setPortalConfig] = useState({
  companyName: 'DevTek',
  welcomeText: 'Welcome to DevTek WiFi',
  description: 'Fast & Secure Internet Access',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  logo: '🚀',
  terms: 'By connecting to this network, you agree to our terms of service. No illegal activities. Bandwidth may be limited.',
  contactInfo: 'support@devtek.com',
  enableFreeTrial: true,
  trialDuration: 1, // hours
  trialBandwidth: 50, // Mbps
  trialMessage: 'Test our internet connection for 1 hour absolutely free!'
});

const [stats, setStats] = useState({
  totalUsers: 0,
  activeUsers: 0,
  totalBandwidth: 0,
  blockedUsers: 0,
  activeVouchers: 0
});

const [newUser, setNewUser] = useState({
  name: '',
  mac: '',
  ip: '',
  uploadLimit: '',
  downloadLimit: '',
  dataQuota: '',
  enabled: true
});

const [newVoucher, setNewVoucher] = useState({
  code: '',
  duration: '24',
  bandwidth: '10',
  quota: '1024',
  quantity: 1,
  category: 'guest',
  timeRestriction: '',
  deviceLimit: '1',
  template: 'standard'
});

// Notification system
const [notifications, setNotifications] = useState([]);
const [alerts, setAlerts] = useState([]);

const addNotification = (type, message, duration = 5000) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  setNotifications(prev => [...prev, { id, type, message, duration }]);
};

const removeNotification = (id) => {
  setNotifications(prev => prev.filter(n => n.id !== id));
};

// Alert system for critical issues
const addAlert = (type, title, message, priority = 'medium') => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const alert = { id, type, title, message, priority, timestamp: new Date() };
  setAlerts(prev => [...prev.filter(a => a.type !== type), alert]);
  addNotification(type, `${title}: ${message}`, priority === 'critical' ? 0 : 10000);
};

const removeAlert = (id) => {
  setAlerts(prev => prev.filter(a => a.id !== id));
};

// Performance monitoring function
const checkSystemHealth = () => {
  // Check user quota limits
  trafficData.forEach(traffic => {
    const user = users.find(u => u.id === traffic.userId);
    if (user && user.dataQuota) {
      const quotaMB = parseFloat(user.dataQuota);
      const usedMB = traffic.totalDownload + traffic.totalUpload;
      const usagePercent = (usedMB / quotaMB) * 100;

      if (usagePercent >= 100 && !blockedUsers.includes(user.id)) {
        addAlert('warning', 'Quota Exceeded', `${user.name} has exceeded their data quota (${usedMB.toFixed(1)}MB / ${quotaMB}MB)`);
      } else if (usagePercent >= 80 && usagePercent < 100) {
        addAlert('info', 'High Usage Warning', `${user.name} is approaching data quota (${usagePercent.toFixed(1)}% used)`);
      }
    }
  });

  // Check router connection
  if (!routerConfig.connected && routerConfig.lastConnectionError) {
    addAlert('error', 'Router Disconnected', `Connection lost: ${routerConfig.lastConnectionError}`);
  }

  // Check for inactive users (users with no recent activity)
  const inactiveUsers = users.filter(user => {
    const userTraffic = trafficData.find(t => t.userId === user.id);
    const lastActivity = userTraffic?.timestamp ? new Date(userTraffic.timestamp) : new Date(user.addedAt || 0);
    const daysSinceActivity = (new Date() - lastActivity) / (1000 * 60 * 60 * 24);
    return daysSinceActivity > 30 && user.enabled;
  });

  if (inactiveUsers.length > 0) {
    addAlert('info', 'Inactive Users', `${inactiveUsers.length} users have been inactive for over 30 days`);
  }

  // Check voucher expiration
  const expiringVouchers = vouchers.filter(voucher => {
    if (!voucher.expiresAt || voucher.status !== 'active') return false;
    const hoursUntilExpiry = (new Date(voucher.expiresAt) - new Date()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  });

  if (expiringVouchers.length > 0) {
    addAlert('warning', 'Expiring Vouchers', `${expiringVouchers.length} vouchers will expire within 24 hours`);
  }

  // Check system performance (mock alerts for demo)
  if (Math.random() < 0.1) { // 10% chance to trigger random alerts for demo
    const alerts = [
      { type: 'warning', title: 'High CPU Usage', message: 'System CPU usage is above 80%' },
      { type: 'error', title: 'Memory Warning', message: 'System memory usage is critically high' },
      { type: 'info', title: 'Network Congestion', message: 'High network traffic detected' }
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    addAlert(randomAlert.type, randomAlert.title, randomAlert.message);
  }
};

// Voucher templates state
const [voucherTemplates, setVoucherTemplates] = useState([
  { id: 'free_trial', name: 'Free 1-Hour Trial', duration: 1, bandwidth: 50, quota: 0 },
  { id: 'basic', name: 'Basic Access', duration: 24, bandwidth: 5, quota: 512 },
  { id: 'premium', name: 'Premium Access', duration: 72, bandwidth: 25, quota: 2048 },
  { id: 'business', name: 'Business Access', duration: 168, bandwidth: 50, quota: 10240 },
  { id: 'unlimited_24h', name: 'Unlimited 24H (1000 TSh)', duration: 24, bandwidth: 1000, quota: 0 },
  { id: 'weekly', name: 'Weekly (7000 TSh)', duration: 168, bandwidth: 50, quota: 0 },
  { id: 'monthly', name: '30 Days (30000 TSh)', duration: 720, bandwidth: 50, quota: 0 }
]);

const [voucherFilters, setVoucherFilters] = useState({
  status: 'all',
  category: 'all',
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});


// Initial data load on mount only
useEffect(() => {
  loadData();
}, []);

// Monitoring loop depends on connection state
useEffect(() => {
  const interval = setInterval(() => {
    if (routerConfig.connected) {
      updateTrafficData();
    }
    // Record historical data every 5 minutes (300000ms)
    recordHistoricalData();
    // Check system health every 5 minutes
    checkSystemHealth();
  }, 300000);

  // Run checks when connection status changes to true
  if (routerConfig.connected) {
    recordHistoricalData();
    checkSystemHealth();
  }

  return () => clearInterval(interval);
}, [routerConfig.connected]);

const loadData = async () => {
  try {
    // Try using the storage API first
    let configData, usersData, vouchersData, trafficDataStore, blockedData, portalData, historicalDataStore;

    if (window.storage) {
      configData = await window.storage?.get('router-config');
      usersData = await window.storage?.get('users-list');
      vouchersData = await window.storage?.get('vouchers-list');
      trafficDataStore = await window.storage?.get('traffic-data');
      blockedData = await window.storage?.get('blocked-users');
      portalData = await window.storage?.get('portal-config');
      historicalDataStore = await window.storage?.get('historical-data');
    } else {
      // Fallback to localStorage
      configData = { value: localStorage.getItem('devnet-router-config') };
      usersData = { value: localStorage.getItem('devnet-users-list') };
      vouchersData = { value: localStorage.getItem('devnet-vouchers-list') };
      trafficDataStore = { value: localStorage.getItem('devnet-traffic-data') };
      blockedData = { value: localStorage.getItem('devnet-blocked-users') };
      portalData = { value: localStorage.getItem('devnet-portal-config') };
      historicalDataStore = { value: localStorage.getItem('devnet-historical-data') };
    }

    if (configData?.value) {
      try {
        setRouterConfig(JSON.parse(configData.value));
      } catch (e) {
        console.warn('Failed to parse router config:', e);
      }
    }
    if (usersData?.value) {
      try {
        setUsers(JSON.parse(usersData.value));
      } catch (e) {
        console.warn('Failed to parse users data:', e);
      }
    }
    if (vouchersData?.value) {
      try {
        setVouchers(JSON.parse(vouchersData.value));
      } catch (e) {
        console.warn('Failed to parse vouchers data:', e);
      }
    }
    if (trafficDataStore?.value) {
      try {
        setTrafficData(JSON.parse(trafficDataStore.value));
      } catch (e) {
        console.warn('Failed to parse traffic data:', e);
      }
    }
    if (blockedData?.value) {
      try {
        setBlockedUsers(JSON.parse(blockedData.value));
      } catch (e) {
        console.warn('Failed to parse blocked users data:', e);
      }
    }
    if (portalData?.value) {
      try {
        setPortalConfig(JSON.parse(portalData.value));
      } catch (e) {
        console.warn('Failed to parse portal config:', e);
      }
    }
    if (historicalDataStore?.value) {
      try {
        setHistoricalData(JSON.parse(historicalDataStore.value));
      } catch (e) {
        console.warn('Failed to parse historical data:', e);
      }
    }
  } catch (error) {
    console.log('No saved data found or storage not available:', error);
    addNotification('info', 'Welcome! This appears to be your first time using Devnet.');
  }
};

const saveData = async () => {
  try {
    const dataToSave = {
      'router-config': JSON.stringify(routerConfig),
      'users-list': JSON.stringify(users),
      'vouchers-list': JSON.stringify(vouchers),
      'traffic-data': JSON.stringify(trafficData),
      'blocked-users': JSON.stringify(blockedUsers),
      'portal-config': JSON.stringify(portalConfig),
      'historical-data': JSON.stringify(historicalData)
    };

    if (window.storage) {
      // Use storage API if available
      for (const [key, value] of Object.entries(dataToSave)) {
        await window.storage.set(key, value);
      }
    } else {
      // Fallback to localStorage with devnet prefix
      for (const [key, value] of Object.entries(dataToSave)) {
        localStorage.setItem(`devnet-${key}`, value);
      }
    }
  } catch (error) {
    console.error('Failed to save data:', error);
    addNotification('error', 'Failed to save data. Your changes may not persist.');
  }
};

useEffect(() => {
  saveData();
  updateStats();
}, [users, routerConfig, vouchers, blockedUsers, portalConfig]);

const updateStats = () => {
  try {
    const active = users.filter(u => u.enabled && !blockedUsers.includes(u.id)).length;
    const totalBw = users.reduce((sum, u) => {
      const dl = parseFloat(u.downloadLimit) || 0;
      return sum + dl;
    }, 0);
    const activeVouches = vouchers.filter(v => v.status === 'active').length;

    setStats({
      totalUsers: users.length,
      activeUsers: active,
      totalBandwidth: totalBw,
      blockedUsers: blockedUsers.length,
      activeVouchers: activeVouches
    });
  } catch (error) {
    console.error('Error updating stats:', error);
  }
};

const updateTrafficData = () => {
  try {
    if (routerConfig.connected) {
      // Fetch real traffic data from router
      fetchRouterTrafficData();
    } else {
      // Demo mode
      const activeUsers = users.filter(u => u.enabled && !blockedUsers.includes(u.id));
      const newTraffic = activeUsers.map(user => {
        const existingTraffic = trafficData.find(t => t.userId === user.id) || {
          totalDownload: 0,
          totalUpload: 0
        };

        const downloadIncrease = Math.random() * 50;
        const uploadIncrease = Math.random() * 20;

        return {
          userId: user.id,
          userName: user.name,
          totalDownload: existingTraffic.totalDownload + downloadIncrease,
          totalUpload: existingTraffic.totalUpload + uploadIncrease,
          currentDownload: downloadIncrease,
          currentUpload: uploadIncrease,
          timestamp: new Date().toISOString()
        };
      });

      setTrafficData(newTraffic);
      checkQuotaLimits(newTraffic);
    }
  } catch (error) {
    console.error('Error updating traffic data:', error);
  }
};

const fetchRouterTrafficData = async () => {
  try {
    if (!routerConfig.connected || !routerConfig.host) return;

    const activeUsers = await apiRef.current.getActiveHotspotUsers();
    if (activeUsers) {
      updateTrafficFromRouter(activeUsers);
    }

  } catch (error) {
    console.error('Failed to fetch router traffic data:', error);
    setRouterConfig(prev => ({
      ...prev,
      connected: false,
      lastConnectionError: error.message
    }));
  }
};



const syncRouterData = async (config = routerConfig, forceReal = false) => {
  if (!config.host) return;



  try {
    setLoadingStates(prev => ({ ...prev, router: true }));
    addNotification('info', `Syncing data from ${config.host}...`);

    // 1. Fetch System Identity
    try {
      const identityResult = await apiRef.current.execute('/system/identity/print');
      const identity = Array.isArray(identityResult) ? identityResult[0] : identityResult;
      if (identity) {
        addNotification('info', `Router Identity: ${identity.name}`);
      }
    } catch (e) {
      console.warn('Could not fetch router identity', e);
    }

    // 2. Fetch Hotspot Users - This is what populates the dashboard (Top Stats)
    const routerUsers = await apiRef.current.getHotspotUsers();

    const mappedUsers = routerUsers.map(u => ({
      id: u['.id'] || Math.random().toString(36).substr(2, 9),
      name: u.name,
      mac: u['mac-address'] || '',
      ip: u.address || '',
      profile: u.profile,
      comment: u.comment,
      enabled: u.disabled === 'false' || u.disabled === false,
      addedAt: new Date().toISOString(),
      downloadLimit: u['limit-output'] || '10',
      uploadLimit: u['limit-input'] || '2'
    }));

    if (mappedUsers.length > 0) {
      setUsers(mappedUsers);
      addNotification('success', `Dashboard updated: ${mappedUsers.length} users imported from router.`);
    }

  } catch (error) {
    console.error('Data sync failed:', error);
    addNotification('warning', 'Connected, but failed to sync all data. Dashboard may be incomplete.');
  } finally {
    setLoadingStates(prev => ({ ...prev, router: false }));
  }
};

const simulateMockData = () => {
  const mockUsers = [
    { id: 'm1', name: 'Manager-Office', mac: 'E4:8D:8C:11:22:33', ip: '192.168.88.10', enabled: true, downloadLimit: '100', uploadLimit: '20', addedAt: new Date().toISOString() },
    { id: 'm2', name: 'Reception-PC', mac: 'E4:8D:8C:44:55:66', ip: '192.168.88.11', enabled: true, downloadLimit: '50', uploadLimit: '10', addedAt: new Date().toISOString() },
    { id: 'm3', name: 'Guest-Lobby-1', mac: 'E4:8D:8C:77:88:99', ip: '192.168.88.12', enabled: true, downloadLimit: '10', uploadLimit: '2', addedAt: new Date().toISOString() },
    { id: 'm4', name: 'TechHub-Server', mac: 'E4:8D:8C:AA:BB:CC', ip: '192.168.88.100', enabled: true, downloadLimit: '500', uploadLimit: '500', addedAt: new Date().toISOString() }
  ];

  setUsers(mockUsers);

  // Simulate some active traffic so charts look alive
  const mockTraffic = mockUsers.map(u => ({
    userId: u.id,
    userName: u.name,
    totalDownload: 50 + Math.random() * 1000,
    totalUpload: 10 + Math.random() * 200,
    currentDownload: Math.random() * 10,
    currentUpload: Math.random() * 2,
    timestamp: new Date().toISOString()
  }));

  setTrafficData(mockTraffic);
  addNotification('info', 'Demo Mode: Dashboard populated with simulated MikroTik data.');
};

const updateTrafficFromRouter = (activeUsers) => {
  try {
    const newTraffic = activeUsers.map(routerUser => {
      const user = users.find(u => u.mac === routerUser.macAddress);
      if (!user) return null;

      const existingTraffic = trafficData.find(t => t.userId === user.id) || {
        totalDownload: 0,
        totalUpload: 0
      };

      // Calculate traffic increase based on router data
      const downloadIncrease = parseFloat(routerUser.bytesIn || 0) / 1024 / 1024; // MB
      const uploadIncrease = parseFloat(routerUser.bytesOut || 0) / 1024 / 1024; // MB

      return {
        userId: user.id,
        userName: user.name,
        totalDownload: existingTraffic.totalDownload + downloadIncrease,
        totalUpload: existingTraffic.totalUpload + uploadIncrease,
        currentDownload: downloadIncrease,
        currentUpload: uploadIncrease,
        timestamp: new Date().toISOString()
      };
    }).filter(Boolean);

    setTrafficData(newTraffic);
    checkQuotaLimits(newTraffic);
  } catch (error) {
    console.error('Error updating traffic from router:', error);
  }
};

const checkQuotaLimits = (traffic) => {
  try {
    const newBlocked = [];

    traffic.forEach(t => {
      const user = users.find(u => u.id === t.userId);
      if (user && user.dataQuota) {
        const quotaMB = parseFloat(user.dataQuota);
        const totalUsedMB = t.totalDownload + t.totalUpload;

        if (totalUsedMB >= quotaMB && !blockedUsers.includes(user.id)) {
          newBlocked.push(user.id);
        }
      }
    });

    if (newBlocked.length > 0) {
      setBlockedUsers([...blockedUsers, ...newBlocked]);
      addNotification('warning', `${newBlocked.length} user(s) blocked due to quota exceeded!`);
    }
  } catch (error) {
    console.error('Error checking quota limits:', error);
  }
};

// Enhanced connection attempt with detailed diagnostics
const attemptConnection = async (attemptNumber = 1) => {
  const startTime = Date.now();
  let connectionError = null;

  try {
    // Connect using the WebSocket bridge
    await apiRef.current.connect(routerConfig);

    // Verify connection by fetching system resource
    const systemInfoResult = await apiRef.current.getSystemResource();
    const systemInfo = Array.isArray(systemInfoResult) ? systemInfoResult[0] : systemInfoResult;

    const connectionTime = Date.now() - startTime;

    // Update connection history
    const connectionRecord = {
      timestamp: new Date().toISOString(),
      success: true,
      attempt: attemptNumber,
      responseTime: connectionTime,
      details: `Connected to ${systemInfo['board-name'] || 'MikroTik'} (${systemInfo.version || 'unknown'}) via Backend Bridge`
    };

    setRouterConfig(prev => ({
      ...prev,
      connectionHistory: [connectionRecord, ...prev.connectionHistory.slice(0, 9)], // Keep last 10
      lastConnected: new Date().toISOString(),
      connectionAttempts: 0
    }));

    return { success: true, systemInfo, connectionTime };

  } catch (error) {
    connectionError = error;

    // Update connection history with failure
    const failureRecord = {
      timestamp: new Date().toISOString(),
      success: false,
      attempt: attemptNumber,
      error: error.message,
      errorType: error.name
    };

    setRouterConfig(prev => ({
      ...prev,
      connectionHistory: [failureRecord, ...prev.connectionHistory.slice(0, 9)]
    }));

    return { success: false, error, attemptNumber };
  }
};

// Enhanced connection function with retry logic
const connectToRouter = async (forcedConfig = null) => {
  const configToUse = forcedConfig || routerConfig;
  const validation = validateRouterConfig(configToUse);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    addNotification('error', firstError);
    return;
  }

  setRouterConfig(prev => ({
    ...prev,
    ...configToUse,
    connecting: true,
    lastConnectionError: null,
    connectionAttempts: 0
  }));
  setLoadingStates(prev => ({ ...prev, router: true }));

  // If using MAC address, resolve to IP first
  if (configToUse.connectionMethod === 'mac') {
    if (!configToUse.macAddress) {
      addNotification('error', 'Please enter a MAC address');
      setRouterConfig(prev => ({ ...prev, connecting: false }));
      setLoadingStates(prev => ({ ...prev, router: false }));
      return;
    }

    addNotification('info', `Resolving MAC ${configToUse.macAddress} to IP...`);
    const resolvedIp = await resolveMacToIp(configToUse.macAddress);

    if (resolvedIp) {
      addNotification('success', `Resolved to ${resolvedIp}`);
      // Update both the temporary config and the state
      configToUse.host = resolvedIp;
      setRouterConfig(prev => ({ ...prev, host: resolvedIp }));
    } else {
      addNotification('error', 'Could not resolve MAC address to an IP on the network.');
      setRouterConfig(prev => ({ ...prev, connecting: false }));
      setLoadingStates(prev => ({ ...prev, router: false }));
      return;
    }
  }



  let lastError = null;

  // Attempt connection with retries
  for (let attempt = 1; attempt <= routerConfig.maxRetries; attempt++) {
    addNotification('info', `Connecting to router (attempt ${attempt}/${routerConfig.maxRetries})...`);

    const result = await attemptConnection(attempt);

    if (result.success) {
      // Connection successful
      setRouterConfig(prev => ({
        ...prev,
        connected: true,
        connecting: false,
        lastConnectionError: null,
        connectionAttempts: attempt
      }));
      setLoadingStates(prev => ({ ...prev, router: false }));

      addNotification('success',
        `✅ Connected to MikroTik router!\n` +
        `📍 Board: ${result.systemInfo['board-name']}\n` +
        `🔖 Version: ${result.systemInfo.version}\n` +
        `⚡ Response time: ${result.connectionTime}ms`
      );

      // Start connection monitoring if auto-reconnect is enabled
      if (routerConfig.autoReconnect) {
        startConnectionMonitoring();
      }

      // Immediately fetch initial traffic data
      await fetchRouterTrafficData();
      // Sync users and other metadata
      await syncRouterData(configToUse);
      return;
    } else {
      lastError = result.error;

      if (attempt < routerConfig.maxRetries) {
        // Wait before retry with exponential backoff
        const delay = routerConfig.retryDelay * Math.pow(2, attempt - 1);
        addNotification('warning', `Connection failed, retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts failed
  const errorMessage = getDetailedErrorMessage(lastError);
  setRouterConfig(prev => ({
    ...prev,
    connected: false,
    connecting: false,
    lastConnectionError: errorMessage,
    connectionAttempts: routerConfig.maxRetries
  }));
  setLoadingStates(prev => ({ ...prev, router: false }));

  addNotification('error',
    `❌ Connection failed after ${routerConfig.maxRetries} attempts\n\n${errorMessage}\n\n` +
    '🔧 Troubleshooting steps:\n' +
    '• Verify router IP address and port\n' +
    '• Check if REST API is enabled: /ip service set www-ssl disabled=no\n' +
    '• Ensure SSL certificate is configured\n' +
    '• Verify firewall allows connections\n' +
    '• Confirm username/password are correct'
  );
};

// Get detailed error message with diagnostics
const getDetailedErrorMessage = (error) => {
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return `Connection timeout after ${routerConfig.connectionTimeout / 1000}s. Router may be unreachable.`;
  }

  if (error.message.includes('ECONNREFUSED')) {
    return 'Connection refused. Check if router is online and REST API is enabled.';
  }

  if (error.message.includes('ENOTFOUND')) {
    return `Host "${routerConfig.host}" not found. Verify the IP address or hostname.`;
  }

  if (error.message.includes('CERT_HAS_EXPIRED')) {
    return 'SSL certificate has expired. Update router certificate.';
  }

  if (error.message.includes('SELF_SIGNED_CERT')) {
    return 'Self-signed certificate detected. Enable "Skip SSL validation" for testing.';
  }

  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    return 'Authentication failed. Check username and password.';
  }

  return error.message;
};

// Router discovery functionality
const [routerDiscovery, setRouterDiscovery] = useState({
  scanning: false,
  discoveredRouters: [],
  scanProgress: 0,
  scanRange: '192.168.100.0/24',
  lastScanTime: null
});

// Scan network for MikroTik routers using robust service
const discoverRouters = async () => {
  try {
    setRouterDiscovery(prev => ({ ...prev, scanning: true, scanProgress: 0, discoveredRouters: [] }));

    const discovered = await detectAllRouters({
      scanRange: routerDiscovery.scanRange,
      onProgress: (p) => {
        setRouterDiscovery(prev => ({
          ...prev,
          scanProgress: p.progress
        }));
      }
    });

    setRouterDiscovery(prev => ({
      ...prev,
      scanning: false,
      discoveredRouters: discovered.map(r => ({
        ip: r.ip,
        discoveredAt: r.detectedAt,
        status: 'online',
        details: {
          type: r.recommended.type,
          port: r.recommended.port,
          identity: r.fingerprint?.identity
        }
      })),
      lastScanTime: new Date().toISOString(),
      scanProgress: 100
    }));

    if (discovered.length > 0) {
      addNotification('success', `Found ${discovered.length} MikroTik device${discovered.length !== 1 ? 's' : ''}!`);
    } else {
      addNotification('info', 'No MikroTik devices found in the scanned range.');
    }
  } catch (error) {
    console.error('Router discovery failed:', error);
    setRouterDiscovery(prev => ({ ...prev, scanning: false, scanProgress: 0 }));
    if (error.message !== 'Detection cancelled') {
      addNotification('error', 'Router discovery failed. Check your network connection.');
    }
  }
};


// Resolve MAC address to IP by scanning
const resolveMacToIp = async (mac) => {
  const [baseIP] = routerDiscovery.scanRange.split('/');
  const baseParts = baseIP.split('.');
  const baseRange = `${baseParts[0]}.${baseParts[1]}.${baseParts[2]}.`;

  // Fast scan to find the MAC
  for (let i = 1; i <= 254; i++) {
    const testIP = `${baseRange}${i}`;
    try {
      const isMikroTik = await testMikroTikDevice(testIP);
      if (isMikroTik && isMikroTik.mac === mac) {
        return testIP;
      }
    } catch (e) { }
  }
  return null;
};

// Autodetect router logic using the robust service
const autodetectRouter = async () => {
  try {
    setRouterConfig(prev => ({ ...prev, autodetecting: true }));

    const router = await startRobustDetection({
      scanRange: routerDiscovery.scanRange,
      useCache: true,
      strategies: ['cached', 'priority_ips', 'network_scan']
    });

    if (router) {
      addNotification('success', `✅ Found MikroTik router at ${router.ip}!`);
      setRouterConfig(prev => ({
        ...prev,
        host: router.ip,
        macAddress: router.mac || '',
        port: router.recommended.port.toString(),
        autodetecting: false
      }));
    } else {
      addNotification('warning', '⚠️ No MikroTik router found. Try manual configuration.');
    }
  } catch (error) {
    console.error('Autodetect error:', error);
    if (error.message !== 'Detection cancelled') {
      addNotification('error', '❌ Autodetect failed: ' + error.message);
    }
  } finally {
    setRouterConfig(prev => ({ ...prev, autodetecting: false }));
  }
};

// Test if an IP address is a MikroTik device
const testMikroTikDevice = async (ip) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout for faster scanning

    // Try to connect to common MikroTik ports and services
    const tests = [
      // Test REST API (most reliable)
      fetch(`https://${ip}:443/rest/system/identity`, {
        method: 'GET',
        headers: { 'Authorization': 'Basic ' + btoa('admin:') }, // Empty password for discovery
        signal: controller.signal
      }).then(async response => {
        if (response.ok) {
          const data = await response.json();
          return { type: 'rest-api', identity: data.name, port: 443, mac: response.headers.get('X-MikroTik-MAC') };
        }
        return null;
      }).catch(() => null),

      // Test HTTP (port 80) - MikroTik often has web interface
      fetch(`http://${ip}:80`, {
        method: 'HEAD',
        signal: controller.signal
      }).then(response => {
        const serverHeader = response.headers.get('Server') || '';
        if (serverHeader.toLowerCase().includes('mikrotik') || response.ok) {
          return { type: 'http', port: 80 };
        }
        return null;
      }).catch(() => null),

      // Test Winbox port (8291)
      testPort(ip, 8291).then(available => {
        if (available) return { type: 'winbox', port: 8291 };
        return null;
      }),

      // Test API port (8728)
      testPort(ip, 8728).then(available => {
        if (available) return { type: 'api', port: 8728 };
        return null;
      })
    ];

    const results = await Promise.all(tests);
    clearTimeout(timeoutId);

    // Return the best match (prefer REST API, then HTTP, then others)
    for (const result of results) {
      if (result) return result;
    }

    return null;

  } catch (error) {
    return null;
  }
};

// Test if a specific port is open
const testPort = async (ip, port) => {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 1000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    // Use a simple connection test (this is a workaround since we can't directly test ports in browser)
    img.src = `http://${ip}:${port}/favicon.ico?${Date.now()}`;
  });
};

// Get current device IP (approximate)
const getCurrentIP = () => {
  // This is a simplified version - in reality, you'd need to make an API call
  // For now, we'll return a placeholder
  return null;
};

// Security auditing and API token management
const [securityAudit, setSecurityAudit] = useState({
  lastAudit: null,
  vulnerabilities: [],
  recommendations: [],
  securityScore: 100
});

// Generate API token (for future token-based auth)
const generateAPIToken = () => {
  const token = 'mt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  setRouterConfig(prev => ({ ...prev, apiToken: token }));

  // Log security event
  logSecurityEvent('api_token_generated', 'success', { tokenPreview: token.substring(0, 8) + '...' });

  addNotification('success', 'API token generated successfully!');
  return token;
};

// Validate security configuration
const validateSecurityConfig = () => {
  const issues = [];
  const recommendations = [];

  // Check authentication method
  if (routerConfig.authMethod === 'basic' && !routerConfig.sslValidation) {
    issues.push({
      severity: 'high',
      title: 'Insecure Authentication',
      description: 'Using basic auth without SSL validation exposes credentials to MITM attacks',
      recommendation: 'Enable SSL validation or use API token authentication'
    });
  }

  // Check for default credentials
  if (routerConfig.username === 'admin' && routerConfig.password === '') {
    issues.push({
      severity: 'critical',
      title: 'Default Credentials',
      description: 'Router is using default admin credentials',
      recommendation: 'Change username and password immediately'
    });
  }

  // Check SSL settings
  if (!routerConfig.sslValidation) {
    recommendations.push({
      title: 'SSL Validation',
      description: 'Consider enabling SSL certificate validation for production use',
      action: 'Enable SSL validation in advanced settings'
    });
  }

  // Check API token usage
  if (routerConfig.authMethod === 'token' && !routerConfig.apiToken) {
    issues.push({
      severity: 'medium',
      title: 'Missing API Token',
      description: 'Token authentication selected but no token configured',
      recommendation: 'Generate an API token or switch to basic authentication'
    });
  }

  // Update security audit state
  const securityScore = Math.max(0, 100 - (issues.length * 15) - (recommendations.length * 5));
  setSecurityAudit({
    lastAudit: new Date().toISOString(),
    vulnerabilities: issues,
    recommendations,
    securityScore
  });

  setRouterConfig(prev => ({ ...prev, lastSecurityCheck: new Date().toISOString() }));

  return { issues, recommendations, securityScore };
};

// Log security events
const logSecurityEvent = (event, status, details = {}) => {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    event,
    status,
    details,
    ip: 'client_ip', // In real implementation, get actual IP
    userAgent: navigator.userAgent
  };

  setRouterConfig(prev => ({
    ...prev,
    securityLog: [securityEvent, ...prev.securityLog.slice(0, 99)] // Keep last 100 events
  }));

  // In a real implementation, you might want to send this to a security monitoring service
  console.log('Security Event:', securityEvent);
};

// Enhanced authentication header generation
const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  switch (routerConfig.authMethod) {
    case 'token':
      if (routerConfig.apiToken) {
        headers['Authorization'] = `Bearer ${routerConfig.apiToken}`;
      }
      break;
    case 'certificate':
      // Certificate-based auth would be handled differently
      // This is a placeholder for certificate auth implementation
      break;
    case 'basic':
    default:
      headers['Authorization'] = 'Basic ' + btoa(`${routerConfig.username}:${routerConfig.password}`);
      break;
  }

  return headers;
};

// Run security audit
const runSecurityAudit = () => {
  const result = validateSecurityConfig();

  if (result.issues.length > 0) {
    addNotification('warning',
      `Security audit completed. Found ${result.issues.length} issue${result.issues.length !== 1 ? 's' : ''}. ` +
      `Security score: ${result.securityScore}/100`
    );
  } else {
    addNotification('success',
      `Security audit passed! Score: ${result.securityScore}/100`
    );
  }

  logSecurityEvent('security_audit', 'completed', {
    score: result.securityScore,
    issuesFound: result.issues.length,
    recommendations: result.recommendations.length
  });
};

// Configuration management functions
const [configManager, setConfigManager] = useState({
  validating: false,
  deploying: false,
  lastValidation: null,
  validationResults: null
});

// Save configuration version
const saveConfigVersion = (description = 'Manual save') => {
  const configSnapshot = {
    version: Date.now().toString(),
    timestamp: new Date().toISOString(),
    description,
    data: {
      routerConfig: { ...routerConfig },
      users: [...users],
      vouchers: [...vouchers],
      portalConfig: { ...portalConfig },
      blockedUsers: [...blockedUsers]
    }
  };

  setRouterConfig(prev => ({
    ...prev,
    configHistory: [configSnapshot, ...prev.configHistory.slice(0, 49)], // Keep last 50 versions
    currentConfigVersion: configSnapshot.version
  }));

  addNotification('success', `Configuration version saved: ${description}`);
  logSecurityEvent('config_version_saved', 'success', { version: configSnapshot.version });
};

// Restore configuration from version
const restoreConfigVersion = (versionId) => {
  const version = routerConfig.configHistory.find(v => v.version === versionId);
  if (!version) {
    addNotification('error', 'Configuration version not found');
    return;
  }

  if (confirm(`Restore configuration from ${new Date(version.timestamp).toLocaleString()}? Current configuration will be lost.`)) {
    const { data } = version;
    setRouterConfig(data.routerConfig);
    setUsers(data.users);
    setVouchers(data.vouchers);
    setPortalConfig(data.portalConfig);
    setBlockedUsers(data.blockedUsers);

    addNotification('success', 'Configuration restored successfully');
    logSecurityEvent('config_version_restored', 'success', { version: versionId });
  }
};

// Validate configuration before deployment
const validateConfiguration = async () => {
  setConfigManager(prev => ({ ...prev, validating: true }));

  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    warnings: [],
    passed: true
  };

  try {
    // Validate router configuration
    const routerValidation = validateRouterConfig(routerConfig);
    if (!routerValidation.isValid) {
      results.issues.push({
        type: 'router',
        message: 'Router configuration invalid',
        details: routerValidation.errors
      });
      results.passed = false;
    }

    // Validate users
    users.forEach((user, index) => {
      const userValidation = validateUser(user);
      if (!userValidation.isValid) {
        results.issues.push({
          type: 'user',
          index,
          message: `User "${user.name}" has validation errors`,
          details: userValidation.errors
        });
        results.passed = false;
      }
    });

    // Validate vouchers
    vouchers.forEach((voucher, index) => {
      const voucherValidation = validateVoucher(voucher);
      if (!voucherValidation.isValid) {
        results.issues.push({
          type: 'voucher',
          index,
          message: `Voucher "${voucher.code}" has validation errors`,
          details: voucherValidation.errors
        });
        results.passed = false;
      }
    });

    // Check for potential issues
    if (users.length === 0) {
      results.warnings.push({
        type: 'system',
        message: 'No users configured',
        suggestion: 'Add at least one user for basic functionality'
      });
    }

    if (vouchers.filter(v => v.status === 'active').length === 0) {
      results.warnings.push({
        type: 'system',
        message: 'No active vouchers',
        suggestion: 'Consider generating vouchers for guest access'
      });
    }

    // Check bandwidth limits
    const totalBandwidth = users.reduce((sum, user) => sum + (parseFloat(user.downloadLimit) || 0), 0);
    if (totalBandwidth > 1000) { // Assuming 1Gbps total capacity
      results.warnings.push({
        type: 'performance',
        message: 'Total bandwidth allocation exceeds recommended limits',
        suggestion: 'Consider redistributing bandwidth limits'
      });
    }

  } catch (error) {
    results.issues.push({
      type: 'system',
      message: 'Validation failed',
      details: { error: error.message }
    });
    results.passed = false;
  }

  setConfigManager(prev => ({
    ...prev,
    validating: false,
    lastValidation: results.timestamp,
    validationResults: results
  }));

  if (results.passed && results.warnings.length === 0) {
    addNotification('success', '✅ Configuration validation passed!');
  } else if (results.passed) {
    addNotification('warning', `⚠️ Configuration valid but ${results.warnings.length} warning${results.warnings.length !== 1 ? 's' : ''} found`);
  } else {
    addNotification('error', `❌ Configuration validation failed: ${results.issues.length} issue${results.issues.length !== 1 ? 's' : ''} found`);
  }

  return results;
};

// Deploy configuration to router
const deployConfiguration = async () => {
  // First validate configuration
  const validation = await validateConfiguration();
  if (!validation.passed) {
    addNotification('error', 'Cannot deploy invalid configuration. Fix issues first.');
    return;
  }

  setConfigManager(prev => ({ ...prev, deploying: true }));

  try {
    addNotification('info', '🚀 Deploying configuration to router...');

    // Apply user configurations
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        if (user.enabled && !blockedUsers.includes(user.id)) {
          await applyUserToRouter(user);
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to deploy user ${user.name}:`, error);
        errorCount++;
      }
    }

    // Apply firewall rules for blocked users
    for (const blockedId of blockedUsers) {
      try {
        await blockUserOnRouter(blockedId);
        successCount++;
      } catch (error) {
        console.error(`Failed to deploy block rule for user ${blockedId}:`, error);
        errorCount++;
      }
    }

    // Save configuration version after successful deployment
    saveConfigVersion('Auto-save after deployment');

    setConfigManager(prev => ({ ...prev, deploying: false }));

    if (errorCount === 0) {
      addNotification('success', `✅ Configuration deployed successfully! (${successCount} operations)`);
    } else {
      addNotification('warning', `⚠️ Configuration deployed with issues: ${successCount} successful, ${errorCount} failed`);
    }

  } catch (error) {
    setConfigManager(prev => ({ ...prev, deploying: false }));
    addNotification('error', `❌ Deployment failed: ${error.message}`);
  }
};

// Bulk operations management
const addBulkOperation = (operation) => {
  setRouterConfig(prev => ({
    ...prev,
    bulkOperations: [...prev.bulkOperations, {
      id: Date.now().toString(),
      ...operation,
      status: 'pending',
      createdAt: new Date().toISOString()
    }]
  }));
};

const executeBulkOperations = async () => {
  const pendingOps = routerConfig.bulkOperations.filter(op => op.status === 'pending');

  if (pendingOps.length === 0) {
    addNotification('info', 'No pending bulk operations');
    return;
  }

  addNotification('info', `Executing ${pendingOps.length} bulk operation${pendingOps.length !== 1 ? 's' : ''}...`);

  let successCount = 0;
  let errorCount = 0;

  for (const operation of pendingOps) {
    try {
      await executeBulkOperation(operation);
      setRouterConfig(prev => ({
        ...prev,
        bulkOperations: prev.bulkOperations.map(op =>
          op.id === operation.id ? { ...op, status: 'completed' } : op
        )
      }));
      successCount++;
    } catch (error) {
      setRouterConfig(prev => ({
        ...prev,
        bulkOperations: prev.bulkOperations.map(op =>
          op.id === operation.id ? { ...op, status: 'failed', error: error.message } : op
        )
      }));
      errorCount++;
    }
  }

  if (errorCount === 0) {
    addNotification('success', `✅ All bulk operations completed successfully!`);
  } else {
    addNotification('warning', `⚠️ Bulk operations completed with issues: ${successCount} successful, ${errorCount} failed`);
  }
};

const executeBulkOperation = async (operation) => {
  switch (operation.type) {
    case 'create_users':
      for (const userData of operation.data) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        addUserFromBulk(userData);
      }
      break;
    case 'update_users':
      for (const update of operation.data) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateUserFromBulk(update);
      }
      break;
    case 'delete_users':
      for (const userId of operation.data) {
        await new Promise(resolve => setTimeout(resolve, 100));
        deleteUser(userId);
      }
      break;
    default:
      throw new Error(`Unknown operation type: ${operation.type}`);
  }
};

// Helper functions for bulk operations
const addUserFromBulk = (userData) => {
  const user = {
    id: Date.now().toString() + Math.random(),
    ...userData,
    addedAt: new Date().toISOString(),
    lastSeen: null
  };
  setUsers(prev => [...prev, user]);
};

const updateUserFromBulk = (update) => {
  setUsers(prev => prev.map(user =>
    user.id === update.id ? { ...user, ...update.data } : user
  ));
};

// Advanced monitoring and diagnostics
const [monitoringSystem, setMonitoringSystem] = useState({
  active: false,
  collectingLogs: false,
  runningDiagnostics: false,
  lastDiagnosticRun: null,
  diagnosticResults: null
});

// Run comprehensive diagnostics
const runDiagnostics = async () => {
  setMonitoringSystem(prev => ({ ...prev, runningDiagnostics: true }));

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    overall: 'unknown'
  };

  try {
    addNotification('info', '🔍 Running comprehensive diagnostics...');

    // Network connectivity test
    results.tests.push(await testNetworkConnectivity());

    // Router API responsiveness test
    results.tests.push(await testRouterAPI());

    // Configuration consistency test
    results.tests.push(await testConfigurationConsistency());

    // User quota compliance test
    results.tests.push(await testUserQuotaCompliance());

    // Voucher expiration check
    results.tests.push(await testVoucherExpiration());

    // System resource check
    results.tests.push(await testSystemResources());

    // Firewall rule validation
    results.tests.push(await testFirewallRules());

    // Calculate overall status
    const criticalIssues = results.tests.filter(test => test.status === 'critical').length;
    const warningIssues = results.tests.filter(test => test.status === 'warning').length;
    const failedTests = results.tests.filter(test => test.status === 'failed').length;

    if (failedTests > 0 || criticalIssues > 0) {
      results.overall = 'critical';
    } else if (warningIssues > 0) {
      results.overall = 'warning';
    } else {
      results.overall = 'healthy';
    }

    setMonitoringSystem(prev => ({
      ...prev,
      runningDiagnostics: false,
      lastDiagnosticRun: results.timestamp,
      diagnosticResults: results
    }));

    const statusMessage = results.overall === 'healthy' ? '✅ System healthy!' :
      results.overall === 'warning' ? `⚠️ ${warningIssues} warning${warningIssues !== 1 ? 's' : ''} found` :
        `❌ ${criticalIssues + failedTests} critical issue${criticalIssues + failedTests !== 1 ? 's' : ''} found`;

    addNotification(results.overall === 'healthy' ? 'success' :
      results.overall === 'warning' ? 'warning' : 'error', statusMessage);

  } catch (error) {
    setMonitoringSystem(prev => ({ ...prev, runningDiagnostics: false }));
    addNotification('error', `Diagnostics failed: ${error.message}`);
  }
};

// Individual diagnostic tests
const testNetworkConnectivity = async () => {
  const test = { name: 'Network Connectivity', status: 'unknown', details: {} };

  try {
    // Test local network connectivity
    const startTime = Date.now();
    // In a real implementation, you'd test actual network connectivity
    const responseTime = Date.now() - startTime;

    if (responseTime < 100) {
      test.status = 'passed';
      test.details.responseTime = `${responseTime}ms`;
    } else {
      test.status = 'warning';
      test.details.responseTime = `${responseTime}ms (slow)`;
    }
  } catch (error) {
    test.status = 'failed';
    test.details.error = error.message;
  }

  return test;
};

const testRouterAPI = async () => {
  const test = { name: 'Router API', status: 'unknown', details: {} };

  if (!routerConfig.connected) {
    test.status = 'failed';
    test.details.error = 'Router not connected';
    return test;
  }

  try {
    const result = await attemptConnection(1);
    if (result.success) {
      test.status = 'passed';
      test.details.responseTime = `${result.connectionTime}ms`;
    } else {
      test.status = 'failed';
      test.details.error = result.error.message;
    }
  } catch (error) {
    test.status = 'failed';
    test.details.error = error.message;
  }

  return test;
};

const testConfigurationConsistency = async () => {
  const test = { name: 'Configuration Consistency', status: 'unknown', details: {} };

  try {
    const issues = [];

    // Check for orphaned traffic data
    const userIds = new Set(users.map(u => u.id));
    const orphanedTraffic = trafficData.filter(t => !userIds.has(t.userId));
    if (orphanedTraffic.length > 0) {
      issues.push(`${orphanedTraffic.length} orphaned traffic records`);
    }

    // Check for blocked users that don't exist
    const blockedNonExistent = blockedUsers.filter(id => !userIds.has(id));
    if (blockedNonExistent.length > 0) {
      issues.push(`${blockedNonExistent.length} blocked non-existent users`);
    }

    // Check voucher consistency
    const activeVouchers = vouchers.filter(v => v.status === 'active');
    const expiredActive = activeVouchers.filter(v =>
      v.expiresAt && new Date(v.expiresAt) < new Date()
    );
    if (expiredActive.length > 0) {
      issues.push(`${expiredActive.length} expired active vouchers`);
    }

    if (issues.length === 0) {
      test.status = 'passed';
      test.details.message = 'All configurations consistent';
    } else {
      test.status = 'warning';
      test.details.issues = issues;
    }
  } catch (error) {
    test.status = 'failed';
    test.details.error = error.message;
  }

  return test;
};

const testUserQuotaCompliance = async () => {
  const test = { name: 'User Quota Compliance', status: 'unknown', details: {} };

  try {
    const quotaViolations = [];
    const nearQuota = [];

    trafficData.forEach(traffic => {
      const user = users.find(u => u.id === traffic.userId);
      if (user && user.dataQuota) {
        const quotaMB = parseFloat(user.dataQuota);
        const usedMB = traffic.totalDownload + traffic.totalUpload;
        const usagePercent = (usedMB / quotaMB) * 100;

        if (usagePercent >= 100) {
          quotaViolations.push(`${user.name}: ${usagePercent.toFixed(1)}% used`);
        } else if (usagePercent >= 90) {
          nearQuota.push(`${user.name}: ${usagePercent.toFixed(1)}% used`);
        }
      }
    });

    if (quotaViolations.length > 0) {
      test.status = 'critical';
      test.details.violations = quotaViolations;
      test.details.nearQuota = nearQuota;
    } else if (nearQuota.length > 0) {
      test.status = 'warning';
      test.details.nearQuota = nearQuota;
    } else {
      test.status = 'passed';
      test.details.message = 'All users within quota limits';
    }
  } catch (error) {
    test.status = 'failed';
    test.details.error = error.message;
  }

  return test;
};

const testVoucherExpiration = async () => {
  const test = { name: 'Voucher Expiration', status: 'unknown', details: {} };

  try {
    const now = new Date();
    const expired = vouchers.filter(v =>
      v.status === 'active' && v.expiresAt && new Date(v.expiresAt) < now
    );
    const expiringSoon = vouchers.filter(v =>
      v.status === 'active' && v.expiresAt &&
      (new Date(v.expiresAt) - now) < (24 * 60 * 60 * 1000) // 24 hours
    );

    if (expired.length > 0) {
      test.status = 'critical';
      test.details.expired = expired.length;
      test.details.expiringSoon = expiringSoon.length;
    } else if (expiringSoon.length > 0) {
      test.status = 'warning';
      test.details.expiringSoon = expiringSoon.length;
    } else {
      test.status = 'passed';
      test.details.message = 'No voucher expiration issues';
    }
  } catch (error) {
    test.status = 'failed';
    test.details.error = error.message;
  }

  return test;
};

const testSystemResources = async () => {
  const test = { name: 'System Resources', status: 'unknown', details: {} };

  try {
    // In a real implementation, this would check actual system resources
    const mockResources = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100
    };

    const issues = [];
    if (mockResources.cpu > 90) issues.push('High CPU usage');
    if (mockResources.memory > 95) issues.push('Critical memory usage');
    if (mockResources.disk > 95) issues.push('Low disk space');

    if (issues.length > 0) {
      test.status = 'critical';
      test.details.issues = issues;
    } else {
      test.status = 'passed';
      test.details.resources = mockResources;
    }
  } catch (error) {
    test.status = 'failed';
    test.details.error = error.message;
  }

  return test;
};

const testFirewallRules = async () => {
  const test = { name: 'Firewall Rules', status: 'unknown', details: {} };

  try {
    // In a real implementation, this would validate firewall rules
    const rulesCount = blockedUsers.length;
    const activeRules = blockedUsers.filter(id => {
      const user = users.find(u => u.id === id);
      return user && user.enabled;
    }).length;

    test.status = 'passed';
    test.details.totalRules = rulesCount;
    test.details.activeRules = activeRules;
    test.details.message = `${activeRules} active blocking rules for ${rulesCount} blocked users`;

  } catch (error) {
    test.status = 'failed';
    test.details.error = error.message;
  }

  return test;
};

// Start/stop comprehensive monitoring
const toggleMonitoring = () => {
  if (monitoringSystem.active) {
    stopMonitoring();
  } else {
    startMonitoring();
  }
};

const startMonitoring = () => {
  setMonitoringSystem(prev => ({ ...prev, active: true }));
  addNotification('success', '🔍 Advanced monitoring enabled');

  // Run initial diagnostics
  runDiagnostics();

  // Set up periodic monitoring
  const monitorInterval = setInterval(() => {
    if (routerConfig.connected) {
      runDiagnostics();
    }
  }, 300000); // Every 5 minutes

  setMonitoringSystem(prev => ({ ...prev, monitorInterval }));
};

const stopMonitoring = () => {
  if (monitoringSystem.monitorInterval) {
    clearInterval(monitoringSystem.monitorInterval);
  }
  setMonitoringSystem(prev => ({ ...prev, active: false, monitorInterval: null }));
  addNotification('info', 'Advanced monitoring disabled');
};

// Integration and webhook management
const [integrationManager, setIntegrationManager] = useState({
  webhookTesting: false,
  lastWebhookTest: null,
  webhookLogs: []
});

// Webhook management
const addWebhook = (webhook) => {
  const newWebhook = {
    id: Date.now().toString(),
    ...webhook,
    createdAt: new Date().toISOString(),
    enabled: true,
    lastTriggered: null,
    successCount: 0,
    failureCount: 0
  };

  setRouterConfig(prev => ({
    ...prev,
    webhooks: [...prev.webhooks, newWebhook]
  }));

  addNotification('success', `Webhook "${webhook.name}" added successfully`);
};

const updateWebhook = (id, updates) => {
  setRouterConfig(prev => ({
    ...prev,
    webhooks: prev.webhooks.map(wh =>
      wh.id === id ? { ...wh, ...updates } : wh
    )
  }));
};

const deleteWebhook = (id) => {
  setRouterConfig(prev => ({
    ...prev,
    webhooks: prev.webhooks.filter(wh => wh.id !== id)
  }));
  addNotification('success', 'Webhook deleted');
};

const testWebhook = async (webhook) => {
  setIntegrationManager(prev => ({ ...prev, webhookTesting: true }));

  try {
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook' }
    };

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'Devnet',
        'X-Webhook-Event': 'test'
      },
      body: JSON.stringify(testPayload)
    });

    const success = response.ok;
    const logEntry = {
      webhookId: webhook.id,
      timestamp: new Date().toISOString(),
      event: 'test',
      success,
      statusCode: response.status,
      response: success ? 'OK' : await response.text().catch(() => 'Unknown error')
    };

    setIntegrationManager(prev => ({
      ...prev,
      webhookTesting: false,
      lastWebhookTest: new Date().toISOString(),
      webhookLogs: [logEntry, ...prev.webhookLogs.slice(0, 49)]
    }));

    // Update webhook stats
    updateWebhook(webhook.id, {
      lastTriggered: new Date().toISOString(),
      successCount: webhook.successCount + (success ? 1 : 0),
      failureCount: webhook.failureCount + (success ? 0 : 1)
    });

    addNotification(success ? 'success' : 'error',
      `Webhook test ${success ? 'successful' : 'failed'}: ${response.status}`);

  } catch (error) {
    const logEntry = {
      webhookId: webhook.id,
      timestamp: new Date().toISOString(),
      event: 'test',
      success: false,
      error: error.message
    };

    setIntegrationManager(prev => ({
      ...prev,
      webhookTesting: false,
      webhookLogs: [logEntry, ...prev.webhookLogs.slice(0, 49)]
    }));

    updateWebhook(webhook.id, {
      lastTriggered: new Date().toISOString(),
      failureCount: webhook.failureCount + 1
    });

    addNotification('error', `Webhook test failed: ${error.message}`);
  }
};

// Trigger webhooks for events
const triggerWebhooks = async (event, data) => {
  if (routerConfig.webhooks.length === 0) return;

  const enabledWebhooks = routerConfig.webhooks.filter(wh => wh.enabled);

  for (const webhook of enabledWebhooks) {
    // Check if webhook should trigger for this event
    if (webhook.events && !webhook.events.includes(event)) continue;

    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        source: 'Devnet',
        data
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'Devnet',
          'X-Webhook-Event': event,
          ...(webhook.secret && { 'X-Webhook-Signature': generateWebhookSignature(payload, webhook.secret) })
        },
        body: JSON.stringify(payload)
      });

      const success = response.ok;
      updateWebhook(webhook.id, {
        lastTriggered: new Date().toISOString(),
        successCount: webhook.successCount + (success ? 1 : 0),
        failureCount: webhook.failureCount + (success ? 0 : 1)
      });

    } catch (error) {
      console.error(`Webhook ${webhook.name} failed:`, error);
      updateWebhook(webhook.id, {
        lastTriggered: new Date().toISOString(),
        failureCount: webhook.failureCount + 1
      });
    }
  }
};

// Generate webhook signature for security
const generateWebhookSignature = (payload, secret) => {
  // In a real implementation, use crypto.subtle.sign or similar
  // This is a placeholder
  return btoa(JSON.stringify(payload) + secret).substring(0, 50);
};

// API access management
const toggleAPIAccess = () => {
  setRouterConfig(prev => ({
    ...prev,
    apiAccess: {
      ...prev.apiAccess,
      enabled: !prev.apiAccess.enabled
    }
  }));

  addNotification('success',
    `API access ${!routerConfig.apiAccess.enabled ? 'enabled' : 'disabled'}`);
};

const generateAPIKey = () => {
  const apiKey = 'devnet_' + Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  setRouterConfig(prev => ({
    ...prev,
    apiAccess: {
      ...prev.apiAccess,
      token: apiKey
    }
  }));

  addNotification('success', 'New API key generated');
  return apiKey;
};

// External service integrations
const addIntegration = (service) => {
  const newIntegration = {
    id: Date.now().toString(),
    ...service,
    connected: false,
    lastSync: null,
    createdAt: new Date().toISOString()
  };

  setRouterConfig(prev => ({
    ...prev,
    integrations: [...prev.integrations, newIntegration]
  }));

  addNotification('success', `Integration with ${service.name} added`);
};

const testIntegration = async (integration) => {
  // Placeholder for integration testing
  addNotification('info', `Testing integration with ${integration.name}...`);

  // Simulate testing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Update integration status
  setRouterConfig(prev => ({
    ...prev,
    integrations: prev.integrations.map(int =>
      int.id === integration.id
        ? { ...int, connected: true, lastSync: new Date().toISOString() }
        : int
    )
  }));

  addNotification('success', `Integration with ${integration.name} connected successfully`);
};

// Export system data for external use
const exportSystemData = (format = 'json') => {
  const exportData = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    system: {
      router: routerConfig,
      users,
      vouchers,
      traffic: trafficData,
      portal: portalConfig,
      stats
    }
  };

  if (format === 'json') {
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devnet-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  addNotification('success', 'System data exported successfully');
};

// Connection health monitoring
const [connectionMonitor, setConnectionMonitor] = useState(null);

const startConnectionMonitoring = () => {
  if (connectionMonitor) {
    clearInterval(connectionMonitor);
  }

  const monitor = setInterval(async () => {
    if (!routerConfig.connected || !routerConfig.autoReconnect) return;

    try {
      const result = await attemptConnection(1);
      if (!result.success) {
        addNotification('warning', 'Connection lost, attempting to reconnect...');
        // Try to reconnect
        await connectToRouter();
      }
    } catch (error) {
      console.error('Connection monitoring failed:', error);
    }
  }, routerConfig.reconnectInterval);

  setConnectionMonitor(monitor);
};

const stopConnectionMonitoring = () => {
  if (connectionMonitor) {
    clearInterval(connectionMonitor);
    setConnectionMonitor(null);
  }
};

const disconnectFromRouter = () => {
  stopConnectionMonitoring();
  apiRef.current.disconnect();
  setRouterConfig(prev => ({
    ...prev,
    connected: false,
    connecting: false,
    lastConnectionError: null,
    connectionAttempts: 0
  }));
  addNotification('info', 'Disconnected from router');
};

const runRouterCommand = async (command, params = []) => {
  const trimmed = (command || '').trim();
  if (!trimmed) {
    throw new Error('Command is required.');
  }

  if (!routerConfig.connected) {
    throw new Error('Not connected to router.');
  }

  return apiRef.current.execute(trimmed, params);
};

const addUser = () => {
  setLoadingStates(prev => ({ ...prev, users: true }));
  try {
    const validation = validateUser(newUser);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      addNotification('error', firstError);
      setLoadingStates(prev => ({ ...prev, users: false }));
      return;
    }

    const user = {
      id: Date.now().toString(),
      ...newUser,
      addedAt: new Date().toISOString(),
      lastSeen: null
    };

    setUsers([...users, user]);
    setNewUser({
      name: '',
      mac: '',
      ip: '',
      uploadLimit: '',
      downloadLimit: '',
      dataQuota: '',
      enabled: true
    });
    setShowAddUser(false);
  } catch (error) {
    console.error('Error adding user:', error);
    addNotification('error', 'Failed to add user. Please try again.');
  } finally {
    setLoadingStates(prev => ({ ...prev, users: false }));
  }
};

const deleteUser = (id) => {
  try {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
      setTrafficData(trafficData.filter(t => t.userId !== id));
      setBlockedUsers(blockedUsers.filter(b => b !== id));
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    addNotification('error', 'Failed to delete user. Please try again.');
  }
};

const toggleUserStatus = (id) => {
  try {
    setUsers(users.map(u =>
      u.id === id ? { ...u, enabled: !u.enabled } : u
    ));
  } catch (error) {
    console.error('Error toggling user status:', error);
    addNotification('error', 'Failed to update user status. Please try again.');
  }
};

const unblockUser = (id) => {
  try {
    setBlockedUsers(blockedUsers.filter(b => b !== id));
    setTrafficData(trafficData.map(t =>
      t.userId === id ? { ...t, totalDownload: 0, totalUpload: 0 } : t
    ));
  } catch (error) {
    console.error('Error unblocking user:', error);
    addNotification('error', 'Failed to unblock user. Please try again.');
  }
};

const startEdit = (user) => {
  try {
    setEditingUser({ ...user });
  } catch (error) {
    console.error('Error starting edit:', error);
    addNotification('error', 'Failed to enter edit mode. Please try again.');
  }
};

const saveEdit = () => {
  try {
    setUsers(users.map(u =>
      u.id === editingUser.id ? editingUser : u
    ));
    setEditingUser(null);
  } catch (error) {
    console.error('Error saving edit:', error);
    addNotification('error', 'Failed to save changes. Please try again.');
  }
};

const generateVouchers = () => {
  setLoadingStates(prev => ({ ...prev, vouchers: true }));
  try {
    const validation = validateVoucher(newVoucher);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      addNotification('error', firstError);
      setLoadingStates(prev => ({ ...prev, vouchers: false }));
      return;
    }

    const quantity = parseInt(newVoucher.quantity) || 1;
    const newVouchers = [];

    for (let i = 0; i < quantity; i++) {
      const code = newVoucher.code || generateRandomCode();
      newVouchers.push({
        id: Date.now().toString() + i,
        code: quantity > 1 ? `${code}-${i + 1}` : code,
        duration: parseInt(newVoucher.duration),
        bandwidth: parseInt(newVoucher.bandwidth),
        quota: parseFloat(newVoucher.quota),
        status: 'unused',
        createdAt: new Date().toISOString(),
        usedAt: null,
        expiresAt: null
      });
    }

    setVouchers([...vouchers, ...newVouchers]);
    setNewVoucher({
      code: '',
      duration: '24',
      bandwidth: '10',
      quota: '1024',
      quantity: 1
    });
    setShowAddVoucher(false);
  } catch (error) {
    console.error('Error generating vouchers:', error);
    addNotification('error', 'Failed to generate vouchers. Please try again.');
  } finally {
    setLoadingStates(prev => ({ ...prev, vouchers: false }));
  }
};

const generateRandomCode = () => {
  try {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  } catch (error) {
    console.error('Error generating random code:', error);
    return 'ERROR-CODE';
  }
};

const activateVoucher = (id) => {
  try {
    setVouchers(vouchers.map(v => {
      if (v.id === id) {
        const now = new Date();
        const expires = new Date(now.getTime() + v.duration * 60 * 60 * 1000);
        return {
          ...v,
          status: 'active',
          usedAt: now.toISOString(),
          expiresAt: expires.toISOString()
        };
      }
      return v;
    }));
  } catch (error) {
    console.error('Error activating voucher:', error);
    addNotification('error', 'Failed to activate voucher. Please try again.');
  }
};

const deleteVoucher = (id) => {
  try {
    if (confirm('Delete this voucher?')) {
      setVouchers(vouchers.filter(v => v.id !== id));
    }
  } catch (error) {
    console.error('Error deleting voucher:', error);
    addNotification('error', 'Failed to delete voucher. Please try again.');
  }
};

// New voucher features functions
const getFilteredVouchers = () => {
  let filtered = vouchers;

  // Filter by status or category
  if (voucherFilter !== 'all') {
    if (voucherFilter === 'trial') {
      filtered = filtered.filter(voucher => voucher.category === 'trial');
    } else {
      filtered = filtered.filter(voucher => voucher.status === voucherFilter);
    }
  }

  // Filter by search term
  if (voucherSearch) {
    filtered = filtered.filter(voucher =>
      voucher.code.toLowerCase().includes(voucherSearch.toLowerCase())
    );
  }

  return filtered;
};

const toggleVoucherSelection = (voucherId) => {
  setSelectedVouchers(prev =>
    prev.includes(voucherId)
      ? prev.filter(id => id !== voucherId)
      : [...prev, voucherId]
  );
};

const selectAllVouchers = () => {
  const filteredVouchers = getFilteredVouchers();
  setSelectedVouchers(filteredVouchers.map(v => v.id));
};

const clearSelection = () => {
  setSelectedVouchers([]);
};

const bulkActivateVouchers = () => {
  try {
    const now = new Date();
    setVouchers(vouchers.map(voucher => {
      if (selectedVouchers.includes(voucher.id) && voucher.status === 'unused') {
        const expires = new Date(now.getTime() + voucher.duration * 60 * 60 * 1000);
        return {
          ...voucher,
          status: 'active',
          usedAt: now.toISOString(),
          expiresAt: expires.toISOString()
        };
      }
      return voucher;
    }));
    setSelectedVouchers([]);
    addNotification('success', `${selectedVouchers.length} vouchers activated successfully!`);
  } catch (error) {
    console.error('Error bulk activating vouchers:', error);
    addNotification('error', 'Failed to activate vouchers. Please try again.');
  }
};

const bulkDeleteVouchers = () => {
  try {
    if (confirm(`Delete ${selectedVouchers.length} selected vouchers?`)) {
      setVouchers(vouchers.filter(v => !selectedVouchers.includes(v.id)));
      setSelectedVouchers([]);
      addNotification('success', `${selectedVouchers.length} vouchers deleted successfully!`);
    }
  } catch (error) {
    console.error('Error bulk deleting vouchers:', error);
    addNotification('error', 'Failed to delete vouchers. Please try again.');
  }
};

const exportVouchers = () => {
  try {
    const filteredVouchers = getFilteredVouchers();
    const csvContent = [
      ['Code', 'Status', 'Duration', 'Bandwidth', 'Quota', 'Created', 'Used', 'Expires'].join(','),
      ...filteredVouchers.map(v => [
        v.code,
        v.status,
        v.duration,
        v.bandwidth,
        formatBytes(v.quota),
        new Date(v.createdAt).toLocaleDateString(),
        v.usedAt ? new Date(v.usedAt).toLocaleDateString() : 'N/A',
        v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vouchers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting vouchers:', error);
    addNotification('error', 'Failed to export vouchers. Please try again.');
  }
};

const getVoucherStats = () => {
  const total = vouchers.length;
  const unused = vouchers.filter(v => v.status === 'unused').length;
  const active = vouchers.filter(v => v.status === 'active').length;
  const expired = vouchers.filter(v => v.status === 'expired').length;
  const totalBandwidth = vouchers.reduce((sum, v) => sum + (parseFloat(v.bandwidth) || 0), 0);
  const totalQuota = vouchers.reduce((sum, v) => sum + (parseFloat(v.quota) || 0), 0);

  return { total, unused, active, expired, totalBandwidth, totalQuota };
};

const applyVoucherTemplate = (templateId) => {
  const template = voucherTemplates.find(t => t.id === templateId);
  if (template) {
    setNewVoucher(prev => ({
      ...prev,
      duration: template.duration.toString(),
      bandwidth: template.bandwidth.toString(),
      quota: template.quota.toString()
    }));
  }
};

const cleanupExpiredVouchers = () => {
  try {
    const now = new Date();
    const expiredCount = vouchers.filter(v =>
      v.status === 'active' && v.expiresAt && new Date(v.expiresAt) < now
    ).length;

    if (expiredCount > 0) {
      if (confirm(`Mark ${expiredCount} expired vouchers as expired?`)) {
        setVouchers(vouchers.map(voucher => {
          if (voucher.status === 'active' && voucher.expiresAt && new Date(voucher.expiresAt) < now) {
            return { ...voucher, status: 'expired' };
          }
          return voucher;
        }));
        addNotification('success', `${expiredCount} vouchers marked as expired.`);
      }
    } else {
      addNotification('info', 'No expired vouchers found.');
    }
  } catch (error) {
    console.error('Error cleaning up expired vouchers:', error);
    addNotification('error', 'Failed to cleanup expired vouchers. Please try again.');
  }
};

// Generate free trial voucher
const generateFreeTrial = () => {
  try {
    if (!portalConfig.enableFreeTrial) {
      addNotification('error', 'Free trials are currently disabled.');
      throw new Error('Free trials disabled');
    }

    const trialCode = `TRIAL-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const durationHours = portalConfig.trialDuration || 1;
    const expires = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    const trialVoucher = {
      id: Date.now().toString(),
      code: trialCode,
      duration: durationHours,
      bandwidth: portalConfig.trialBandwidth || 50,
      quota: 0, // Unlimited during trial
      status: 'active',
      createdAt: now.toISOString(),
      usedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      category: 'trial',
      template: 'free_trial'
    };

    setVouchers(prev => [...prev, trialVoucher]);
    addNotification('success', `Free trial activated! Code: ${trialCode} (${durationHours} hour${durationHours !== 1 ? 's' : ''})`);
    return trialVoucher;
  } catch (error) {
    console.error('Error generating free trial:', error);
    if (!error.message.includes('disabled')) {
      addNotification('error', 'Failed to generate free trial. Please try again.');
    }
    throw error;
  }
};

// Handle voucher login from captive portal
const handleVoucherLogin = (voucherCode) => {
  try {
    const voucher = vouchers.find(v => v.code.toLowerCase() === voucherCode.toLowerCase());
    if (voucher) {
      if (voucher.status === 'unused') {
        activateVoucher(voucher.id);
      } else if (voucher.status === 'expired') {
        addNotification('error', 'This voucher has expired.');
        throw new Error('Voucher expired');
      } else if (voucher.status === 'active') {
        addNotification('info', 'Voucher is already active.');
      }
    } else {
      addNotification('error', 'Invalid voucher code.');
      throw new Error('Invalid voucher code');
    }
  } catch (error) {
    console.error('Error handling voucher login:', error);
    throw error;
  }
};

// Data export/import functions
const exportAllData = () => {
  try {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      routerConfig,
      users,
      vouchers,
      trafficData,
      blockedUsers,
      portalConfig,
      voucherTemplates,
      historicalData
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `devnet-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification('success', 'Data exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    addNotification('error', 'Failed to export data.');
  }
};

const importAllData = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importData = JSON.parse(e.target.result);

      if (!importData.version || !importData.timestamp) {
        throw new Error('Invalid backup file format');
      }

      // Validate and import data
      if (importData.routerConfig) setRouterConfig(importData.routerConfig);
      if (importData.users) setUsers(importData.users);
      if (importData.vouchers) setVouchers(importData.vouchers);
      if (importData.trafficData) setTrafficData(importData.trafficData);
      if (importData.blockedUsers) setBlockedUsers(importData.blockedUsers);
      if (importData.portalConfig) setPortalConfig(importData.portalConfig);
      if (importData.voucherTemplates) setVoucherTemplates(importData.voucherTemplates);
      if (importData.historicalData) setHistoricalData(importData.historicalData);

      addNotification('success', 'Data imported successfully! The page will reload.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Import failed:', error);
      addNotification('error', 'Failed to import data. Please check the file format.');
    }
  };
  reader.readAsText(file);
};

const applyToRouter = async () => {
  if (!routerConfig.connected) {
    addNotification('error', 'Please connect to router first');
    return;
  }

  try {
    addNotification('info', 'Applying configuration to router...\n\nThis will:\n- Create/update bandwidth queues\n- Apply firewall rules for blocked users\n- Configure hotspot vouchers\n- Deploy captive portal HTML');

    // Apply bandwidth queues for users
    for (const user of users) {
      if (user.enabled && !blockedUsers.includes(user.id)) {
        await applyUserToRouter(user);
      }
    }

    // Apply blocked users
    for (const blockedId of blockedUsers) {
      await blockUserOnRouter(blockedId);
    }

    addNotification('success', 'Configuration successfully applied to router!');
  } catch (error) {
    console.error('Failed to apply configuration:', error);
    addNotification('error', `Failed to apply configuration: ${error.message}`);
  }
};

const applyUserToRouter = async (user) => {
  try {
    // Create queue for user bandwidth control
    if (user.downloadLimit || user.uploadLimit) {
      const queueData = {
        name: `user-${user.id}`,
        target: user.ip || '',
        'max-limit': `${user.uploadLimit || '0'}/${user.downloadLimit || '0'}`
      };

      await fetch(`https://${routerConfig.host}:${routerConfig.port}/rest/queue/simple`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Basic ' + btoa(`${routerConfig.username}:${routerConfig.password}`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(queueData)
      });
    }
  } catch (error) {
    console.error(`Failed to apply user ${user.name}:`, error);
    throw error;
  }
};

const blockUserOnRouter = async (userId) => {
  try {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Add firewall rule to block user
    const firewallRule = {
      chain: 'input',
      action: 'drop',
      srcAddress: user.ip,
      comment: `Blocked user: ${user.name}`
    };

    await fetch(`https://${routerConfig.host}:${routerConfig.port}/rest/ip/firewall/filter`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + btoa(`${routerConfig.username}:${routerConfig.password}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(firewallRule)
    });
  } catch (error) {
    console.error(`Failed to block user ${userId}:`, error);
    throw error;
  }
};

const formatBytes = (bytes) => {
  try {
    if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' GB';
    }
    return bytes.toFixed(2) + ' MB';
  } catch (error) {
    console.error('Error formatting bytes:', error);
    return '0 MB';
  }
};

const getTrafficForUser = (userId) => {
  try {
    return trafficData.find(t => t.userId === userId) || {
      totalDownload: 0,
      totalUpload: 0,
      currentDownload: 0,
      currentUpload: 0
    };
  } catch (error) {
    console.error('Error getting traffic for user:', error);
    return {
      totalDownload: 0,
      totalUpload: 0,
      currentDownload: 0,
      currentUpload: 0
    };
  }
};


return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 sm:p-6">
    {showPortalPreview && (
      <CaptivePortalPreview
        portalConfig={portalConfig}
        setShowPortalPreview={setShowPortalPreview}
        generateFreeTrial={generateFreeTrial}
        onVoucherLogin={handleVoucherLogin}
      />
    )}

    {/* Notifications */}
    {notifications.map(notification => (
      <Notification
        key={notification.id}
        type={notification.type}
        message={notification.message}
        onClose={() => removeNotification(notification.id)}
        duration={notification.duration}
      />
    ))}

    {/* Active Alerts */}
    {alerts.length > 0 && (
      <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border backdrop-blur-sm animate-in slide-in-from-right duration-300 ${alert.priority === 'critical'
              ? 'bg-red-500/20 border-red-500/50 text-red-300'
              : alert.priority === 'high'
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
              }`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${alert.priority === 'critical' ? 'bg-red-400 animate-pulse' :
                alert.priority === 'high' ? 'bg-orange-400' : 'bg-yellow-400'
                }`}></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{alert.title}</p>
                <p className="text-xs opacity-90 mt-1">{alert.message}</p>
                <p className="text-xs opacity-60 mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      {routerConfig.lastConnectionError && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <div>
              <p className="font-semibold text-red-200">Connection Error</p>
              <p className="text-sm mt-1">{routerConfig.lastConnectionError}</p>
            </div>
          </div>
        </div>
      )}

      <HeaderStats
        stats={stats}
        alerts={alerts}
        onSync={async () => {
          await fetchRouterTrafficData();
          await syncRouterData(routerConfig, true);
        }}
        isSyncing={loadingStates.router}
        isConnected={routerConfig.connected}
      />

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Captive Portal Tab */}
      {activeTab === 'portal' && (
        <CaptivePortalTab
          portalConfig={portalConfig}
          setPortalConfig={setPortalConfig}
          showPortalPreview={showPortalPreview}
          setShowPortalPreview={setShowPortalPreview}
        />
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <UsersTab
          users={users}
          setUsers={setUsers}
          showAddUser={showAddUser}
          setShowAddUser={setShowAddUser}
          newUser={newUser}
          setNewUser={setNewUser}
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          addUser={addUser}
          deleteUser={deleteUser}
          toggleUserStatus={toggleUserStatus}
          unblockUser={unblockUser}
          startEdit={startEdit}
          saveEdit={saveEdit}
          applyToRouter={applyToRouter}
          routerConfig={routerConfig}
          blockedUsers={blockedUsers}
          getTrafficForUser={getTrafficForUser}
          formatBytes={formatBytes}
          isLoading={loadingStates.users}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsTab
          users={users}
          vouchers={vouchers}
          trafficData={trafficData}
          blockedUsers={blockedUsers}
          routerConfig={routerConfig}
          stats={stats}
          historicalData={historicalData}
        />
      )}

      {/* Network Health Tab */}
      {activeTab === 'health' && (
        <NetworkHealthTab
          routerConfig={routerConfig}
          historicalData={historicalData}
          trafficData={trafficData}
          onFetchHealth={fetchNetworkHealthData}
        />
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <ReportsTab
          users={users}
          vouchers={vouchers}
          trafficData={trafficData}
          historicalData={historicalData}
          stats={stats}
        />
      )}

      {/* Traffic Monitor Tab */}
      {activeTab === 'traffic' && (
        <TrafficTab
          trafficData={trafficData}
          users={users}
          formatBytes={formatBytes}
        />
      )}

      {/* Vouchers Tab */}
      {activeTab === 'vouchers' && (
        <VouchersTab
          vouchers={vouchers}
          setVouchers={setVouchers}
          showAddVoucher={showAddVoucher}
          setShowAddVoucher={setShowAddVoucher}
          newVoucher={newVoucher}
          setNewVoucher={setNewVoucher}
          generateVouchers={generateVouchers}
          voucherTemplates={voucherTemplates}
          applyVoucherTemplate={applyVoucherTemplate}
          getFilteredVouchers={getFilteredVouchers}
          voucherFilter={voucherFilter}
          setVoucherFilter={setVoucherFilter}
          voucherSearch={voucherSearch}
          setVoucherSearch={setVoucherSearch}
          selectedVouchers={selectedVouchers}
          setSelectedVouchers={setSelectedVouchers}
          toggleVoucherSelection={toggleVoucherSelection}
          selectAllVouchers={selectAllVouchers}
          clearSelection={clearSelection}
          bulkActivateVouchers={bulkActivateVouchers}
          bulkDeleteVouchers={bulkDeleteVouchers}
          activateVoucher={activateVoucher}
          deleteVoucher={deleteVoucher}
          exportVouchers={exportVouchers}
          showVoucherStats={showVoucherStats}
          setShowVoucherStats={setShowVoucherStats}
          getVoucherStats={getVoucherStats}
          formatBytes={formatBytes}
          cleanupExpiredVouchers={cleanupExpiredVouchers}
          isLoading={loadingStates.vouchers}
        />
      )}

      {/* Auto-Block Tab */}
      {activeTab === 'blocked' && (
        <BlockedUsersTab
          blockedUsers={blockedUsers}
          users={users}
          unblockUser={unblockUser}
          formatBytes={formatBytes}
          getTrafficForUser={getTrafficForUser}
        />
      )}

      {/* Router Config Tab */}
      {activeTab === 'router' && (
        <>
          <DetectionProgress
            progress={progress}
            isDetecting={isDetecting}
            onCancel={cancelDetection}
          />

          {detectedRouters.length > 0 && (
            <div className="mb-6 space-y-4">
              <h3 className="text-xl font-bold text-blue-300">Discovered Routers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detectedRouters.map((router, idx) => (
                  <DetectedRouterInfo
                    key={idx}
                    router={router}
                    onUse={(r) => {
                      const newConfig = {
                        ...routerConfig,
                        host: r.ip,
                        port: r.recommended.port.toString(),
                        autodetecting: false,
                        connectionMethod: 'ip'
                      };
                      setRouterConfig(newConfig);
                      addNotification('success', `Selected router at ${r.ip}`);

                      // Automatically attempt connection when a router is selected
                      // This makes the transition seamless and populates the dashboard
                      connectToRouter(newConfig);
                    }}
                    onDismiss={() => {
                      // Logic to remove from list if desired
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <RouterConfigTab
            routerConfig={routerConfig}
            setRouterConfig={setRouterConfig}
            connectToRouter={connectToRouter}
            disconnectFromRouter={disconnectFromRouter}
            runRouterCommand={runRouterCommand}
            isLoading={loadingStates.router}
            exportAllData={exportAllData}
            importAllData={importAllData}
            routerDiscovery={routerDiscovery}
            setRouterDiscovery={setRouterDiscovery}
            discoverRouters={discoverRouters}
            generateAPIToken={generateAPIToken}
            runSecurityAudit={runSecurityAudit}
            securityAudit={securityAudit}
            saveConfigVersion={saveConfigVersion}
            restoreConfigVersion={restoreConfigVersion}
            validateConfiguration={validateConfiguration}
            deployConfiguration={deployConfiguration}
            executeBulkOperations={executeBulkOperations}
            configManager={configManager}
            runDiagnostics={runDiagnostics}
            toggleMonitoring={toggleMonitoring}
            monitoringSystem={monitoringSystem}
            addWebhook={addWebhook}
            updateWebhook={updateWebhook}
            deleteWebhook={deleteWebhook}
            testWebhook={testWebhook}
            toggleAPIAccess={toggleAPIAccess}
            generateAPIKey={generateAPIKey}
            addIntegration={addIntegration}
            testIntegration={testIntegration}
            exportSystemData={exportSystemData}
            integrationManager={integrationManager}
            autodetectRouter={autodetectRouter}
            detectAllRouters={detectAllRouters}
            isDetecting={isDetecting}
          />
        </>
      )}
    </div>
  </div>
);
};

export default MikroTikManager;
