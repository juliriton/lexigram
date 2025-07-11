import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {API_URL} from "../Api";

const OAuthCallbackPage = ({ setUser }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const completeOAuthFlow = async () => {
            try {
                // 1. First verify the OAuth success endpoint
                const oauthResponse = await fetch(`${API_URL}/api/auth/oauth2/success`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!oauthResponse.ok) {
                    throw new Error(`OAuth verification failed: ${oauthResponse.status}`);
                }

                const userData = await oauthResponse.json();

                // 2. Verify the session is properly set
                const sessionResponse = await fetch(`${API_URL}/api/auth/me`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!sessionResponse.ok) {
                    throw new Error(`Session verification failed: ${sessionResponse.status}`);
                }

                // 3. Update application state
                localStorage.setItem('userId', userData.id);
                setUser(userData);
                navigate('/'); // Redirect to home on success

            } catch (error) {
                console.error('OAuth Error:', error);
                const errorMessage = error.message || 'oauth_error';
                navigate(`/login?error=${encodeURIComponent(errorMessage)}`, {
                    state: { from: location },
                    replace: true
                });
            }
        };

        completeOAuthFlow();
    }, [navigate, location, setUser]);

    return (
        <div className="loading-container">
            <p>Completing authentication...</p>
        </div>
    );
};

export default OAuthCallbackPage;