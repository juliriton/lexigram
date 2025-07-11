const getApiUrl = () => {
    // If running locally (development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8080'; // Local backend
    }

    // Use environment variable for production (Render)
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // Fallback (though you should always set the env var)
    return 'https://your-backend-service.onrender.com';
};

export const API_URL = getApiUrl();