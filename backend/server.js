require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { RouterOSAPI } = require('node-routeros');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Global Error Handlers to prevent server crashes
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 8080;

const PROTOCOL_VERSION = '2.0';

// REST API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

const safeSend = (ws, payload) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
    }
};

const sendResponse = (ws, id, payload) => {
    safeSend(ws, { id, ok: true, payload });
};

const sendError = (ws, id, message, code = 'bridge_error') => {
    safeSend(ws, { id, ok: false, error: { code, message } });
};

const sendEvent = (ws, action, payload) => {
    safeSend(ws, { type: 'event', action, payload });
};

// WebSocket Bridge (Protocol v2)
wss.on('connection', (ws) => {
    console.log('Client connected');
    const sessionId = randomUUID();
    let routerClient = null;
    let routerState = {
        connected: false,
        host: null,
        port: null,
        connectedAt: null
    };

    const resetRouterState = () => {
        routerState = {
            connected: false,
            host: null,
            port: null,
            connectedAt: null
        };
    };

    ws.on('message', async (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            sendError(ws, null, 'Invalid JSON payload', 'invalid_json');
            return;
        }

        const { id, action, payload } = data || {};
        if (!id || !action) {
            sendError(ws, id || null, 'Missing request id or action', 'invalid_request');
            return;
        }

        try {
            if (action === 'bridge.hello') {
                sendResponse(ws, id, {
                    sessionId,
                    protocol: PROTOCOL_VERSION,
                    serverTime: new Date().toISOString()
                });
                return;
            }

            if (action === 'bridge.ping') {
                sendResponse(ws, id, { serverTime: new Date().toISOString() });
                return;
            }

            if (action === 'router.status') {
                sendResponse(ws, id, { ...routerState });
                return;
            }

            if (action === 'router.connect') {
                const { host, username, password, port = 8728, tls = false } = payload || {};
                if (!host || !username || !password) {
                    sendError(ws, id, 'host, username, and password are required', 'invalid_router_config');
                    return;
                }

                if (routerClient) {
                    try {
                        await routerClient.close();
                    } catch (closeError) {
                        console.warn('Error closing previous router connection:', closeError);
                    }
                }

                routerClient = new RouterOSAPI({
                    host,
                    user: username,
                    password,
                    port,
                    tls,
                    keepalive: true
                });

                routerClient.on('error', (error) => {
                    console.error('RouterOS Client Error:', error);
                    resetRouterState();
                    sendEvent(ws, 'router.error', { message: error.message || 'Router connection error' });
                });

                try {
                    await routerClient.connect();
                    routerState = {
                        connected: true,
                        host,
                        port,
                        connectedAt: new Date().toISOString()
                    };
                    sendResponse(ws, id, { ...routerState });
                    console.log(`Connected to router ${host}`);
                    return;
                } catch (error) {
                    resetRouterState();
                    try {
                        await routerClient.close();
                    } catch (closeError) {
                        console.warn('Error closing failed router connection:', closeError);
                    }
                    routerClient = null;
                    throw error;
                }
            }

            if (action === 'router.disconnect') {
                if (routerClient) {
                    try {
                        await routerClient.close();
                    } catch (closeError) {
                        console.warn('Error closing router connection:', closeError);
                    }
                }
                resetRouterState();
                sendResponse(ws, id, { disconnected: true });
                return;
            }

            if (action === 'router.command') {
                if (!routerClient || !routerState.connected) {
                    sendError(ws, id, 'Router not connected', 'router_not_connected');
                    return;
                }

                const { command, params = [] } = payload || {};
                if (!command) {
                    sendError(ws, id, 'command is required', 'invalid_command');
                    return;
                }

                const result = await routerClient.write(command, params);
                sendResponse(ws, id, { command, data: result });
                return;
            }

            sendError(ws, id, `Unknown action: ${action}`, 'unknown_action');
        } catch (error) {
            console.error('Error processing request:', error);
            sendError(ws, id, error.message || 'Request failed', 'request_failed');
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        if (routerClient) {
            routerClient.close().catch(err => console.error('Error closing router connection:', err));
        }
        resetRouterState();
    });
});

server.listen(PORT, () => {
    console.log(`Devnet Backend Server running on port ${PORT}`);
});
