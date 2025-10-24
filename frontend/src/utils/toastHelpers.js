// src/utils/toastHelpers.js
import toast from 'react-hot-toast';

/**
 * Show loading toast
 */
export const showLoading = (message) => {
  return toast.loading(message);
};

/**
 * Dismiss a specific toast
 */
export const dismiss = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Show success toast
 */
export const showSuccess = (message, icon = '✅') => {
  return toast.success(message, {
    duration: 4000,
    icon: icon,
  });
};

/**
 * Show error toast(s)
 * Handles both single errors and arrays of errors
 */
export const showError = (error) => {
  if (error.errors && Array.isArray(error.errors)) {
    // Multiple validation errors
    error.errors.forEach((err) => {
      toast.error(err, { duration: 4000 });
    });
  } else if (error.message) {
    // Single error with message
    toast.error(error.message, {
      duration: 4000,
      icon: '❌',
    });
  } else if (typeof error === 'string') {
    // Simple string error
    toast.error(error, {
      duration: 4000,
      icon: '❌',
    });
  } else {
    // Unknown error
    toast.error('An unexpected error occurred', {
      duration: 4000,
      icon: '❌',
    });
  }
};