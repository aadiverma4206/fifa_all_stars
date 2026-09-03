import { useState, useRef, useCallback } from 'react';
import { executeSafeActionPipeline } from '../utils/actionSafetySystem';

/**
 * useSafeAction
 * Comprehensive React hook providing a centralized button action safety system:
 * 1. Input & Network Validation before execution
 * 2. In-flight check & anti-duplicate execution
 * 3. Immediate concurrency mutex locking
 * 4. Automated loading state management
 * 5. Safe async execution
 * 6. Success notification & callback handling
 * 7. Error shielding, logging & friendly toasts
 * 8. Guaranteed state restoration in finally block
 * 9. Ergonomic `.bind` helper for spreading directly onto Button components
 */
export const useSafeAction = (actionFn, options = {}) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const isLockedRef = useRef(false);

  const reset = useCallback(() => {
    setStatus('idle');
    setIsLoading(false);
    setError(null);
    setData(null);
    isLockedRef.current = false;
  }, []);

  const execute = useCallback(async (...args) => {
    // If an event object was passed (e.g. form submit or button click), prevent default if needed
    const firstArg = args[0];
    if (firstArg && typeof firstArg.preventDefault === 'function') {
      firstArg.preventDefault();
    }

    const result = await executeSafeActionPipeline(actionFn, {
      ...options,
      isLockedRef,
      args,
      onStart: () => {
        setIsLoading(true);
        setStatus('loading');
        setError(null);
        if (typeof options.onStart === 'function') {
          options.onStart();
        }
      },
      onSuccess: (resData) => {
        setStatus('success');
        setData(resData);
        if (typeof options.onSuccess === 'function') {
          options.onSuccess(resData);
        }
      },
      onError: (err, safeMsg) => {
        setStatus('error');
        setError(safeMsg || err);
        if (typeof options.onError === 'function') {
          options.onError(err, safeMsg);
        }
      },
      onSettled: () => {
        setIsLoading(false);
        if (typeof options.onSettled === 'function') {
          options.onSettled();
        }
      }
    });

    return result;
  }, [actionFn, options]);

  return {
    execute,
    isLoading,
    isLocked: isLockedRef.current,
    status,
    data,
    error,
    reset,
    // Convenience property bag to spread directly onto Button components
    bind: {
      onClick: execute,
      isLoading,
      disabled: isLoading || options.disabled
    }
  };
};

export default useSafeAction;

