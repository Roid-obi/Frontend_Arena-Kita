/**
 * Centralized API configuration
 * Base URL for all API requests
 */

export const API_BASE_URL = "https://dev.api.arenakita.my.id/api/v1";
// export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
// export const API_BASE_URL = "https://unacquisitively-lakiest-jimmy.ngrok-free.dev/api/v1";

// storage
export const STORAGE_BASE_URL = "https://dev.api.arenakita.my.id/storage";
// export const STORAGE_BASE_URL = "http://127.0.0.1:8000/storage";
// export const STORAGE_BASE_URL = "https://unacquisitively-lakiest-jimmy.ngrok-free.dev/storage";

/**
 * Helper function to construct storage URL
 * @param url - The relative or absolute storage URL
 * @returns Full storage URL
 */
export const getStorageUrl = (url: string): string => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${STORAGE_BASE_URL}/${url}`;
};

/**
 * Helper function to construct API URL
 * @param endpoint - The API endpoint (e.g., "/venues", "/profile")
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
