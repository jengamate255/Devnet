/**
 * MikroTik API Client for Web Applications
 * 
 * This implementation uses WebSocket to connect to MikroTik's API service
 * Port 8728 (standard) or 8729 (TLS/SSL)
 * 
 * Note: Direct browser connection to MikroTik API requires:
 * 1. WebSocket proxy OR
 * 2. Backend service OR
 * 3. MikroTik configured to accept WebSocket connections
 */

class MikroTikAPI {
    constructor(backendUrl = 'ws://localhost:8080') {
        this.backendUrl = backendUrl;
        this.socket = null;
        this.connected = false;
        this.authenticated = false;
        this.bridgeReady = false;
        this.pendingRequests = new Map();
        this.connectionPromise = null;
        this.requestTimeoutMs = 15000;
    }

    /**
     * Connect to the Backend Bridge and then to the Router
     */
    async connect(routerConfig) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN && this.connected) {
            return { success: true, message: 'Already connected' };
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                this.resetConnectionState();
                this.socket = new WebSocket(this.backendUrl);

                this.socket.onopen = async () => {
                    try {
                        await this.sendRequest('bridge.hello', {
                            client: 'devnet-web',
                            protocol: '2.0'
                        });
                        this.bridgeReady = true;

                        const port = parseInt(routerConfig.port, 10) || 8728;
                        const tls = port === 8729;

                        await this.sendRequest('router.connect', {
                            host: routerConfig.host,
                            port,
                            username: routerConfig.username,
                            password: routerConfig.password,
                            tls
                        });

                        this.connected = true;
                        this.authenticated = true;
                        resolve({ success: true, message: `Connected to ${routerConfig.host}` });
                    } catch (error) {
                        this.disconnect();
                        reject(error);
                    }
                };

                this.socket.onmessage = (event) => {
                    this.handleMessage(event);
                };

                this.socket.onerror = () => {
                    if (!this.connected) {
                        this.disconnect();
                        reject(new Error('Failed to connect to backend server. Is it running?'));
                    }
                };

                this.socket.onclose = () => {
                    this.resetConnectionState();
                };
            } catch (error) {
                reject(error);
            }
        }).finally(() => {
            this.connectionPromise = null;
        });

        return this.connectionPromise;
    }

    /**
     * Execute API command
     */
    async execute(command, params = []) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to backend');
        }

        if (!this.connected) {
            throw new Error('Not connected to router');
        }

        return this.sendRequest('router.command', { command, params })
            .then((payload) => payload.data);
    }

    /**
     * Get system resources
     */
    async getSystemResource() {
        return this.execute('/system/resource/print');
    }

    /**
     * Get system health (voltage, temperature)
     */
    async getSystemHealth() {
        return this.execute('/system/health/print');
    }

    /**
     * Get all interfaces
     */
    async getInterfaces() {
        return this.execute('/interface/print');
    }

    /**
     * Get active hotspot users
     */
    async getActiveHotspotUsers() {
        return this.execute('/ip/hotspot/active/print');
    }

    /**
     * Get hotspot users
     */
    async getHotspotUsers() {
        return this.execute('/ip/hotspot/user/print');
    }

    /**
     * Add hotspot user
     */
    async addHotspotUser(userData) {
        return this.execute('/ip/hotspot/user/add', userData);
    }

    /**
     * Remove hotspot user
     */
    async removeHotspotUser(userId) {
        return this.execute('/ip/hotspot/user/remove', { '.id': userId });
    }

    /**
     * Get queue list
     */
    async getQueueList() {
        return this.execute('/queue/simple/print');
    }

    /**
     * Add queue for bandwidth control
     */
    async addQueue(queueData) {
        return this.execute('/queue/simple/add', queueData);
    }

    /**
     * Get firewall filter rules
     */
    async getFirewallRules() {
        return this.execute('/ip/firewall/filter/print');
    }

    /**
     * Add firewall rule (for blocking)
     */
    async addFirewallRule(ruleData) {
        return this.execute('/ip/firewall/filter/add', ruleData);
    }

    /**
     * Get logs
     */
    async getLogs() {
        return this.execute('/log/print');
    }

    /**
     * Disconnect from router
     */
    disconnect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.sendRequest('router.disconnect', {}).catch(() => {
                // Best-effort disconnect, ignore errors.
            });
            this.socket.close();
        }
        this.resetConnectionState();
    }

    resetConnectionState() {
        this.connected = false;
        this.authenticated = false;
        this.bridgeReady = false;
        this.clearPendingRequests('Connection closed');
    }

    clearPendingRequests(message) {
        for (const { reject, timeoutId } of this.pendingRequests.values()) {
            clearTimeout(timeoutId);
            reject(new Error(message));
        }
        this.pendingRequests.clear();
    }

    createRequestId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    handleMessage(event) {
        let response;
        try {
            response = JSON.parse(event.data);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            return;
        }

        if (response && response.type === 'event') {
            if (response.action === 'router.error') {
                this.connected = false;
            }
            return;
        }

        const { id, ok, payload, error } = response || {};
        if (!id || !this.pendingRequests.has(id)) {
            return;
        }

        const { resolve, reject, timeoutId } = this.pendingRequests.get(id);
        clearTimeout(timeoutId);
        this.pendingRequests.delete(id);

        if (ok) {
            resolve(payload);
        } else {
            reject(new Error(error?.message || 'Request failed'));
        }
    }

    sendRequest(action, payload, timeoutMs = this.requestTimeoutMs) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return Promise.reject(new Error('Backend connection is not open'));
        }

        const id = this.createRequestId();

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`Request timed out: ${action}`));
            }, timeoutMs);

            this.pendingRequests.set(id, { resolve, reject, timeoutId });
            this.socket.send(JSON.stringify({ id, action, payload }));
        });
    }
}

export default MikroTikAPI;

/**
 * Helper function to create API instance
 */
export function createMikroTikAPI(config) {
    return new MikroTikAPI(config);
}

/**
 * Test connection to MikroTik router
 */
export async function testMikroTikConnection(host, port, username, password) {
    try {
        const api = new MikroTikAPI();
        await api.connect({
            host,
            port,
            username,
            password,
            sslValidation: false
        });
        const identity = await api.execute('/system/identity/print');
        api.disconnect();
        return { success: true, identity };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
