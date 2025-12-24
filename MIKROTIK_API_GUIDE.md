# MikroTik API Integration Guide

## Overview

This document explains the different approaches to connecting a web application to MikroTik routers and their trade-offs.

## Connection Methods

### 1. **REST API (Port 443) - Currently Implemented** ✅
**What it is**: HTTP/HTTPS REST API introduced in RouterOS v7.x

**Pros**:
- ✅ Browser-friendly (uses standard HTTP/HTTPS)
- ✅ No CORS issues with proper configuration
- ✅ Easy to implement in web apps
- ✅ Secure with HTTPS
- ✅ Well-documented endpoints

**Cons**:
- ❌ Requires RouterOS v7.x or newer
- ❌ Slightly less performant than binary API
- ❌ Limited real-time capabilities (polling required)

**Best for**: Modern web applications, mobile apps, easy integration

### 2. **MikroTik API (Port 8728/8729)** - Recommended for Production
**What it is**: Binary protocol for programmatic access

**Port 8728**: Standard API (unencrypted)
**Port 8729**: API-SSL (TLS encrypted) ⭐ Recommended

**Pros**:
- ✅ Full router API access
- ✅ More efficient than REST
- ✅ Real-time event notifications
- ✅ Works on older RouterOS versions
- ✅ Lower latency

**Cons**:
- ❌ Binary protocol (complex)
- ❌ Browsers can't directly connect (need proxy)
- ❌ Requires backend service or WebSocket proxy

**Best for**: Server-side applications, real-time monitoring, advanced features

### 3. **Winbox (Port 8291)** - Not for Web Apps
**What it is**: Proprietary binary protocol for Winbox GUI

**Not recommended** for web applications - use REST API or API protocol instead.

## Implementation Approaches

### Approach A: Pure Frontend (Current Implementation)
```
[Web App] --HTTPS--> [MikroTik Router:443 REST API]
```

**Advantages**:
- Simple architecture
- No backend required
- Lower infrastructure costs
- Direct connection

**Limitations**:
- Must use REST API only
- Requires RouterOS v7+
- Polling for updates (no push notifications)

### Approach B: Backend Proxy (Recommended for Production)
```
[Web App] --WebSocket--> [Backend Server] --API Protocol--> [MikroTik Router:8729]
```

**Advantages**:
- ✅ Access to full API protocol features
- ✅ Real-time updates via WebSocket
- ✅ Works with older RouterOS versions
- ✅ Can aggregate multiple routers
- ✅ Add caching, logging, auth layers
- ✅ Better security control

**Backend Options**:
1. **Node.js** with `mikronode` or `node-routeros` package
2. **Python** with `routeros-api` package  
3. **Go** with custom API client
4. **PHP** with RouterOS API library

**Example Node.js Backend**:
```javascript
const express = require('express');
const RouterOSAPI = require('node-routeros').RouterOSAPI;
const WebSocket = require('ws');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

// Connect to MikroTik
const api = new RouterOSAPI({
    host: '192.168.88.1',
    user: 'admin',
    password: 'password',
    port: 8729,
    tls: true
});

// WebSocket handlers
wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const cmd = JSON.parse(message);
        const result = await api.write(cmd.command, cmd.params);
        ws.send(JSON.stringify(result));
    });
});
```

### Approach C: Hybrid (Best of Both)
```
[Web App] --> [Backend] --> [MikroTik:8729 API]
         \--> [MikroTik:443 REST API] (fallback)
```

**Advantages**:
- Backend for advanced features
- Direct REST API for simple queries
- Automatic failover
- Progressive enhancement

## Security Considerations

### For REST API (Current Method)
1. **Always use HTTPS** (port 443)
2. **Enable CORS** on MikroTik:
   ```routeros
   /ip service set www-ssl address=192.168.0.0/16
   ```
3. **Use strong passwords**
4. **Restrict API access by IP**
5. **Enable certificate validation** in production

### For API Protocol (with Backend)
1. **Use API-SSL** (port 8729, not 8728)
2. **Place backend in secure network**
3. **Use WebSocket SSL** (wss://)
4. **Implement rate limiting**
5. **Add authentication layer**

## Recommended Setup for This Project

### Phase 1: Current (REST API - Development) ✅
```javascript
// Already implemented
const response = await fetch(`https://${host}:443/rest/system/resource`, {
    headers: { 'Authorization': 'Basic ' + btoa(user + ':' + pass) }
});
```

### Phase 2: Add Backend (Production)
Create a simple Node.js backend:

```bash
npm install express node-routeros ws
```

```javascript
// backend/server.js
const RouterOSAPI = require('node-routeros').RouterOSAPI;

const conn = new RouterOSAPI({
    host: process.env.ROUTER_IP,
    user: process.env.ROUTER_USER,
    password: process.env.ROUTER_PASS,
    port: 8729,
    tls: true
});

// Expose via REST API or WebSocket
```

### Phase 3: Real-time Updates
Add WebSocket for live data:

```javascript
// Subscribe to interface traffic
conn.menu('/interface').listen('traffic-flow');

conn.on('data', (data) => {
    // Push to web clients via WebSocket
    wss.clients.forEach(client => {
        client.send(JSON.stringify(data));
    });
});
```

## MikroTik Router Configuration

### Enable REST API (Current Method)
```routeros
/ip service
set www-ssl disabled=no
set www-ssl port=443
set www-ssl certificate=mycert.crt_0

# Allow specific IPs
set www-ssl address=192.168.0.0/16
```

### Enable API Protocol (For Backend)
```routeros
/ip service
set api-ssl disabled=no
set api-ssl port=8729
set api-ssl certificate=mycert.crt_0

# Restrict to backend server
set api-ssl address=10.0.0.5/32
```

### Create API User
```routeros
/user add name=apiuser password=strongpassword group=full
```

## Testing the Connection

### Test REST API
```bash
curl -k -u admin:password https://192.168.88.1/rest/system/resource
```

### Test API Protocol (with backend)
```javascript
const api = new RouterOSAPI({
    host: '192.168.88.1',
    user: 'admin',
    password: 'password',
    port: 8729,
    tls: true
});

await api.connect();
const data = await api.write('/system/resource/print');
console.log(data);
```

## Performance Comparison

| Method | Latency | Throughput | Real-time | Complexity |
|--------|---------|------------|-----------|------------|
| REST API | ~50ms | Good | Polling | Low ✅ |
| API Protocol | ~10ms | Excellent | Yes | Medium |
| API + Backend | ~30ms | Excellent | Yes | High |

## Recommendation

### For Current Development: ✅ **REST API** (Port 443)
- Fast to implement
- No backend needed
- Good for prototyping

### For Production: ⭐ **API Protocol with Backend** (Port 8729)
- Better performance
- Real-time capabilities
- More features
- Professional architecture

## Next Steps

1. ✅ Current REST API works great for MVP
2. Add backend when you need:
   - Real-time traffic monitoring
   - Multiple router management
   - Advanced automation
   - Better security
3. Consider hybrid approach for flexibility

## Resources

- [MikroTik REST API Docs](https://help.mikrotik.com/docs/display/ROS/REST+API)
- [MikroTik API Protocol](https://wiki.mikrotik.com/wiki/Manual:API)
- [node-routeros Package](https://www.npmjs.com/package/node-routeros)
- [RouterOS API PHP](https://github.com/EvilFreelancer/routeros-api-php)
