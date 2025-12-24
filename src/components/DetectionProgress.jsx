import React from 'react';

/**
 * Detection Progress Component
 * 
 * Displays real-time progress of router detection
 */
const DetectionProgress = ({ progress, isDetecting, onCancel }) => {
    if (!isDetecting && !progress.stage) return null;

    const getStageIcon = (stage) => {
        switch (stage) {
            case 'cache': return '💾';
            case 'priority': return '🎯';
            case 'network': return '🔍';
            case 'backend': return '🖥️';
            case 'complete': return '✅';
            case 'error': return '❌';
            case 'cancelled': return '⏹️';
            default: return '⏳';
        }
    };

    const getStageColor = (stage) => {
        switch (stage) {
            case 'complete': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'cancelled': return 'text-yellow-400';
            default: return 'text-blue-400';
        }
    };

    const getProgressBarColor = (stage) => {
        switch (stage) {
            case 'complete': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'cancelled': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStageIcon(progress.stage)}</span>
                    <div>
                        <div className={`font-semibold ${getStageColor(progress.stage)}`}>
                            {progress.message || 'Detecting...'}
                        </div>
                        {progress.total > 0 && (
                            <div className="text-xs text-gray-400">
                                {progress.current} of {progress.total} addresses scanned
                            </div>
                        )}
                    </div>
                </div>

                {isDetecting && (
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full ${getProgressBarColor(progress.stage)} transition-all duration-300`}
                    style={{ width: `${progress.progress}%` }}
                />
            </div>

            {/* Progress percentage */}
            <div className="text-right text-xs text-gray-400 mt-1">
                {progress.progress}%
            </div>

            {/* Batch size info (for network scan) */}
            {progress.batchSize && (
                <div className="text-xs text-gray-500 mt-2">
                    Adaptive batch size: {progress.batchSize} IPs per batch
                </div>
            )}
        </div>
    );
};

export default DetectionProgress;
