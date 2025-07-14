import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../Api";

const OAuthCallbackPage = ({ setUser }) => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const completeOAuthFlow = async () => {
            try {
                console.log('OAuth callback: Starting authentication flow');

                // First, verify if we're coming from OAuth redirect
                const isOAuthRedirect = window.location.pathname === '/oauth-callback';

                if (isOAuthRedirect) {
                    // Clear any query parameters that might interfere
                    window.history.replaceState({}, document.title, '/oauth-callback');
                }

                // Verify the session and get user data
                const userResponse = await fetch(`${API_URL}/api/auth/oauth2/success`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-cache'
                });

                console.log('OAuth callback: Response status:', userResponse.status);

                if (!userResponse.ok) {
                    throw new Error(userResponse.status === 401
                        ? 'Session verification failed - not authenticated'
                        : `Session verification failed with status: ${userResponse.status}`);
                }

                const userData = await userResponse.json();
                console.log('OAuth callback: User data received:', userData);

                setUser(userData);
                navigate('/', { replace: true }); // Use replace to prevent back navigation to callback

            } catch (error) {
                console.error('OAuth Error:', error);
                setError(error.message);
                setIsLoading(false);
                navigate('/login?error=oauth_failed', { replace: true });
            }
        };

        completeOAuthFlow();
    }, [navigate, setUser]);

    if (error) {
        return (
            <div className="loading-container" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h2>Authentication Error</h2>
                <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
                <p>Redirecting to login page...</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="loading-container" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="spinner" style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 2s linear infinite'
                }}></div>
                <p style={{ marginTop: '20px' }}>Completing authentication...</p>
            </div>
        );
    }

    return null;
};

export default OAuthCallbackPage;