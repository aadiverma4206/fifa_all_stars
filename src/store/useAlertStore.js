import { create } from 'zustand';
import toast from 'react-hot-toast';

export const useAlertStore = create((set) => ({
  isOpen: false,
  type: 'success', // 'success' | 'error' | 'warning'
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  onConfirm: null,
  onCancel: null,
  showCancelButton: false,

  showAlert: ({
    type = 'success',
    title = '',
    message = '',
    confirmText = '',
    cancelText = 'Cancel',
    onConfirm = null,
    onCancel = null,
    showCancelButton = false,
  }) => set({
    isOpen: true,
    type,
    title: title || (type === 'success' ? 'Successful !' : type === 'error' ? 'Unsuccessful !' : 'Notice !'),
    message: typeof message === 'string' ? message : String(message || ''),
    confirmText: confirmText || (type === 'error' ? 'Close' : 'OK'),
    cancelText,
    onConfirm,
    onCancel,
    showCancelButton,
  }),

  closeAlert: () => set({ isOpen: false, onConfirm: null, onCancel: null }),
}));

// Global Toast Interceptor to redirect all toast.success and toast.error to Center Modal
export const initToastBridge = () => {
  if (typeof window === 'undefined') return;
  if (window.__toastBridgeInitialized) return;
  window.__toastBridgeInitialized = true;

  toast.success = (message, options) => {
    const rawMsg = typeof message === 'string' ? message : String(message || '');
    const cleanMsg = rawMsg.replace(/^[\p{Emoji}\s]+/u, '').trim() || rawMsg;
    
    let defaultTitle = 'Successful !';
    if (/payment|wallet|added|credit/i.test(cleanMsg)) {
      defaultTitle = 'Payment Successful !';
    } else if (/profile/i.test(cleanMsg)) {
      defaultTitle = 'Profile Updated !';
    } else if (/match|game|tournament|squad/i.test(cleanMsg)) {
      defaultTitle = 'Action Successful !';
    }

    useAlertStore.getState().showAlert({
      type: 'success',
      title: options?.title || defaultTitle,
      message: cleanMsg,
      confirmText: options?.confirmText || 'Yes, Proceed',
    });
    return 'global-alert-id';
  };

  toast.error = (message, options) => {
    const rawMsg = typeof message === 'string' ? message : String(message || '');
    const cleanMsg = rawMsg.replace(/^[\p{Emoji}\s]+/u, '').trim() || rawMsg;

    let defaultTitle = 'Unsuccessful !';
    if (/payment|wallet|fund|balance|limit|cap/i.test(cleanMsg)) {
      defaultTitle = 'Payment Unsuccessful !';
    } else if (/card|cvv|expiry/i.test(cleanMsg)) {
      defaultTitle = 'Card Validation Failed !';
    }

    useAlertStore.getState().showAlert({
      type: 'error',
      title: options?.title || defaultTitle,
      message: cleanMsg,
      confirmText: options?.confirmText || 'Close',
    });
    return 'global-alert-id';
  };

  toast.dismiss = () => {
    useAlertStore.getState().closeAlert();
  };
};
