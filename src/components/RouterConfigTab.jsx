import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const RouterConfigTab = ({
  routerConfig,
  setRouterConfig,
  connectToRouter,
  disconnectFromRouter,
  runRouterCommand,
  isLoading,
  exportAllData,
  importAllData,
  routerDiscovery,
  setRouterDiscovery,
  discoverRouters,
  generateAPIToken,
  runSecurityAudit,
  securityAudit,
  saveConfigVersion,
  restoreConfigVersion,
  validateConfiguration,
  deployConfiguration,
  executeBulkOperations,
  configManager,
  runDiagnostics,
  toggleMonitoring,
  monitoringSystem,
  addWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  toggleAPIAccess,
  generateAPIKey,
  addIntegration,
  testIntegration,
  exportSystemData,
  integrationManager,
  autodetectRouter,
  detectAllRouters,
  isDetecting
}) => {
  const [commandInput, setCommandInput] = useState('/system/resource/print');
  const [paramsInput, setParamsInput] = useState('');
  const [commandOutput, setCommandOutput] = useState(null);
  const [commandError, setCommandError] = useState(null);
  const [commandRunning, setCommandRunning] = useState(false);

  const quickCommands = [
    '/system/identity/print',
    '/system/resource/print',
    '/interface/print',
    '/ip/address/print'
  ];

  const formatCommandOutput = (output) => {
    if (output === null || output === undefined) return '';
    if (typeof output === 'string') return output;
    return JSON.stringify(output, null, 2);
  };

  const handleRunCommand = async () => {
    setCommandError(null);
    setCommandOutput(null);

    const command = commandInput.trim();
    if (!command) {
      setCommandError('Command is required.');
      return;
    }

    if (!routerConfig.connected) {
      setCommandError('Connect to the router before running commands.');
      return;
    }

    if (!runRouterCommand) {
      setCommandError('Command runner is not available.');
      return;
    }

    let parsedParams = [];
    if (paramsInput.trim()) {
      try {
        parsedParams = JSON.parse(paramsInput);
        const isObject = parsedParams !== null && typeof parsedParams === 'object';
        if (!isObject) {
          throw new Error('Params must be a JSON object or array.');
        }
      } catch (error) {
        setCommandError(error.message || 'Params must be valid JSON.');
        return;
      }
    }

    setCommandRunning(true);
    try {
      const result = await runRouterCommand(command, parsedParams);
      setCommandOutput(result);
    } catch (error) {
      setCommandError(error.message || 'Command failed.');
    } finally {
      setCommandRunning(false);
    }
  };

  const handleClearCommand = () => {
    setCommandOutput(null);
    setCommandError(null);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 sm:p-6 animate-in fade-in duration-300 shadow-2xl shadow-slate-900/50">
      <h2 className="text-2xl font-bold mb-6">Router Configuration</h2>

      <div className="space-y-4 max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-blue-200 mb-2 font-semibold">Connection Method</label>
            <div className="flex p-1 bg-white/10 rounded-lg border border-white/20">
              <button
                onClick={() => setRouterConfig({ ...routerConfig, connectionMethod: 'ip' })}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-semibold ${routerConfig.connectionMethod === 'ip' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/5 text-blue-300'
                  }`}
              >
                IP Address
              </button>
              <button
                onClick={() => setRouterConfig({ ...routerConfig, connectionMethod: 'mac' })}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-semibold ${routerConfig.connectionMethod === 'mac' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/5 text-blue-300'
                  }`}
              >
                MAC Address
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <button
              onClick={autodetectRouter}
              disabled={routerConfig.autodetecting || isDetecting}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 group ${routerConfig.autodetecting || (isDetecting && !routerConfig.autodetecting)
                ? 'bg-blue-900/50 cursor-not-allowed text-blue-300'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                }`}
            >
              {routerConfig.autodetecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Autodetecting...
                </>
              ) : (
                <>
                  <span className="text-xl group-hover:rotate-12 transition-transform">🔍</span>
                  Autodetect First
                </>
              )}
            </button>

            <button
              onClick={() => detectAllRouters({ scanRange: routerDiscovery.scanRange })}
              disabled={isDetecting || routerConfig.autodetecting}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 group ${(isDetecting || routerConfig.autodetecting)
                ? 'bg-purple-900/50 cursor-not-allowed text-purple-300'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 active:scale-95'
                }`}
            >
              {isDetecting && !routerConfig.autodetecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Scanning All...
                </>
              ) : (
                <>
                  <span className="text-xl group-hover:scale-110 transition-transform">🌐</span>
                  Detect All Routers
                </>
              )}
            </button>
          </div>
        </div>

        {routerConfig.connectionMethod === 'ip' ? (
          <div>
            <label className="block text-blue-200 mb-2">Router IP Address</label>
            <input
              type="text"
              placeholder="192.168.88.1"
              value={routerConfig.host}
              onChange={(e) => setRouterConfig({ ...routerConfig, host: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
            />
          </div>
        ) : (
          <div>
            <label className="block text-blue-200 mb-2">Router MAC Address</label>
            <input
              type="text"
              placeholder="48:8F:5A:XX:XX:XX"
              value={routerConfig.macAddress}
              onChange={(e) => setRouterConfig({ ...routerConfig, macAddress: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200 font-mono"
            />
            <p className="text-xs text-blue-300/60 mt-1 italic">
              * Note: MAC connection requires an active network scan to resolve IP address
            </p>
          </div>
        )}

        <div>
          <label className="block text-blue-200 mb-2">Username</label>
          <input
            type="text"
            placeholder="admin"
            value={routerConfig.username}
            onChange={(e) => setRouterConfig({ ...routerConfig, username: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-blue-200 mb-2">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={routerConfig.password}
            onChange={(e) => setRouterConfig({ ...routerConfig, password: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-blue-200 mb-2">RouterOS API Port</label>
          <input
            type="text"
            placeholder="8728"
            value={routerConfig.port}
            onChange={(e) => setRouterConfig({ ...routerConfig, port: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
          />
        </div>

        {/* Connect Action Button */}
        <div className="mt-8 pt-4 border-t border-white/10">
          {!routerConfig.connected ? (
            <button
              onClick={() => connectToRouter()}
              disabled={routerConfig.connecting || isLoading}
              className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${routerConfig.connecting || isLoading
                ? 'bg-blue-900/50 cursor-not-allowed text-blue-300'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-blue-500/25 active:scale-95'
                }`}
            >
              {routerConfig.connecting || isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Connecting to Router...
                </>
              ) : (
                <>
                  <span className="text-2xl">🔗</span>
                  Connect to Router
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <div>
                    <div className="font-bold text-green-300">Connected</div>
                    <div className="text-xs text-green-400/80">
                      {routerConfig.host} via {routerConfig.connectionMethod === 'mac' ? 'MAC' : 'IP'}
                    </div>
                  </div>
                </div>
                <div className="text-2xl">✅</div>
              </div>

              <button
                onClick={disconnectFromRouter}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-600/50 rounded-lg">
          <h3 className="font-bold mb-2 text-slate-200">Router Command Runner</h3>
          <p className="text-xs text-slate-400">
            Run RouterOS API commands through the backend bridge. Use read-only commands unless you know what you are doing.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => setCommandInput(cmd)}
                className="px-3 py-1 text-xs rounded bg-slate-700/60 hover:bg-slate-700 text-slate-200 transition"
              >
                {cmd}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-slate-300 mb-2 font-semibold">Command</label>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="/system/resource/print"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-slate-400 font-mono"
            />
          </div>

          <div className="mt-4">
            <label className="block text-slate-300 mb-2 font-semibold">Params (optional JSON)</label>
            <textarea
              value={paramsInput}
              onChange={(e) => setParamsInput(e.target.value)}
              placeholder='{"count-only": "true"}'
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-slate-400 font-mono"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRunCommand}
              disabled={commandRunning}
              className={`px-4 py-2 rounded-lg font-semibold transition ${commandRunning
                ? 'bg-slate-700 cursor-not-allowed text-slate-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {commandRunning ? 'Running...' : 'Run Command'}
            </button>
            <button
              type="button"
              onClick={handleClearCommand}
              className="px-4 py-2 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
            >
              Clear Output
            </button>
          </div>

          {commandError && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-300">
              {commandError}
            </div>
          )}

          {commandOutput !== null && (
            <pre className="mt-3 p-3 bg-slate-900/60 border border-slate-700/60 rounded text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap">
              {formatCommandOutput(commandOutput)}
            </pre>
          )}
        </div>

        {/* Advanced Connection Settings */}
        <div className="mt-8 p-4 bg-slate-800/50 border border-slate-600/50 rounded-lg">
          <h3 className="font-bold mb-4 text-slate-200 flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            Advanced Connection Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Connection Timeout (seconds)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={routerConfig.connectionTimeout / 1000}
                onChange={(e) => setRouterConfig({ ...routerConfig, connectionTimeout: parseInt(e.target.value) * 1000 })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Max Retries</label>
              <input
                type="number"
                min="1"
                max="10"
                value={routerConfig.maxRetries}
                onChange={(e) => setRouterConfig({ ...routerConfig, maxRetries: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Retry Delay (seconds)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={routerConfig.retryDelay / 1000}
                onChange={(e) => setRouterConfig({ ...routerConfig, retryDelay: parseInt(e.target.value) * 1000 })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-semibold">Reconnect Interval (seconds)</label>
              <input
                type="number"
                min="10"
                max="300"
                value={routerConfig.reconnectInterval / 1000}
                onChange={(e) => setRouterConfig({ ...routerConfig, reconnectInterval: parseInt(e.target.value) * 1000 })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sslValidation"
                checked={routerConfig.sslValidation}
                onChange={(e) => setRouterConfig({ ...routerConfig, sslValidation: e.target.checked })}
                className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <label htmlFor="sslValidation" className="text-slate-300 font-semibold">
                SSL Certificate Validation
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoReconnect"
                checked={routerConfig.autoReconnect}
                onChange={(e) => setRouterConfig({ ...routerConfig, autoReconnect: e.target.checked })}
                className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoReconnect" className="text-slate-300 font-semibold">
                Auto-Reconnect on Connection Loss
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableSecurityAudit"
                checked={routerConfig.enableSecurityAudit}
                onChange={(e) => setRouterConfig({ ...routerConfig, enableSecurityAudit: e.target.checked })}
                className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableSecurityAudit" className="text-slate-300 font-semibold">
                Enable Security Auditing
              </label>
            </div>
          </div>

          {/* Authentication Method */}
          <div className="mt-4">
            <label className="block text-slate-300 mb-2 font-semibold">Authentication Method</label>
            <select
              value={routerConfig.authMethod}
              onChange={(e) => setRouterConfig({ ...routerConfig, authMethod: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-slate-400"
            >
              <option value="basic">Basic Authentication (Username/Password)</option>
              <option value="token">API Token (Recommended)</option>
              <option value="certificate">Client Certificate (Advanced)</option>
            </select>
          </div>

          {/* API Token Section */}
          {routerConfig.authMethod === 'token' && (
            <div className="mt-4">
              <label className="block text-slate-300 mb-2 font-semibold">API Token</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={routerConfig.apiToken}
                  onChange={(e) => setRouterConfig({ ...routerConfig, apiToken: e.target.value })}
                  placeholder="Enter API token or generate new one"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-slate-400 font-mono"
                />
                <button
                  onClick={generateAPIToken}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                API tokens are more secure than basic authentication for API access
              </p>
            </div>
          )}

          {/* Security Audit */}
          <div className="mt-4 pt-4 border-t border-slate-600/50">
            <button
              onClick={runSecurityAudit}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              🔒 Run Security Audit
            </button>
            {routerConfig.lastSecurityCheck && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                Last audit: {new Date(routerConfig.lastSecurityCheck).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Router Discovery */}
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <h3 className="font-bold mb-4 text-purple-300 flex items-center gap-2">
            <span className="text-xl">🔍</span>
            Router Discovery
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">Network Range to Scan</label>
              <input
                type="text"
                placeholder="192.168.100.0/24"
                value={routerDiscovery.scanRange}
                onChange={(e) => setRouterDiscovery({ ...routerDiscovery, scanRange: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
              />
              <p className="text-xs text-purple-300 mt-1">
                Common ranges: 192.168.1.0/24, 192.168.0.0/24, 10.0.0.0/24
              </p>
            </div>

            <button
              onClick={discoverRouters}
              disabled={routerDiscovery.scanning}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${routerDiscovery.scanning
                ? 'bg-purple-700 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-105'
                }`}
            >
              {routerDiscovery.scanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Scanning... ({routerDiscovery.scanProgress}%)
                </>
              ) : (
                <>
                  🔍 Discover Routers
                </>
              )}
            </button>

            {routerDiscovery.lastScanTime && (
              <p className="text-xs text-purple-300">
                Last scan: {new Date(routerDiscovery.lastScanTime).toLocaleString()}
              </p>
            )}
          </div>

          {/* Discovered Routers */}
          {routerDiscovery.discoveredRouters.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-purple-200 mb-2">Discovered Routers:</h4>
              <div className="space-y-2">
                {routerDiscovery.discoveredRouters.map((router, index) => (
                  <div key={index} className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-purple-300">{router.ip}</div>
                        <div className="text-xs text-purple-400">
                          {router.details.type === 'rest-api' && `REST API (Port ${router.details.port})`}
                          {router.details.type === 'winbox' && `Winbox (Port ${router.details.port})`}
                          {router.details.type === 'api' && `API (Port ${router.details.port})`}
                          {router.details.identity && ` - ${router.details.identity}`}
                        </div>
                      </div>
                      <button
                        onClick={() => setRouterConfig({ ...routerConfig, host: router.ip })}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition"
                      >
                        Use This IP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Audit Results */}
        {securityAudit.lastAudit && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h3 className="font-bold mb-4 text-red-300 flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              Security Audit Results
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${securityAudit.securityScore >= 80 ? 'text-green-400' :
                  securityAudit.securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                  {securityAudit.securityScore}/100
                </div>
                <div className="text-sm text-red-300">Security Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {securityAudit.vulnerabilities.length}
                </div>
                <div className="text-sm text-red-300">Vulnerabilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {securityAudit.recommendations.length}
                </div>
                <div className="text-sm text-yellow-300">Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-red-300">Last Audit</div>
                <div className="text-xs text-red-400">
                  {new Date(securityAudit.lastAudit).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Vulnerabilities */}
            {securityAudit.vulnerabilities.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-300 mb-2">🔴 Critical Issues:</h4>
                <div className="space-y-2">
                  {securityAudit.vulnerabilities.map((issue, index) => (
                    <div key={index} className={`p-3 rounded border ${issue.severity === 'critical' ? 'bg-red-500/20 border-red-500/50' :
                      issue.severity === 'high' ? 'bg-orange-500/20 border-orange-500/50' :
                        'bg-yellow-500/20 border-yellow-500/50'
                      }`}>
                      <div className="font-semibold text-white">{issue.title}</div>
                      <div className="text-sm text-gray-300 mt-1">{issue.description}</div>
                      <div className="text-sm text-blue-300 mt-2">
                        💡 {issue.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {securityAudit.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">💡 Recommendations:</h4>
                <div className="space-y-2">
                  {securityAudit.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 rounded bg-yellow-500/10 border border-yellow-500/30">
                      <div className="font-semibold text-white">{rec.title}</div>
                      <div className="text-sm text-gray-300 mt-1">{rec.description}</div>
                      <div className="text-sm text-blue-300 mt-2">
                        🔧 {rec.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration Management */}
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <h3 className="font-bold mb-4 text-green-300 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Configuration Management
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => saveConfigVersion('Manual save')}
              className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">💾</div>
              <div className="font-semibold">Save Version</div>
              <div className="text-sm opacity-90">Create configuration snapshot</div>
            </button>

            <button
              onClick={validateConfiguration}
              disabled={configManager.validating}
              className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">{configManager.validating ? '⏳' : '✓'}</div>
              <div className="font-semibold">
                {configManager.validating ? 'Validating...' : 'Validate Config'}
              </div>
              <div className="text-sm opacity-90">Check configuration integrity</div>
            </button>

            <button
              onClick={deployConfiguration}
              disabled={!routerConfig.connected || configManager.deploying}
              className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-700 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">{configManager.deploying ? '🚀' : '📤'}</div>
              <div className="font-semibold">
                {configManager.deploying ? 'Deploying...' : 'Deploy to Router'}
              </div>
              <div className="text-sm opacity-90">Apply configuration to router</div>
            </button>

            <button
              onClick={executeBulkOperations}
              disabled={routerConfig.bulkOperations.filter(op => op.status === 'pending').length === 0}
              className="p-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-700 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold">Execute Bulk Ops</div>
              <div className="text-sm opacity-90">
                {routerConfig.bulkOperations.filter(op => op.status === 'pending').length} pending
              </div>
            </button>
          </div>

          {/* Validation Results */}
          {configManager.validationResults && (
            <div className="mt-4 p-3 rounded bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-green-300">Validation Results</span>
                <span className={`px-2 py-1 rounded text-xs ${configManager.validationResults.passed ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                  {configManager.validationResults.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <div className="text-sm space-y-1">
                {configManager.validationResults.issues.length > 0 && (
                  <div className="text-red-300">
                    🔴 {configManager.validationResults.issues.length} issue{configManager.validationResults.issues.length !== 1 ? 's' : ''}
                  </div>
                )}
                {configManager.validationResults.warnings.length > 0 && (
                  <div className="text-yellow-300">
                    ⚠️ {configManager.validationResults.warnings.length} warning{configManager.validationResults.warnings.length !== 1 ? 's' : ''}
                  </div>
                )}
                <div className="text-gray-400 text-xs">
                  Last validation: {new Date(configManager.validationResults.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Configuration History */}
          {routerConfig.configHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-green-300 mb-2">Recent Versions:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {routerConfig.configHistory.slice(0, 5).map((version, index) => (
                  <div key={version.version} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                    <div>
                      <div className="font-mono text-sm text-green-300">{version.version}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(version.timestamp).toLocaleString()} - {version.description}
                      </div>
                    </div>
                    <button
                      onClick={() => restoreConfigVersion(version.version)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Diagnostics & Monitoring */}
        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <h3 className="font-bold mb-4 text-indigo-300 flex items-center gap-2">
            <span className="text-xl">🔍</span>
            Diagnostics & Monitoring
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <button
              onClick={runDiagnostics}
              disabled={monitoringSystem.runningDiagnostics}
              className="p-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-700 rounded-lg transition text-center"
            >
              <div className="text-2xl mb-2">{monitoringSystem.runningDiagnostics ? '⏳' : '🔬'}</div>
              <div className="font-semibold">
                {monitoringSystem.runningDiagnostics ? 'Running...' : 'Run Diagnostics'}
              </div>
              <div className="text-sm opacity-90">Comprehensive system check</div>
            </button>

            <button
              onClick={toggleMonitoring}
              className={`p-4 rounded-lg transition text-center ${monitoringSystem.active
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              <div className="text-2xl mb-2">{monitoringSystem.active ? '⏹️' : '▶️'}</div>
              <div className="font-semibold">
                {monitoringSystem.active ? 'Stop Monitoring' : 'Start Monitoring'}
              </div>
              <div className="text-sm opacity-90">Continuous system monitoring</div>
            </button>
          </div>

          {/* Diagnostic Results */}
          {monitoringSystem.diagnosticResults && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-indigo-300">Diagnostic Results</h4>
                <span className={`px-3 py-1 rounded text-sm ${monitoringSystem.diagnosticResults.overall === 'healthy' ? 'bg-green-500/20 text-green-300' :
                  monitoringSystem.diagnosticResults.overall === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                  {monitoringSystem.diagnosticResults.overall.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                {monitoringSystem.diagnosticResults.tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                    <div className="flex items-center gap-3">
                      <span className={
                        test.status === 'passed' ? 'text-green-400' :
                          test.status === 'warning' ? 'text-yellow-400' :
                            test.status === 'critical' ? 'text-red-400' :
                              'text-gray-400'
                      }>
                        {test.status === 'passed' ? '✅' :
                          test.status === 'warning' ? '⚠️' :
                            test.status === 'critical' ? '❌' :
                              '❓'}
                      </span>
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <div className="text-sm text-gray-400 max-w-xs truncate">
                      {test.details.message ||
                        test.details.error ||
                        (test.details.violations && `${test.details.violations.length} violations`) ||
                        (test.details.issues && `${test.details.issues.length} issues`) ||
                        test.details.responseTime ||
                        'No details'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Last run: {new Date(monitoringSystem.diagnosticResults.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          {/* Monitoring Status */}
          {monitoringSystem.active && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
              <div className="flex items-center gap-2 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Active Monitoring</span>
                <span className="text-sm opacity-80">• Auto-diagnostics every 5 minutes</span>
              </div>
            </div>
          )}
        </div>

        {/* Integrations & API Access */}
        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <h3 className="font-bold mb-4 text-cyan-300 flex items-center gap-2">
            <span className="text-xl">🔗</span>
            Integrations & API Access
          </h3>

          {/* API Access Management */}
          <div className="mb-6">
            <h4 className="font-semibold text-cyan-300 mb-3">API Access</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="apiEnabled"
                  checked={routerConfig.apiAccess?.enabled || false}
                  onChange={toggleAPIAccess}
                  className="w-5 h-5 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-500"
                />
                <label htmlFor="apiEnabled" className="text-cyan-200 font-semibold">
                  Enable External API Access
                </label>
              </div>

              {routerConfig.apiAccess?.enabled && (
                <div className="ml-8 space-y-3">
                  <div>
                    <label className="block text-cyan-200 mb-2 font-semibold">API Token</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={routerConfig.apiAccess?.token || ''}
                        readOnly
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg font-mono text-sm"
                        placeholder="No token generated"
                      />
                      <button
                        onClick={generateAPIKey}
                        className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-cyan-200 mb-2 font-semibold">Rate Limit (requests/minute)</label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={routerConfig.apiAccess?.rateLimit || 100}
                      onChange={(e) => setRouterConfig({
                        ...routerConfig,
                        apiAccess: {
                          ...routerConfig.apiAccess,
                          rateLimit: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Webhooks Management */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-cyan-300">Webhooks ({routerConfig.webhooks?.length || 0})</h4>
              <button
                onClick={() => {
                  const name = prompt('Webhook name:');
                  const url = prompt('Webhook URL:');
                  if (name && url) {
                    addWebhook({ name, url, events: ['user_connected', 'user_blocked', 'system_alert'] });
                  }
                }}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-sm transition"
              >
                Add Webhook
              </button>
            </div>

            {routerConfig.webhooks?.length > 0 && (
              <div className="space-y-2">
                {routerConfig.webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded">
                    <div className="flex-1">
                      <div className="font-semibold text-cyan-200">{webhook.name}</div>
                      <div className="text-sm text-cyan-300 font-mono">{webhook.url}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Success: {webhook.successCount} | Failed: {webhook.failureCount}
                        {webhook.lastTriggered && ` | Last: ${new Date(webhook.lastTriggered).toLocaleString()}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => testWebhook(webhook)}
                        disabled={integrationManager.webhookTesting}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-700 rounded text-sm transition"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => deleteWebhook(webhook.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* External Integrations */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-cyan-300">External Services</h4>
              <button
                onClick={() => {
                  const services = [
                    { name: 'Slack', type: 'notification' },
                    { name: 'Discord', type: 'notification' },
                    { name: 'Grafana', type: 'monitoring' },
                    { name: 'Prometheus', type: 'monitoring' },
                    { name: 'Custom API', type: 'api' }
                  ];
                  const serviceName = prompt('Select service:', services.map(s => s.name).join(', '));
                  const service = services.find(s => s.name === serviceName);
                  if (service) {
                    addIntegration(service);
                  }
                }}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-sm transition"
              >
                Add Integration
              </button>
            </div>

            {routerConfig.integrations?.length > 0 && (
              <div className="space-y-2">
                {routerConfig.integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded">
                    <div className="flex items-center gap-3">
                      <span className={
                        integration.connected ? 'text-green-400' : 'text-gray-400'
                      }>
                        {integration.connected ? '🟢' : '⚪'}
                      </span>
                      <div>
                        <div className="font-semibold text-cyan-200">{integration.name}</div>
                        <div className="text-sm text-cyan-300">{integration.type}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => testIntegration(integration)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                    >
                      {integration.connected ? 'Reconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Export */}
          <div>
            <h4 className="font-semibold text-cyan-300 mb-3">Data Export</h4>
            <div className="flex gap-2">
              <button
                onClick={() => exportSystemData('json')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded font-semibold transition"
              >
                📤 Export System Data
              </button>
              <button
                onClick={() => addNotification('info', 'API documentation available at /api/docs')}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded font-semibold transition"
              >
                📖 API Docs
              </button>
            </div>
          </div>
        </div>

        {/* Connection Status & Diagnostics */}
        {routerConfig.connectionHistory.length > 0 && (
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-600/50 rounded-lg">
            <h3 className="font-bold mb-4 text-slate-200 flex items-center gap-2">
              <span className="text-xl">📊</span>
              Connection History (Last 10 attempts)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {routerConfig.connectionHistory.slice(0, 10).map((record, index) => (
                <div key={index} className={`flex items-center justify-between py-2 px-3 rounded text-sm ${record.success ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className={record.success ? 'text-green-400' : 'text-red-400'}>
                      {record.success ? '✅' : '❌'}
                    </span>
                    <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-right">
                    {record.success ? (
                      <span>{record.details} ({record.responseTime}ms)</span>
                    ) : (
                      <span>{record.error || 'Connection failed'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={connectToRouter}
            disabled={routerConfig.connecting || isLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${routerConfig.connecting || isLoading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105'
              }`}
          >
            {(routerConfig.connecting || isLoading) && <LoadingSpinner size="sm" color="white" />}
            {routerConfig.connecting ? 'Connecting...' : isLoading ? 'Loading...' : routerConfig.connected ? 'Reconnect' : 'Connect to Router'}
          </button>
          {routerConfig.connected && (
            <>
              <span className="flex items-center gap-2 text-green-300">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                Connected
              </span>
              <button
                onClick={disconnectFromRouter}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition"
              >
                Disconnect
              </button>
            </>
          )}
        </div>

        {/* Data Management Section */}
        <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <h3 className="font-bold mb-4 text-purple-300">Data Management</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-purple-200 mb-2">
                Export all your configuration data for backup or migration purposes.
              </p>
              <button
                onClick={exportAllData}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition flex items-center gap-2"
              >
                📥 Export All Data
              </button>
            </div>
            <div>
              <p className="text-sm text-purple-200 mb-2">
                Import configuration data from a backup file. This will replace all current data.
              </p>
              <label className="inline-block px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition cursor-pointer">
                📤 Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={importAllData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="font-bold mb-2 text-blue-300">RouterOS 7 Setup Guide:</h3>
          <ol className="text-sm space-y-2 text-blue-100">
            <li><strong>1. Enable REST API:</strong> <code className="bg-slate-800 px-2 py-1 rounded">/ip service enable www-ssl</code></li>
            <li><strong>2. Set API Port:</strong> <code className="bg-slate-800 px-2 py-1 rounded">/ip service set www-ssl port=443</code></li>
            <li><strong>3. Create API User:</strong> <code className="bg-slate-800 px-2 py-1 rounded">/user add name=api-user group=full password=your-password</code></li>
            <li><strong>4. Configure Firewall:</strong> Allow API access from your management IP</li>
            <li><strong>5. Test Connection:</strong> Use Postman or curl to verify REST API endpoint</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <h3 className="font-bold mb-2 text-green-300">Complete Features:</h3>
          <ul className="text-sm space-y-1 text-green-100">
            <li>✓ Branded Captive Portal (DevTek)</li>
            <li>✓ User Management with MAC binding</li>
            <li>✓ Bandwidth Control (Queue Trees)</li>
            <li>✓ Data Quota Monitoring</li>
            <li>✓ Automatic Blocking on quota exceeded</li>
            <li>✓ Hotspot Voucher System</li>
            <li>✓ Real-time Traffic Monitoring</li>
            <li>✓ Firewall Rules Management</li>
            <li>✓ Customizable Guest Portal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RouterConfigTab;
