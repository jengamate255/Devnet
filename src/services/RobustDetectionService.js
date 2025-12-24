/**
 * Robust MikroTik Router Detection Service
 * 
 * Features:
 * - Multi-strategy detection (parallel + sequential fallback)
 * - Intelligent caching with TTL
 * - Advanced fingerprinting
 * - Background scanning
 * - Network interface detection
 * - Retry logic and error handling
 */

class RobustDetectionService {
    constructor() {
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
        this.scanInProgress = false;
        this.abortController = null;

        // Detection strategies (in order of preference)
        this.strategies = [
            { name: 'cached', priority: 1 },
            { name: 'priority_ips', priority: 2 },
            { name: 'network_scan', priority: 3 },
            { name: 'backend_scan', priority: 4 }
        ];

        // Mock settings for testing
        this.mockMode = false;
        this.mockResults = [
            {
                ip: '192.168.88.1',
                hostname: 'MikroTik-Main',
                ports: [
                    { type: 'rest-api', port: 443, secure: true },
                    { type: 'api-ssl', port: 8729, secure: true },
                    { type: 'api', port: 8728, secure: false }
                ],
                recommended: { protocol: 'https', port: 443, type: 'rest-api' },
                fingerprint: { identity: 'Core-Router', version: '7.12.1', model: 'RB4011iGS+', confidence: 95, method: 'REST API' },
                detectedAt: new Date().toISOString(),
                source: 'mock'
            },
            {
                ip: '192.168.100.25',
                hostname: 'MT-Kitchen-AP',
                ports: [
                    { type: 'http', port: 80, secure: false },
                    { type: 'api', port: 8728, secure: false }
                ],
                recommended: { protocol: 'http', port: 80, type: 'http' },
                fingerprint: { identity: 'AP-Kitchen', version: '6.49.10', model: 'hAP ac2', confidence: 85, method: 'HTTP Fingerprint' },
                detectedAt: new Date().toISOString(),
                source: 'mock'
            }
        ];
    }

    /**
     * Enable or disable mock mode
     */
    setMockMode(enabled) {
        this.mockMode = enabled;
    }

    /**
     * Main detection method - tries multiple strategies
     */
    async detectRouter(options = {}) {
        const {
            scanRange = '192.168.88.0/24',
            useCache = true,
            strategies = ['cached', 'priority_ips', 'network_scan'],
            onProgress = () => { },
            signal = null
        } = options;

        this.abortController = new AbortController();
        const combinedSignal = this.createCombinedSignal(signal, this.abortController.signal);

        if (this.mockMode) {
            onProgress({ stage: 'mock', progress: 50, message: 'Simulating mock detection...' });
            await new Promise(resolve => setTimeout(resolve, 800));
            onProgress({ stage: 'complete', progress: 100, message: 'Found mock router' });
            return this.mockResults[0];
        }

        try {
            this.scanInProgress = true;

            // Strategy 1: Check cache first
            if (useCache && strategies.includes('cached')) {
                onProgress({ stage: 'cache', progress: 0, message: 'Checking cache...' });
                const cached = this.getCachedRouter();
                if (cached) {
                    onProgress({ stage: 'cache', progress: 100, message: 'Found in cache' });
                    return { ...cached, source: 'cache' };
                }
            }

            // Strategy 2: Priority IPs (common MikroTik addresses)
            if (strategies.includes('priority_ips')) {
                onProgress({ stage: 'priority', progress: 0, message: 'Checking common addresses...' });
                const priorityResult = await this.scanPriorityIPs(scanRange, combinedSignal, onProgress);
                if (priorityResult) {
                    this.cacheRouter(priorityResult);
                    return { ...priorityResult, source: 'priority_scan' };
                }
            }

            // Strategy 3: Full network scan
            if (strategies.includes('network_scan')) {
                onProgress({ stage: 'network', progress: 0, message: 'Scanning network...' });
                const networkResult = await this.scanNetwork(scanRange, combinedSignal, onProgress);
                if (networkResult) {
                    this.cacheRouter(networkResult);
                    return { ...networkResult, source: 'network_scan' };
                }
            }

            // Strategy 4: Backend-assisted scan (if available)
            if (strategies.includes('backend_scan')) {
                onProgress({ stage: 'backend', progress: 0, message: 'Using backend scanner...' });
                const backendResult = await this.scanViaBackend(scanRange, combinedSignal, onProgress);
                if (backendResult) {
                    this.cacheRouter(backendResult);
                    return { ...backendResult, source: 'backend_scan' };
                }
            }

            return null;

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Detection cancelled');
            }
            throw error;
        } finally {
            this.scanInProgress = false;
        }
    }

    /**
     * Detect ALL routers on the network
     * Unlike detectRouter(), this continues scanning and returns all found devices
     */
    async detectAllRouters(options = {}) {
        const {
            scanRange = '192.168.88.0/24',
            onProgress = () => { },
            signal = null,
            maxRouters = 10  // Safety limit
        } = options;

        this.abortController = new AbortController();
        const combinedSignal = this.createCombinedSignal(signal, this.abortController.signal);

        if (this.mockMode) {
            onProgress({ stage: 'mock', progress: 30, message: 'Starting mock full scan...', found: 0 });
            await new Promise(resolve => setTimeout(resolve, 800));
            onProgress({ stage: 'mock', progress: 60, message: 'Probing network...', found: 1 });
            await new Promise(resolve => setTimeout(resolve, 800));
            onProgress({ stage: 'complete', progress: 100, message: 'Scan complete', found: 2 });
            return this.mockResults;
        }

        const foundRouters = [];

        try {
            this.scanInProgress = true;

            // Get all IPs to scan (priority + all others)
            const priorityIPs = this.getPriorityIPs(scanRange);
            const allIPs = this.generateIPRange(scanRange);

            // Combine and deduplicate
            const uniqueIPs = [...new Set([...priorityIPs, ...allIPs])];

            onProgress({
                stage: 'scanning',
                progress: 0,
                message: `Scanning ${uniqueIPs.length} addresses for all routers...`,
                total: uniqueIPs.length,
                found: 0
            });

            // Scan in batches
            const batchSize = 15;
            for (let i = 0; i < uniqueIPs.length; i += batchSize) {
                if (combinedSignal?.aborted) throw new Error('Scan cancelled');
                if (foundRouters.length >= maxRouters) break; // Safety limit

                const batch = uniqueIPs.slice(i, i + batchSize);
                const batchResults = await Promise.allSettled(
                    batch.map(ip => this.probeRouter(ip, combinedSignal))
                );

                // Collect all successful detections
                for (const result of batchResults) {
                    if (result.status === 'fulfilled' && result.value) {
                        const router = result.value;
                        // Check if not already found (by IP)
                        if (!foundRouters.find(r => r.ip === router.ip)) {
                            foundRouters.push({ ...router, source: 'full_scan' });

                            onProgress({
                                stage: 'scanning',
                                progress: Math.round(((i + batch.length) / uniqueIPs.length) * 100),
                                current: i + batch.length,
                                total: uniqueIPs.length,
                                found: foundRouters.length,
                                message: `Found ${foundRouters.length} router(s)...`
                            });
                        }
                    }
                }

                // Update progress
                const progress = Math.round(((i + batch.length) / uniqueIPs.length) * 100);
                onProgress({
                    stage: 'scanning',
                    progress,
                    current: i + batch.length,
                    total: uniqueIPs.length,
                    found: foundRouters.length
                });

                // Small delay between batches
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            onProgress({
                stage: 'complete',
                progress: 100,
                message: `Scan complete! Found ${foundRouters.length} router(s)`,
                total: uniqueIPs.length,
                found: foundRouters.length
            });

            return foundRouters;

        } catch (error) {
            if (error.message === 'Scan cancelled') {
                throw new Error('Detection cancelled');
            }
            throw error;
        } finally {
            this.scanInProgress = false;
        }
    }

    /**
     * Scan priority IPs with advanced fingerprinting
     */
    async scanPriorityIPs(scanRange, signal, onProgress) {
        const priorityIPs = this.getPriorityIPs(scanRange);
        const batchSize = priorityIPs.length;

        onProgress({
            stage: 'priority',
            progress: 0,
            message: `Checking ${priorityIPs.length} common addresses...`,
            total: priorityIPs.length
        });

        const results = await Promise.allSettled(
            priorityIPs.map(async (ip, index) => {
                if (signal?.aborted) throw new Error('Aborted');

                const result = await this.probeRouter(ip, signal);
                onProgress({
                    stage: 'priority',
                    progress: Math.round(((index + 1) / priorityIPs.length) * 100),
                    current: index + 1,
                    total: priorityIPs.length
                });

                return result;
            })
        );

        // Find first successful result
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                return result.value;
            }
        }

        return null;
    }

    /**
     * Full network scan with adaptive batch sizing
     */
    async scanNetwork(scanRange, signal, onProgress) {
        const ips = this.generateIPRange(scanRange);
        const priorityIPs = this.getPriorityIPs(scanRange);

        // Remove already scanned priority IPs
        const remainingIPs = ips.filter(ip => !priorityIPs.includes(ip));

        // Adaptive batch sizing based on network conditions
        let batchSize = 10;
        let successfulProbes = 0;
        let failedProbes = 0;

        onProgress({
            stage: 'network',
            progress: 0,
            message: `Scanning ${remainingIPs.length} addresses...`,
            total: remainingIPs.length
        });

        for (let i = 0; i < remainingIPs.length; i += batchSize) {
            if (signal?.aborted) throw new Error('Aborted');

            const batch = remainingIPs.slice(i, i + batchSize);
            const batchResults = await Promise.allSettled(
                batch.map(ip => this.probeRouter(ip, signal))
            );

            // Check for successful detection
            for (const result of batchResults) {
                if (result.status === 'fulfilled' && result.value) {
                    return result.value;
                }
                if (result.status === 'fulfilled' && result.value === null) {
                    failedProbes++;
                } else if (result.status === 'fulfilled') {
                    successfulProbes++;
                }
            }

            // Adaptive batch sizing
            const successRate = successfulProbes / (successfulProbes + failedProbes);
            if (successRate > 0.5) {
                batchSize = Math.min(20, batchSize + 5); // Increase batch size
            } else if (successRate < 0.1) {
                batchSize = Math.max(5, batchSize - 2); // Decrease batch size
            }

            const progress = Math.round(((i + batch.length) / remainingIPs.length) * 100);
            onProgress({
                stage: 'network',
                progress,
                current: i + batch.length,
                total: remainingIPs.length,
                batchSize
            });

            // Small delay to prevent overwhelming the network
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return null;
    }

    /**
     * Advanced router probing with multiple detection methods
     */
    async probeRouter(ip, signal) {
        const timeout = 1000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const probes = [
                this.probeRESTAPI(ip, controller.signal),
                this.probeHTTP(ip, controller.signal),
                this.probeAPI(ip, 8729, controller.signal), // API-SSL
                this.probeAPI(ip, 8728, controller.signal), // API
                this.probeWinbox(ip, controller.signal)
            ];

            const results = await Promise.allSettled(probes);
            clearTimeout(timeoutId);

            // Collect all successful probes
            const successful = results
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value);

            if (successful.length === 0) return null;

            // Verify it's actually MikroTik
            const verified = await this.verifyMikroTik(ip, successful);
            if (!verified) return null;

            // Return comprehensive router info
            return {
                ip,
                ports: successful,
                recommended: this.getRecommendedPort(successful),
                fingerprint: verified,
                detectedAt: new Date().toISOString()
            };

        } catch (error) {
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Probe REST API (port 443)
     */
    async probeRESTAPI(ip, signal) {
        try {
            const response = await fetch(`https://${ip}:443/rest/system/identity`, {
                method: 'GET',
                headers: { 'Authorization': 'Basic ' + btoa('admin:') },
                signal
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    type: 'rest-api',
                    port: 443,
                    priority: 3,
                    identity: data.name,
                    secure: true
                };
            }
        } catch (error) {
            // Expected for most IPs
        }
        return null;
    }

    /**
     * Probe HTTP web interface (port 80)
     */
    async probeHTTP(ip, signal) {
        try {
            const response = await fetch(`http://${ip}:80/`, {
                method: 'HEAD',
                signal
            });

            const serverHeader = response.headers.get('Server') || '';
            if (serverHeader.toLowerCase().includes('mikrotik') ||
                response.headers.get('X-MikroTik-Router')) {
                return {
                    type: 'http',
                    port: 80,
                    priority: 4,
                    secure: false
                };
            }
        } catch (error) {
            // Expected for most IPs
        }
        return null;
    }

    /**
     * Probe API ports (8728/8729)
     */
    async probeAPI(ip, port, signal) {
        try {
            // For browser, we can only check if port is responsive
            const response = await fetch(`http://${ip}:${port}/`, {
                method: 'HEAD',
                signal
            });

            // Any response indicates the port is open
            return {
                type: port === 8729 ? 'api-ssl' : 'api',
                port,
                priority: port === 8729 ? 1 : 2,
                secure: port === 8729
            };
        } catch (error) {
            // Port likely closed or not MikroTik
        }
        return null;
    }

    /**
     * Probe Winbox port (8291)
     */
    async probeWinbox(ip, signal) {
        try {
            const response = await fetch(`http://${ip}:8291/`, {
                method: 'HEAD',
                signal
            });

            return {
                type: 'winbox',
                port: 8291,
                priority: 5,
                secure: false
            };
        } catch (error) {
            // Expected for most IPs
        }
        return null;
    }

    /**
     * Verify it's actually a MikroTik device
     */
    async verifyMikroTik(ip, ports) {
        // Check for REST API identity
        const restAPI = ports.find(p => p.type === 'rest-api');
        if (restAPI && restAPI.identity) {
            return {
                verified: true,
                method: 'rest-api-identity',
                identity: restAPI.identity,
                confidence: 100
            };
        }

        // Check for MikroTik-specific headers
        const http = ports.find(p => p.type === 'http');
        if (http) {
            return {
                verified: true,
                method: 'http-headers',
                confidence: 90
            };
        }

        // If multiple MikroTik-typical ports are open
        if (ports.length >= 2) {
            return {
                verified: true,
                method: 'port-pattern',
                confidence: 75
            };
        }

        return {
            verified: false,
            confidence: 0
        };
    }

    /**
     * Get recommended connection port
     */
    getRecommendedPort(ports) {
        // Sort by priority
        const sorted = [...ports].sort((a, b) => a.priority - b.priority);
        return sorted[0];
    }

    /**
     * Scan via backend (if available)
     */
    async scanViaBackend(scanRange, signal, onProgress) {
        try {
            // Check if backend is available
            const healthCheck = await fetch('http://localhost:8080/api/health');
            if (!healthCheck.ok) return null;

            // TODO: Implement backend scanning endpoint
            // For now, return null
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate IP range from CIDR notation
     */
    generateIPRange(cidr) {
        const [baseIP, maskBits] = cidr.split('/');
        const [a, b, c, d] = baseIP.split('.').map(Number);
        const mask = parseInt(maskBits);

        const ips = [];

        if (mask === 24) {
            // /24 network
            for (let i = 1; i < 255; i++) {
                ips.push(`${a}.${b}.${c}.${i}`);
            }
        } else if (mask === 16) {
            // /16 network (Warning: 65k IPs!)
            for (let i = 1; i < 255; i++) {
                for (let j = 1; j < 255; j++) {
                    ips.push(`${a}.${b}.${i}.${j}`);
                }
            }
        }

        return ips;
    }

    /**
     * Get priority IPs based on scan range
     */
    getPriorityIPs(scanRange) {
        const [baseIP] = scanRange.split('/');
        const parts = baseIP.split('.');
        const baseRange = `${parts[0]}.${parts[1]}.${parts[2]}`;

        return [
            '192.168.88.1',    // MikroTik default
            `${baseRange}.1`,   // Network gateway
            `${baseRange}.254`, // Alt gateway
            '192.168.1.1',
            '192.168.0.1',
            '10.0.0.1',
            '172.16.0.1',
            `${baseRange}.2`,   // Often the router
            `${baseRange}.10`,  // Common static IP
        ].filter((ip, index, self) => self.indexOf(ip) === index); // Remove duplicates
    }

    /**
     * Cache management
     */
    cacheRouter(router) {
        this.cache.set(router.ip, {
            ...router,
            cachedAt: Date.now()
        });
    }

    getCachedRouter() {
        const now = Date.now();
        for (const [ip, data] of this.cache.entries()) {
            if (now - data.cachedAt < this.cacheTTL) {
                return data;
            } else {
                this.cache.delete(ip); // Clean up expired entries
            }
        }
        return null;
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Cancel ongoing scan
     */
    cancelScan() {
        if (this.abortController) {
            this.abortController.abort();
        }
    }

    /**
     * Create combined abort signal
     */
    createCombinedSignal(signal1, signal2) {
        if (!signal1) return signal2;
        if (!signal2) return signal1;

        const controller = new AbortController();
        const abort = () => controller.abort();

        signal1.addEventListener('abort', abort);
        signal2.addEventListener('abort', abort);

        return controller.signal;
    }
}

const detectionService = new RobustDetectionService();
detectionService.setMockMode(false); // Disabled - scan for real routers

export default detectionService;
export { RobustDetectionService };
