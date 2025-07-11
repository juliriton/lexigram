const getApiUrl = () => {
    // If running locally (development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8080'; // Local backend
    }
    // If running on EC2 (production)
    return 'http://52.202.248.7:8080'; // Replace with your EC2 public IP or domain
};

export const API_URL = getApiUrl();