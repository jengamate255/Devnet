import { useState, useCallback, useRef } from 'react';
import detectionService from '../services/RobustDetectionService';

/**
 * React Hook for MikroTik Router Detection
 * 
 * Features:
 * - Progress tracking
 * - Cancellation support
 * - Error handling
 * - Cache management
 */
export function useRouterDetection() {
    const [isDetecting, setIsDetecting] = useState(false);
    const [progress, setProgress] = useState({
        stage: null,
        progress: 0,
        message: '',
        current: 0,
        total: 0
    });
    const [detectedRouter, setDetectedRouter] = useState(null);
    const [detectedRouters, setDetectedRouters] = useState([]);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);

    /**
     * Start router detection (Find first)
     */
    const detectRouter = useCallback(async (options = {}) => {
        setIsDetecting(true);
        setError(null);
        setDetectedRouter(null);
        setDetectedRouters([]);
        setProgress({
            stage: 'initializing',
            progress: 0,
            message: 'Starting detection...',
            current: 0,
            total: 0
        });

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        try {
            const result = await detectionService.detectRouter({
                ...options,
                signal: abortControllerRef.current.signal,
                onProgress: (progressData) => {
                    setProgress(progressData);
                }
            });

            if (result) {
                setDetectedRouter(result);
                setDetectedRouters([result]);
                setProgress({
                    stage: 'complete',
                    progress: 100,
                    message: `Found router at ${result.ip}`,
                    current: 1,
                    total: 1
                });
                return result;
            } else {
                setProgress({
                    stage: 'complete',
                    progress: 100,
                    message: 'No router found',
                    current: 0,
                    total: 0
                });
                return null;
            }

        } catch (err) {
            setError(err.message);
            setProgress({
                stage: 'error',
                progress: 0,
                message: err.message,
                current: 0,
                total: 0
            });
            return null;
        } finally {
            setIsDetecting(false);
            abortControllerRef.current = null;
        }
    }, []);

    /**
     * Detect ALL routers on the network
     */
    const detectAllRouters = useCallback(async (options = {}) => {
        setIsDetecting(true);
        setError(null);
        setDetectedRouter(null);
        setDetectedRouters([]);
        setProgress({
            stage: 'initializing',
            progress: 0,
            message: 'Initializing full scan...',
            current: 0,
            total: 0,
            found: 0
        });

        abortControllerRef.current = new AbortController();

        try {
            const results = await detectionService.detectAllRouters({
                ...options,
                signal: abortControllerRef.current.signal,
                onProgress: (progressData) => {
                    setProgress(progressData);
                }
            });

            setDetectedRouters(results);
            if (results && results.length > 0) {
                setDetectedRouter(results[0]); // Default to first one found
            }

            return results;

        } catch (err) {
            setError(err.message);
            setProgress({
                stage: 'error',
                progress: 0,
                message: err.message,
                current: 0,
                total: 0
            });
            return null;
        } finally {
            setIsDetecting(false);
            abortControllerRef.current = null;
        }
    }, []);

    /**
     * Cancel ongoing detection
     */
    const cancelDetection = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setProgress({
                stage: 'cancelled',
                progress: 0,
                message: 'Detection cancelled',
                current: 0,
                total: 0
            });
        }
        detectionService.cancelScan();
    }, []);

    /**
     * Clear cache
     */
    const clearCache = useCallback(() => {
        detectionService.clearCache();
    }, []);

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        setIsDetecting(false);
        setProgress({
            stage: null,
            progress: 0,
            message: '',
            current: 0,
            total: 0
        });
        setDetectedRouter(null);
        setDetectedRouters([]);
        setError(null);
    }, []);

    return {
        // State
        isDetecting,
        progress,
        detectedRouter,
        detectedRouters,
        error,

        // Actions
        detectRouter,
        detectAllRouters,
        cancelDetection,
        clearCache,
        reset
    };
}

export default useRouterDetection;
