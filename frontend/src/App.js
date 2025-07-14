import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SettingsPage from './pages/SettingsPage';
import PostCreationPage from './pages/PostCreationPage';
import RelationshipProfilePage from './pages/RelationshipProfilePage';
import NotificationsPage from "./pages/NotificationsPage";
import TagPage from "./pages/TagPage";
import ForkExperiencePage from "./pages/ForkExperiencePage";
import ReplySuggestionPage from "./pages/ReplySuggestionPage";
import PostViewPage from "./pages/PostViewPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import './App.css';
import axios from "axios";
import { API_URL } from './Api.js';

function AppContent({ user, setUser, userLoading, authChecked, fetchCurrentUser }) {
    const location = useLocation();

    // Check for OAuth success parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get('oauth') === 'success') {
            // Remove the parameter from URL and fetch user data
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchCurrentUser();
        }
    }, [location.search, fetchCurrentUser]);

    return (
        <Routes>
            <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
            <Route path="/profile" element={<UserProfilePage user={user} setUser={setUser} />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
            <Route path="/post/create" element={<PostCreationPage user={user} setUser={setUser} />} />

            {/* Post view routes - these should work even without authentication */}
            <Route path="/experience/:uuid" element={<PostViewPage user={user} setUser={setUser} />} />
            <Route path="/suggestion/:uuid" element={<PostViewPage user={user} setUser={setUser} />} />

            <Route path="/settings" element={<SettingsPage user={user} setUser={setUser} />} />
            <Route path="/profile/:userId" element={<RelationshipProfilePage user={user} setUser={setUser} />} />
            <Route path="/notifications" element={<NotificationsPage user={user} setUser={setUser} />} />
            <Route path="/tags" element={<TagPage user={user} setUser={setUser} />} />
            <Route path="/fork/:uuid" element={<ForkExperiencePage user={user} setUser={setUser} />} />
            <Route path="/suggestion/:uuid/reply" element={<ReplySuggestionPage user={user} setUser={setUser} />} />
            <Route path="/oauth-callback" element={<OAuthCallbackPage setUser={setUser} />} />

            {/* Catch-all route for 404s - redirect to home */}
            <Route path="*" element={<HomePage user={user} setUser={setUser} />} />
        </Routes>
    );
}

function App() {
    axios.defaults.withCredentials = true;
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    const fetchCurrentUser = async () => {
        try {
            console.log('Fetching current user from:', `${API_URL}/api/auth/me`);
            const res = await fetch(`${API_URL}/api/auth/me`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add cache control to prevent cached 401 responses
                cache: 'no-cache'
            });

            console.log('Auth response status:', res.status);

            if (res.ok) {
                const userData = await res.json();
                console.log('User authenticated:', userData);
                setUser(userData);
            } else {
                console.log('User not authenticated, status:', res.status);
                setUser(null);
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
            setUser(null);
        } finally {
            setUserLoading(false);
            setAuthChecked(true);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const enhancedSetUser = (userData) => {
        console.log('Setting user data:', userData);
        setUser(userData);
    };

    // Show loading only if we haven't checked auth yet
    if (userLoading && !authChecked) {
        return (
            <div className="container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <AppContent
                user={user}
                setUser={enhancedSetUser}
                userLoading={userLoading}
                authChecked={authChecked}
                fetchCurrentUser={fetchCurrentUser}
            />
        </Router>
    );
}

export default App;