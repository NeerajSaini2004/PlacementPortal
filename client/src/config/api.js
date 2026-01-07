// API Configuration for Production
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.railway.app/api'  // Production URL
  : 'http://localhost:5000/api';                // Development URL

export default API_BASE_URL;