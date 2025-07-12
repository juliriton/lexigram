import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
    axios.defaults.withCredentials = true;
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    // Function to fetch current user from server
    const fetchCurrentUser = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                credentials: 'include'
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
            setUser(null);
        } finally {
            setUserLoading(false);
        }
    };

    // Fetch user on app initialization
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    // Enhanced setUser function that also updates the server session
    const enhancedSetUser = (userData) => {
        setUser(userData);
    };

    if (userLoading) {
        return (
            <div className="container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage user={user} setUser={enhancedSetUser} />} />
                <Route path="/profile" element={<UserProfilePage user={user} setUser={enhancedSetUser} />} />
                <Route path="/login" element={<LoginPage setUser={enhancedSetUser} />} />
                <Route path="/signup" element={<SignUpPage setUser={enhancedSetUser} />} />
                <Route path="/post/create" element={<PostCreationPage user={user} setUser={enhancedSetUser} />} />
                <Route path="/experience/:uuid" element={<PostViewPage user={user} setUser={enhancedSetUser} />} />
                <Route path="/suggestion/:uuid" element={<PostViewPage user={user} setUser={enhancedSetUser} />} />
                <Route path="/settings" element={<SettingsPage user={user} setUser={enhancedSetUser} />} />
                <Route path="/profile/:userId" element={<RelationshipProfilePage user={user} setUser={enhancedSetUser} />} />
                <Route path="/notifications" element={<NotificationsPage user={user} setUser={enhancedSetUser} />} />
                <Route path="/tags" element={<TagPage user={user} setUser={enhancedSetUser} />} />
                <Route path="/fork/:uuid" element={<ForkExperiencePage user={user} setUser={enhancedSetUser} />} />
                <Route path="/suggestion/:uuid/reply" element={<ReplySuggestionPage user={user} setUser={enhancedSetUser} />} />
                <Route path="/login/success" element={<OAuthCallbackPage setUser={enhancedSetUser} />} />
            </Routes>
        </Router>
    );
}

export default App;