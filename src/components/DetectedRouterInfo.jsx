import React from 'react';

/**
 * Detected Router Display Component
 * 
 * Shows detailed information about detected router
 */
const DetectedRouterInfo = ({ router, onUse, onDismiss }) => {
    if (!router) return null;

    const getConfidenceBadge = (confidence) => {
        if (confidence >= 90) {
            return <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">High Confidence</span>;
        } else if (confidence >= 75) {
            return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">Medium Confidence</span>;
        } else {
            return <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">Low Confidence</span>;
        }
    };

    const getPortBadge = (port) => {
        if (!port) return null;

        // Handle case where port might be a number (simple scan result)
        if (typeof port === 'number' || typeof port === 'string') {
            return (
                <span className="px-2 py-1 text-xs rounded border bg-gray-500/20 text-gray-300">
                    Port {port}
                </span>
            );
        }

        const type = port.type || 'unknown';
        const colors = {
            'api-ssl': 'bg-green-500/20 text-green-300 border-green-500/30',
            'api': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            'rest-api': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            'http': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            'winbox': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        };

        return (
            <span className={`px-2 py-1 text-xs rounded border ${colors[type] || 'bg-gray-500/20'}`}>
                {type.toUpperCase()} - Port {port.port}
                {port.secure && ' 🔒'}
            </span>
        );
    };

    return (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4 mb-4 animate-in fade-in duration-300">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">🎉</div>
                    <div>
                        <div className="text-xl font-bold text-green-300">
                            MikroTik Router Found!
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                            IP Address: <span className="font-mono text-blue-300">{router.ip}</span>
                        </div>
                    </div>
                </div>

                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Fingerprint Info */}
            {router.fingerprint && (
                <div className="mb-3 p-2 bg-slate-800/30 rounded flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                        Verification: <span className="font-semibold">{router.fingerprint.method}</span>
                        {router.fingerprint.identity && (
                            <span className="ml-2">({router.fingerprint.identity})</span>
                        )}
                    </div>
                    {getConfidenceBadge(router.fingerprint.confidence)}
                </div>
            )}

            {/* Detected Ports */}
            <div className="mb-3">
                <div className="text-sm font-semibold text-gray-300 mb-2">
                    Detected Services ({router.ports.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                    {router.ports.map((port, index) => (
                        <div key={index}>
                            {getPortBadge(port)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommended Connection */}
            {router.recommended && (
                <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <div className="text-sm font-semibold text-blue-300 mb-1">
                        ⭐ Recommended Connection:
                    </div>
                    <div className="text-sm text-gray-300">
                        {(router.recommended.type || 'unknown').toUpperCase()} on port {router.recommended.port}
                        {router.recommended.secure && ' (Secure)'}
                    </div>
                    {router.recommended.identity && (
                        <div className="text-xs text-gray-400 mt-1">
                            Router Identity: {router.recommended.identity}
                        </div>
                    )}
                </div>
            )}

            {/* Source info */}
            <div className="text-xs text-gray-500 mb-3">
                Detection source: {router.source} • Found at: {new Date(router.detectedAt).toLocaleTimeString()}
            </div>

            {/* Action Button */}
            {onUse && (
                <button
                    onClick={() => onUse(router)}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                    <span>✓</span>
                    Use This Router
                </button>
            )}
        </div>
    );
};

export default DetectedRouterInfo;
