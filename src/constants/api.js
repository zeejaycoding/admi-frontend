const getRegionApiUrl = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  
  if (baseUrl) return baseUrl;
  
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080/api/v1';
  }
  
  
  
  return 'https://admi-service.onrender.com/api/v1';
};

export const API_BASE_URL = getRegionApiUrl();


