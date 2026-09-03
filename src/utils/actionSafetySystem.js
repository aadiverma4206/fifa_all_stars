/**
 * Centralized Button Action Safety System
 * Implements a unified, production-grade 9-step action lifecycle across the application:
 * 
 * 1. Validate required input (form values, ranges, network online check).
 * 2. Check whether the action is already running.
 * 3. Prevent duplicate execution.
 * 4. Lock the button/action (mutex + DOM lock).
 * 5. Start loading (triggers loading state & visual indicators).
 * 6. Execute the action (asynchronously awaits operation).
 * 7. Handle success (toasts, callbacks, clean data return).
 * 8. Handle errors (sanitized messaging, error logging, data preservation).
 * 9. Always restore the correct state (guaranteed finally block restoration).
 *
 * Preserves 100% of existing UI, component appearance, colors, hover, and responsive layout.
 */

import toast from 'react-hot-toast';
import { getErrorMessage, logActionError, checkNetworkOnline } from './errorUtils';

// Global registry of currently running action keys
const runningActions = new Set();

/**
 * Check if a global action key is currently running
 */
export function isActionRunning(actionKey) {
  if (!actionKey) return false;
  return runningActions.has(actionKey);
}

/**
 * Register a running action key
 */
export function lockGlobalAction(actionKey) {
  if (!actionKey) return;
  runningActions.add(actionKey);
}

/**
 * Release a running action key
 */
export function releaseGlobalAction(actionKey) {
  if (!actionKey) return;
  runningActions.delete(actionKey);
}

/**
 * Run pre-flight validation on the provided validation rule.
 * Supports:
 * - Boolean (true = valid, false = invalid)
 * - Function returning boolean, string (error message), or { isValid, message, field }
 * - Array of validation rules: [{ check: () => boolean, field: string, message: string }]
 */
export function runActionValidation(validator, ...args) {
  if (!validator) return { isValid: true };

  // 1. Array of rules
  if (Array.isArray(validator)) {
    for (const rule of validator) {
      if (typeof rule.check === 'function') {
        const result = rule.check(...args);
        if (typeof result === 'object' && result !== null) {
          if (!result.isValid) {
            if (result.message) toast.error(result.message);
            return { isValid: false, message: result.message, field: rule.field };
          }
        } else if (result === false) {
          const msg = rule.message || 'Please check the required fields.';
          toast.error(msg);
          return { isValid: false, message: msg, field: rule.field };
        }
      }
    }
    return { isValid: true };
  }

  // 2. Function validator
  if (typeof validator === 'function') {
    const res = validator(...args);
    if (typeof res === 'object' && res !== null) {
      if (!res.isValid) {
        if (res.message) toast.error(res.message);
        return { isValid: false, message: res.message, field: res.field };
      }
      return { isValid: true };
    }
    if (typeof res === 'string' && res.trim()) {
      toast.error(res);
      return { isValid: false, message: res };
    }
    if (res === false) {
      return { isValid: false, message: 'Validation failed.' };
    }
    return { isValid: true };
  }

  // 3. Simple boolean
  if (validator === false) {
    return { isValid: false, message: 'Validation failed.' };
  }

  return { isValid: true };
}

/**
 * Execute an action with the centralized 9-step safety lifecycle.
 * 
 * @param {Function} actionFn The async or sync operation to execute.
 * @param {Object} options Configuration for validation, locking, messaging, and callbacks.
 * @returns {Promise<{ success: boolean, data?: any, error?: any, reason?: string }>}
 */
export async function executeSafeActionPipeline(actionFn, options = {}) {
  const {
    actionKey = null,
    validate = null,
    context = 'buttonAction',
    successMessage = null,
    errorMessage = null,
    requireOnline = true,
    lockDuration = 400,
    isLockedRef = null,
    onStart = null,
    onSuccess = null,
    onError = null,
    onSettled = null,
    args = []
  } = options;

  // STEP 1: Validate required inputs & network connectivity
  if (requireOnline && !checkNetworkOnline()) {
    return { success: false, reason: 'OFFLINE' };
  }

  if (validate) {
    const validationResult = runActionValidation(validate, ...args);
    if (!validationResult.isValid) {
      return { success: false, reason: 'VALIDATION_FAILED', error: validationResult.message };
    }
  }

  // STEP 2: Check whether the action is already running
  if (isLockedRef && isLockedRef.current) {
    return { success: false, reason: 'ALREADY_RUNNING' };
  }

  if (actionKey && isActionRunning(actionKey)) {
    return { success: false, reason: 'ACTION_KEY_LOCKED' };
  }

  // STEP 3: Prevent duplicate execution (lock immediately before any async gap)
  // STEP 4: Lock the button/action
  if (isLockedRef) {
    isLockedRef.current = true;
  }
  if (actionKey) {
    lockGlobalAction(actionKey);
  }

  // STEP 5: Start loading
  if (typeof onStart === 'function') {
    onStart();
  }

  try {
    // STEP 6: Execute the action
    const result = await Promise.resolve(actionFn(...args));

    // STEP 7: Handle success
    if (successMessage) {
      toast.success(successMessage);
    }
    if (typeof onSuccess === 'function') {
      onSuccess(result);
    }

    return { success: true, data: result };
  } catch (err) {
    // STEP 8: Handle errors safely
    logActionError(context, err);
    const userMessage = errorMessage || getErrorMessage(err, context);
    toast.error(userMessage);

    if (typeof onError === 'function') {
      onError(err, userMessage);
    }

    return { success: false, error: err, userMessage };
  } finally {
    // STEP 9: Always restore the correct state (stop loading, release lock after cooldown)
    if (typeof onSettled === 'function') {
      onSettled();
    }

    setTimeout(() => {
      if (isLockedRef) {
        isLockedRef.current = false;
      }
      if (actionKey) {
        releaseGlobalAction(actionKey);
      }
    }, lockDuration);
  }
}
