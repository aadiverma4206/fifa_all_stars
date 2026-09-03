import { useEffect, useCallback } from 'react';

/**
 * useUnsavedChanges
 * Production-ready hook to protect users against accidental data loss:
 * 1. Attaches beforeunload listener when isDirty is true (browser tab close/reload protection).
 * 2. Provides safe navigation interceptor `confirmDiscard(onProceed)` which only prompts when changes exist.
 * 
 * @param {boolean} isDirty Whether the active form has unsaved modifications.
 * @param {string} [customMessage] Custom prompt message if needed.
 */
export const useUnsavedChanges = (isDirty, customMessage = 'You have unsaved changes. Are you sure you want to leave without saving?') => {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = customMessage;
      return customMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, customMessage]);

  const confirmDiscard = useCallback((onProceed) => {
    if (!isDirty) {
      if (typeof onProceed === 'function') onProceed();
      return true;
    }

    const confirmed = window.confirm(customMessage);
    if (confirmed && typeof onProceed === 'function') {
      onProceed();
    }
    return confirmed;
  }, [isDirty, customMessage]);

  return {
    isDirty,
    confirmDiscard
  };
};

export default useUnsavedChanges;
