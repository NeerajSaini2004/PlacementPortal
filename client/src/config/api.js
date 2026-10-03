// API Configuration for Production
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://placementportal-backend-k631.onrender.com/api'  // Production URL
  : 'http://localhost:5000/api';                // Development URL

export default API_BASE_URL;
