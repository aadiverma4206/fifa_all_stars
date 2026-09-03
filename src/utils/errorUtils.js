import toast from 'react-hot-toast';

/**
 * Central Error Utility -- FIFA All Stars
 * Maps runtime exceptions to safe, user-friendly messages.
 * NEVER exposes: stack traces, internal IDs, store internals, or backend details.
 */

/**
 * Returns a safe, user-friendly error message for toast notifications.
 * @param {Error|string|object|null} err - The caught error
 * @param {string} [context] - Short description of the action (e.g. 'saving club details')
 * @returns {string}
 */
export function getErrorMessage(err, context = '') {
  const contextSuffix = context ? ` while ${context}` : '';

  if (!err) {
    return `Something went wrong${contextSuffix}. Please try again.`;
  }

  const rawMsg = (
    typeof err === 'string'
      ? err
      : err?.message || err?.error || ''
  ).toLowerCase();

  // Business / Logic Errors
  if (rawMsg.includes('already') && rawMsg.includes('registered')) {
    return 'You are already registered for this activity.';
  }
  if (rawMsg.includes('already') || rawMsg.includes('duplicate')) {
    return 'This action has already been performed. Please refresh and try again.';
  }
  if (rawMsg.includes('not found') || rawMsg.includes('cannot find')) {
    return 'The requested record could not be found. It may have been removed.';
  }
  if (rawMsg.includes('completed') && rawMsg.includes('locked')) {
    return 'This match is completed and the roster is permanently locked.';
  }
  if (rawMsg.includes('full') || rawMsg.includes('capacity')) {
    return 'All slots are full. Please check waitlist availability.';
  }

  // Authorization / Permission Errors
  if (rawMsg.includes('unauthorized') || rawMsg.includes('only super admin') || rawMsg.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }
  if (rawMsg.includes('suspended')) {
    return 'This account is suspended. Please contact support.';
  }
  if (rawMsg.includes('owner') && rawMsg.includes('never')) {
    return 'This account is protected and cannot be modified.';
  }
  if (rawMsg.includes('manager') && rawMsg.includes('not allowed')) {
    return 'Club Managers are not permitted to perform this player action.';
  }

  // Financial / Wallet Errors
  if (rawMsg.includes('insufficient') || rawMsg.includes('balance')) {
    return 'Insufficient wallet balance for this action. Please top up your wallet.';
  }
  if (rawMsg.includes('refund') && rawMsg.includes('already')) {
    return 'This refund has already been processed.';
  }

  // Authentication & Credential Errors
  if (rawMsg.includes('invalid email or password') || rawMsg.includes('invalid credentials')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (rawMsg.includes('email already') || rawMsg.includes('account with this email')) {
    return 'An account with this email address already exists. Please try signing in.';
  }
  if (rawMsg.includes('session expired') || rawMsg.includes('jwt') || rawMsg.includes('token expired')) {
    return 'Your session has expired. Please sign in again.';
  }

  // Network / Infrastructure Errors
  if (
    rawMsg.includes('network') ||
    rawMsg.includes('failed to fetch') ||
    rawMsg.includes('connection') ||
    rawMsg.includes('timeout') ||
    rawMsg.includes('offline') ||
    rawMsg.includes('err_internet_disconnected') ||
    rawMsg.includes('econnrefused')
  ) {
    return 'Network error: Unable to connect to the server. Please check your internet connection.';
  }
  if (rawMsg.includes('server') || rawMsg.includes('500') || rawMsg.includes('502') || rawMsg.includes('503') || rawMsg.includes('504')) {
    return 'The server encountered an issue. Please try again in a few moments.';
  }
  if (rawMsg.includes('401') || rawMsg.includes('403')) {
    return 'Your session may have expired or access was restricted. Please sign in again.';
  }

  // Validation Errors
  if (rawMsg.includes('validation') || rawMsg.includes('invalid input') || rawMsg.includes('required')) {
    return 'Please check your inputs and ensure all required fields are filled out correctly.';
  }

  // Safe generic fallback -- never expose raw error message, stack traces or internals
  const actionLabel = context || 'complete this action';
  return `Unable to ${actionLabel}. Please try again or contact support if the issue persists.`;
}

/**
 * Checks if client is online. If offline, returns false and optionally displays a safe toast.
 * @param {boolean} [showToast=true]
 * @returns {boolean}
 */
export function checkNetworkOnline(showToast = true) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    if (showToast) {
      toast.error('You appear to be offline. Please check your internet connection.');
    }
    return false;
  }
  return true;
}

/**
 * Logs an error safely for debugging (development only).
 * @param {string} action
 * @param {Error|any} err
 */
export function logActionError(action, err) {
  if (typeof window !== 'undefined' && import.meta?.env?.PROD) return;
  if (typeof globalThis !== 'undefined' && globalThis.process?.env?.NODE_ENV === 'production') return;
  console.error(`[ActionError] ${action}:`, {
    message: err?.message || String(err),
    type: err?.constructor?.name || typeof err
  });
}
