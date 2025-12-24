# Robust Router Detection System

## Overview

The robust detection system provides enterprise-grade router discovery with multiple fallback strategies, intelligent caching, and comprehensive fingerprinting.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  React Component Layer                        │
│  ┌───────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │ useRouterDete│  │ DetectionProg │  │ DetectedRouter │ │
│  │ ction Hook   │  │ ress Component│  │ Info Component │ │
│  └───────┬───────┘  └────────┬───────┘  └────────┬────────┘ │
└──────────┼──────────────────┼──────────────────┼────────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                             │
           ┌─────────────────▼──────────────────┐
           │  RobustDetectionService            │
           │  ┌──────────────────────────────┐  │
           │  │ Multi-Strategy Detection     │  │
           │  │ • Cache Check                │  │
           │  │ • Priority IP Scan           │  │
           │  │ • Full Network Scan          │  │
           │  │ • Backend-Assisted Scan      │  │
           │  └──────────────────────────────┘  │
           │  ┌──────────────────────────────┐  │
           │  │ Advanced Probing             │  │
           │  │ • REST API (443)             │  │
           │  │ • API-SSL (8729)  ⭐          │  │
           │  │ • API (8728)                 │  │
           │  │ • HTTP (80)                  │  │
           │  │ • Winbox (8291)              │  │
           │  └──────────────────────────────┘  │
           │  ┌──────────────────────────────┐  │
           │  │ MikroTik Fingerprinting      │  │
           │  │ • Identity Verification      │  │
           │  │ • Header Analysis            │  │
           │  │ • Port Pattern Matching      │  │
           │  └──────────────────────────────┘  │
           └────────────────┬───────────────────┘
                           │
         ┌─────────────────┼──────────────────┐
         │                 │                  │
    ┌────▼─────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ Cache    │   │ Network     │   │  Backend    │
    │ (5 min)  │   │ Scanning    │   │  (Optional) │
    └──────────┘   └─────────────┘   └─────────────┘
```

## Features

### 1. Multi-Strategy Detection
- ✅ **Cache-First**: Check recently found routers (5-minute TTL)
- ✅ **Priority IPs**: Scan common MikroTik addresses first
- ✅ **Full Network Scan**: Comprehensive subnet scanning
- ✅ **Backend Scan**: Use backend for deeper inspection

### 2. Intelligent Caching
```javascript
// Cached routers are valid for 5 minutes
const cached = detectionService.getCachedRouter();
if (cached) {
  return cached; // Instant result!
}
```

### 3. Advanced Fingerprinting
```javascript
{
  verified: true,
  method: 'rest-api-identity',
  identity: 'MikroTik-Office',
  confidence: 100
}
```

### 4. Adaptive Scanning
- **Batch Size Optimization**: Adjusts based on network responsiveness
- **Early Termination**: Stops as soon as router is found
- **Progress Tracking**: Real-time updates

### 5. Comprehensive Port Detection
1. **Port 8729** (API-SSL) - TLS encrypted ⭐ **Recommended**
2. **Port 8728** (API) - Standard MikroTik API
3. **Port 443** (REST API) - Web-friendly, RouterOS 7+
4. **Port 80** (HTTP) - Web interface
5. **Port 8291** (Winbox) - GUI protocol

## Usage

### Basic Usage

```javascript
import { useRouterDetection } from './hooks/useRouterDetection';

function MyComponent() {
  const {
    isDetecting,
    progress,
    detectedRouter,
    detectRouter,
    cancelDetection
  } = useRouterDetection();

  const handleDetect = async () => {
    const router = await detectRouter({
      scanRange: '192.168.88.0/24',
      useCache: true,
      strategies: ['cached', 'priority_ips', 'network_scan']
    });

    if (router) {
      console.log('Found router:', router);
    }
  };

  return (
    <div>
      <button onClick={handleDetect} disabled={isDetecting}>
        {isDetecting ? 'Detecting...' : 'Detect Router'}
      </button>
      
      {isDetecting && (
        <DetectionProgress 
          progress={progress}
          isDetecting={isDetecting}
          onCancel={cancelDetection}
        />
      )}
      
      {detectedRouter && (
        <DetectedRouterInfo router={detectedRouter} />
      )}
    </div>
  );
}
```

### Advanced Usage

```javascript
// Custom detection with all options
const router = await detectRouter({
  scanRange: '192.168.1.0/24',
  useCache: false, // Force fresh scan
  strategies: ['priority_ips', 'network_scan', 'backend_scan'],
  onProgress: (progress) => {
    console.log(`Stage: ${progress.stage}, Progress: ${progress.progress}%`);
    console.log(`Scanned: ${progress.current}/${progress.total}`);
  }
});
```

## Detection Flow

### 1. Priority IP Scan (Default)
```
Priority IPs: 192.168.88.1, 192.168.1.1, 10.0.0.1, etc.
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│ IP1 │  │ IP2 │  │ IP3 │  │ IP4 │  (Parallel scan)
└──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘
   └────────┴────────┴────────┘
              │
         Found at 192.168.88.1! ✅
         Stop scanning ⏹️
```

**Time**: < 2 seconds (if found in priority IPs)

### 2. Full Network Scan (Fallback)
```
Scan Range: 192.168.88.1 - 192.168.88.254
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Batch1│ │Batch2│ │Batch3│ │ ...  │
│(10IP)│ │(10IP)│ │(10IP)│ │      │
└───┬──┘ └───┬──┘ └───┬──┘ └──────┘
    │Progress: 13%   39%    65%
    └─────────┴──────┴───────────┘
                │
           Found! Stop ⏹️
```

**Time**: 20-30 seconds (for full /24 network)

### 3. Adaptive Batch Sizing
```
Initial batch: 10 IPs
┌─────────────────┐
│ Success rate: │
│   > 50%   │ +5 │ → Batch size: 15
│   < 10%   │ -2 │ → Batch size: 8
│   Normal  │  0 │ → Batch size: 10
└─────────────────┘
```

## API Reference

### RobustDetectionService

#### `detectRouter(options)`
Main detection method.

**Options:**
```javascript
{
  scanRange: '192.168.88.0/24',        // CIDR notation
  useCache: true,                       // Use cached results
  strategies: [                         // Detection strategies
    'cached',
    'priority_ips',
    'network_scan',
    'backend_scan'
  ],
  onProgress: (progress) => {},         // Progress callback
  signal: abortSignal                   // Cancellation signal
}
```

**Returns:**
```javascript
{
  ip: '192.168.88.1',
  ports: [
    { type: 'api-ssl', port: 8729, priority: 1, secure: true },
    { type: 'rest-api', port: 443, priority: 3, secure: true }
  ],
  recommended: { type: 'api-ssl', port: 8729, ... },
  fingerprint: {
    verified: true,
    method: 'rest-api-identity',
    identity: 'MikroTik-Office',
    confidence: 100
  },
  source: 'priority_scan',
  detectedAt: '2025-12-20T14:30:00.000Z'
}
```

#### `cancelScan()`
Cancel ongoing detection.

#### `clearCache()`
Clear router cache.

### useRouterDetection Hook

**State:**
- `isDetecting`: `boolean` - Detection in progress
- `progress`: `object` - Current progress
- `detectedRouter`: `object` - Found router info
- `error`: `string` - Error message

**Actions:**
- `detectRouter(options)`: Start detection
- `cancelDetection()`: Cancel scan
- `clearCache()`: Clear cache
- `reset()`: Reset state

## Performance

### Benchmark Results

| Scenario | Time | Details |
|----------|------|---------|
| Cache Hit | < 100ms | Instant result |
| Priority IP (found) | < 2s | 192.168.88.1 found |
| Priority IP (not found) | ~2s | All priority IPs checked |
| Full /24 scan | 20-30s | 254 IPs scanned |
| Router at .254 | ~25s | Last IP in range |
| No router | ~30s | Complete scan |

### Optimization Techniques

1. **Parallel Priority Scanning**: All priority IPs checked simultaneously
2. **Early Termination**: Stops immediately when router found
3. **Adaptive Batching**: Adjusts batch size based on network conditions
4. **Smart Caching**: Remembers routers for 5 minutes
5. **Timeout Management**: 1-second timeout per probe

## Error Handling

### Common Errors

```javascript
try {
  const router = await detectRouter(options);
} catch (error) {
  switch (error.message) {
    case 'Detection cancelled':
      // User cancelled
      break;
    case 'Network timeout':
      // Network issue
      break;
    case 'Invalid scan range':
      // Bad CIDR notation
      break;
  }
}
```

### Retry Logic

```javascript
// Automatic retry on failure
let attempts = 0;
let router = null;

while (!router && attempts < 3) {
  router = await detectRouter(options);
  attempts++;
  
  if (!router && attempts < 3) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

## Best Practices

### 1. Use Cache for Frequent Scans
```javascript
// Fast repeat scans
await detectRouter({ useCache: true });
```

### 2. Adjust Scan Range to Your Network
```javascript
// Home network
await detectRouter({ scanRange: '192.168.1.0/24' });

// Corporate network
await detectRouter({ scanRange: '10.0.0.0/16' }); // Warning: Large!
```

### 3. Provide User Feedback
```javascript
<DetectionProgress 
  progress={progress}
  isDetecting={isDetecting}
  onCancel={cancelDetection}
/>
```

### 4. Handle Edge Cases
```javascript
if (!router) {
  // Suggest manual configuration
  // Provide network troubleshooting tips
}
```

## Troubleshooting

### Router Not Found

**Check:**
1. Network connectivity
2. Same subnet as router
3. Router is powered on
4. Correct scan range
5. Firewall not blocking

**Solutions:**
1. Update scan range
2. Disable cache: `useCache: false`
3. Try manual IP entry
4. Check router configuration

### Slow Detection

**Causes:**
- Large network (/16, /18)
- Slow network response
- Many devices to scan

**Solutions:**
1. Use priority IPs only
2. Reduce scan range
3. Use backend scanner

### False Positives

**Prevention:**
- Fingerprint verification enabled
- Multiple port detection
- Identity confirmation

## Future Enhancements

- [ ] mDNS/Bonjour discovery
- [ ] Network interface enumeration
- [ ] Machine learning for router identification
- [ ] Distributed scanning (multiple clients)
- [ ] Router capability detection
- [ ] Auto-update scan range from DHCP
- [ ] Historical router tracking
- [ ] Network topology mapping

## Contributing

To improve the detection system:

1. Add new detection strategies
2. Improve fingerprinting accuracy
3. Optimize scanning performance
4. Add support for more router types

## License

MIT License - See LICENSE file
