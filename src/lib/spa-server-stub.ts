// Browser-only stub for "@tanstack/react-start/server".
// The SPA/Capacitor bundle never runs server code — server functions are
// executed over HTTP on the deployed site — so these are never called.
function unavailable(): never {
  throw new Error("Server-only API is not available in the mobile/SPA bundle.");
}

export const getRequest = unavailable;
export const getRequestHeader = unavailable;
export const getRequestHeaders = unavailable;
export const setResponseHeader = unavailable;
export const setResponseHeaders = unavailable;
export const setResponseStatus = unavailable;
export const getEvent = unavailable;
