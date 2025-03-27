import axios from 'axios';
import { toast } from 'sonner';

/**
 * Centralized error handler for API requests
 * @param {Error} error - The caught error object
 * @param {Object} options - Additional options
 * @param {boolean} options.showToast - Whether to show a toast notification (default: true)
 * @param {boolean} options.logToConsole - Whether to log to console (default: true)
 * @param {string} options.defaultMessage - Custom default message
 * @returns {string} The error message
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    logToConsole = true, 
    defaultMessage = "An unknown error occurred"
  } = options;
  
  let errorMessage = defaultMessage;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || 
                    `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request made but no response received
      errorMessage = "Network error: No response from server";
    } else {
      // Request setup error
      errorMessage = `Request error: ${error.message}`;
    }
  } else if (error instanceof Error) {
    // Non-axios error with message
    errorMessage = error.message;
  }
  
  if (showToast) {
    toast.error(errorMessage);
  }
  
  if (logToConsole) {
    console.error("Error details:", error.message);
  }
  
  return errorMessage;
};