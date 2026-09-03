/**
 * Global Action Guardian
 * Provides application-wide double-click, rapid-click, validation, and duplicate submission protection.
 * Protects every action button, form submission, and API operation without modifying UI.
 */

import { isCriticalOperationActive, canNavigate } from './navigationGuardian';
import { checkNetworkOnline } from './errorUtils';
import toast from 'react-hot-toast';

// Active async action keys currently in-flight
const activeActionKeys = new Set();

/**
 * Execute an async operation with global idempotency locking by unique action key.
 * Prevents concurrent executions of the same operation.
 */
export async function withActionLock(actionKey, asyncFn) {
  if (!actionKey || typeof asyncFn !== 'function') return;
  if (activeActionKeys.has(actionKey)) {
    return;
  }

  activeActionKeys.add(actionKey);
  try {
    return await asyncFn();
  } finally {
    setTimeout(() => {
      activeActionKeys.delete(actionKey);
    }, 400);
  }
}

/**
 * Check if a specific action key is currently locked/processing
 */
export function isActionLocked(actionKey) {
  return activeActionKeys.has(actionKey);
}

/**
 * Automatically detects the semantic purpose of an action element
 */
export function detectButtonPurpose(el) {
  if (!el) return 'UNKNOWN';

  const type = el.getAttribute('type') || '';
  const text = (el.textContent || '').trim().toLowerCase();
  const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
  const role = el.getAttribute('role') || '';
  const combined = `${text} ${ariaLabel}`;

  if (type === 'submit') return 'SUBMIT';
  if (type === 'reset') return 'RESET';
  if (role === 'link' || el.tagName === 'A' || el.hasAttribute('href') || el.dataset.navTo) return 'NAV';

  if (/delete|remove|trash|cancel session|dismiss|destroy/.test(combined)) return 'DESTRUCTIVE';
  if (/logout|sign out/.test(combined)) return 'LOGOUT';
  if (/save|update|submit|edit|create|add|join|leave|book|publish/.test(combined)) return 'ASYNC_MUTATION';

  return 'INTERACTIVE';
}

/**
 * Global event interceptor initialized at the window level.
 * Catches clicks and submits during the CAPTURING phase before React or DOM handlers execute.
 */
export function initActionGuardian() {
  if (typeof window === 'undefined') return () => {};

  const CLICK_COOLDOWN_MS = 450;
  const SUBMIT_COOLDOWN_MS = 600;

  // Intercept click events in the capture phase
  const handleCaptureClick = (e) => {
    try {
      // Only target clickable action elements
      const actionEl = e.target?.closest?.(
        'button, [role="button"], input[type="submit"], input[type="button"], a[role="button"], .btn-action'
      );

      if (!actionEl) return;

      const now = Date.now();
      const purpose = detectButtonPurpose(actionEl);

      // 1. Navigation Protection: If a critical operation is in flight, prevent navigation clicks
      if (purpose === 'NAV' || actionEl.tagName === 'A' || actionEl.hasAttribute('href')) {
        if (isCriticalOperationActive()) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          toast.error('An important operation is processing. Please wait a moment before navigating away.');
          return;
        }
        const targetPath = actionEl.getAttribute('href') || actionEl.dataset?.navTo;
        if (targetPath && targetPath !== '#' && !targetPath.startsWith('javascript:') && !canNavigate(targetPath)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }
      }

      // 2. Check if element is disabled or locked
      if (
        actionEl.disabled ||
        actionEl.getAttribute('aria-disabled') === 'true' ||
        actionEl.dataset?.actionLocked === 'true'
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // 3. Form Validation Check on Submit Buttons:
      // If the button submits a form and the form is invalid, trigger native validity display and do NOT lock
      if (purpose === 'SUBMIT' && actionEl.form) {
        const form = actionEl.form;
        if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
          return;
        }
      }

      // 4. Check if clicked within cooldown window (rapid-click / double-click protection)
      const lastClickTime = actionEl._lastClickTime || 0;
      if (now - lastClickTime < CLICK_COOLDOWN_MS) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // 5. Destructive Action Confirmation Guard:
      if (actionEl.dataset?.confirm) {
        const confirmed = window.confirm(actionEl.dataset.confirm);
        if (!confirmed) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }
      }

      // 6. Online check for mutation buttons
      if (purpose === 'ASYNC_MUTATION' || actionEl.dataset?.requireOnline === 'true') {
        if (!checkNetworkOnline()) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }
      }

      // 7. Mark element with last click time and immediate lock
      actionEl._lastClickTime = now;
      if (actionEl.dataset) {
        actionEl.dataset.actionLocked = 'true';
      }

      setTimeout(() => {
        if (actionEl.dataset) {
          delete actionEl.dataset.actionLocked;
        }
      }, CLICK_COOLDOWN_MS);
    } catch (err) {
      // Fail-open: Never block user interaction if guardian encounters unexpected DOM
      console.warn('[ActionGuardian] click inspection error:', err);
    }
  };

  // Intercept form submit events in the capture phase
  const handleCaptureSubmit = (e) => {
    try {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;

      // Validate form inputs prior to lock
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        return;
      }

      const now = Date.now();
      const lastSubmitTime = form._lastSubmitTime || 0;

      // Check if form was submitted within cooldown or is actively submitting
      if (now - lastSubmitTime < SUBMIT_COOLDOWN_MS || form.dataset?.submitting === 'true') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      form._lastSubmitTime = now;
      if (form.dataset) {
        form.dataset.submitting = 'true';
      }

      // Lock all submit buttons inside this form
      const submitButtons = form.querySelectorAll?.(
        'button[type="submit"], input[type="submit"], button:not([type])'
      );
      submitButtons?.forEach?.((btn) => {
        if (btn.dataset) btn.dataset.actionLocked = 'true';
      });

      setTimeout(() => {
        if (form.dataset) delete form.dataset.submitting;
        submitButtons?.forEach?.((btn) => {
          if (btn.dataset) delete btn.dataset.actionLocked;
        });
      }, SUBMIT_COOLDOWN_MS);
    } catch (err) {
      console.warn('[ActionGuardian] submit inspection error:', err);
    }
  };

  window.addEventListener('click', handleCaptureClick, true);
  window.addEventListener('submit', handleCaptureSubmit, true);

  return () => {
    window.removeEventListener('click', handleCaptureClick, true);
    window.removeEventListener('submit', handleCaptureSubmit, true);
  };
}

export default initActionGuardian;
