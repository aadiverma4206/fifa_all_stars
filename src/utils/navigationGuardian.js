/**
 * Centralized Navigation Guardian
 * Protects application against:
 * 1. Rapid repeated route clicks / route thrashing.
 * 2. Duplicate navigation pushes to the identical active URL.
 * 3. Navigation while a critical operation (payment, score submission, upload) is active.
 */

import toast from 'react-hot-toast';

let lastNavTime = 0;
let lastNavPath = '';
const NAV_THROTTLE_MS = 350;

let criticalOperationKey = null;

/**
 * Register that a critical operation has started (e.g. 'PAYMENT', 'SUBMIT_SCORE', 'UPLOAD_VIDEO')
 */
export function setCriticalOperation(operationKey) {
  criticalOperationKey = operationKey;
}

/**
 * Clear the critical operation flag
 */
export function clearCriticalOperation() {
  criticalOperationKey = null;
}

/**
 * Check if a critical operation is currently active
 */
export function isCriticalOperationActive() {
  return criticalOperationKey !== null;
}

/**
 * Check if a navigation request is safe to execute.
 * Returns true if navigation can proceed, false if blocked.
 */
export function canNavigate(targetPath) {
  // 1. Block if a critical operation is in flight
  if (criticalOperationKey) {
    toast.error('An important operation is processing. Please wait a moment before navigating away.');
    return false;
  }

  const now = Date.now();

  // 2. Prevent rapid double-clicks / hammering navigation
  if (now - lastNavTime < NAV_THROTTLE_MS) {
    return false;
  }

  // 3. Avoid duplicate push if already navigating to the identical path
  if (targetPath && targetPath === lastNavPath && now - lastNavTime < 800) {
    return false;
  }

  lastNavTime = now;
  lastNavPath = targetPath || '';
  return true;
}

/**
 * Wrap a navigate function with the navigation guardian
 */
export function safeNavigate(navigate, targetPath, options) {
  if (!canNavigate(targetPath)) return;
  navigate(targetPath, options);
}
