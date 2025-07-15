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

                // Add a small delay to ensure session is established
                await new Promise(resolve => setTimeout(resolve, 500));

                // Try to get user data from the main auth endpoint
                const userResponse = await fetch(`${API_URL}/api/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-cache'
                });

                console.log('OAuth callback: Response status:', userResponse.status);

                if (!userResponse.ok) {
                    // If /me fails, try the OAuth-specific endpoint
                    const oauthResponse = await fetch(`${API_URL}/api/auth/oauth2/success`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-cache'
                    });

                    if (!oauthResponse.ok) {
                        throw new Error('Authentication failed - session not established');
                    }

                    const oauthData = await oauthResponse.json();
                    console.log('OAuth callback: User data from OAuth endpoint:', oauthData);
                    setUser(oauthData);
                } else {
                    const userData = await userResponse.json();
                    console.log('OAuth callback: User data from /me endpoint:', userData);
                    setUser(userData);
                }

                // Successfully authenticated, redirect to home
                navigate('/', { replace: true });

            } catch (error) {
                console.error('OAuth Error:', error);
                setError(error.message);
                setIsLoading(false);

                // Wait a moment before redirecting to show error
                setTimeout(() => {
                    navigate('/login?error=oauth_failed', { replace: true });
                }, 2000);
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
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};

export default OAuthCallbackPage;