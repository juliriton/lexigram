import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {API_URL} from "../Api";

const OAuthCallbackPage = ({ setUser }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const completeOAuthFlow = async () => {
            try {
                // Verify the session
                const sessionResponse = await fetch(`${API_URL}/api/auth/oauth2/success`, {
                    credentials: 'include'
                });

                if (!sessionResponse.ok) throw new Error('Session verification failed');

                const userData = await sessionResponse.json();
                localStorage.setItem('userId', userData.id);
                setUser(userData);
                navigate('/');
            } catch (error) {
                console.error('OAuth Error:', error);
                navigate(`/login?error=oauth_failed`);
            }
        };

        completeOAuthFlow();
    }, [navigate, setUser]);

    return (
        <div className="loading-container">
            <p>Completing authentication...</p>
        </div>
    );
};

export default OAuthCallbackPage;