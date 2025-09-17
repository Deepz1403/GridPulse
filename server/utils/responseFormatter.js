export const formatResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

export const formatError = (message, details = null) => {
  return {
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  };
};
