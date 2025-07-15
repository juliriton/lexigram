import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import ExperienceForksPage from "./pages/ExperienceForksPage";
import ReplySuggestionPage from "./pages/ReplySuggestionPage";
import PostViewPage from "./pages/PostViewPage";
import SuggestionRepliesPage from "./pages/SuggestionRepliesPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import PostPopupModal from './components/PostPopUpModal';
import './App.css';
import axios from "axios";
import { API_URL } from './Api.js';

function AppContent({ user, setUser, userLoading, authChecked, fetchCurrentUser }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [showPostModal, setShowPostModal] = useState(false);
    const [modalPostUuid, setModalPostUuid] = useState(null);
    const [modalPostType, setModalPostType] = useState(null);

    // Check for OAuth success parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get('oauth') === 'success') {
            console.log('OAuth success detected, fetching user data...');
            // Remove the parameter from URL and fetch user data
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchCurrentUser();
        }
    }, [location.search, fetchCurrentUser]);

    // Check for post URL parameters (experience or suggestion)
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const experienceId = urlParams.get('experience');
        const suggestionId = urlParams.get('suggestion');

        if (experienceId) {
            console.log('Experience ID detected in URL:', experienceId);
            setModalPostUuid(experienceId);
            setModalPostType('experience');
            setShowPostModal(true);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (suggestionId) {
            console.log('Suggestion ID detected in URL:', suggestionId);
            setModalPostUuid(suggestionId);
            setModalPostType('suggestion');
            setShowPostModal(true);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.search]);

    // Handle direct URL access for experiences and suggestions
    useEffect(() => {
        const path = location.pathname;

        // Check if this is a direct access to experience or suggestion
        const experienceMatch = path.match(/^\/experience\/([a-f0-9-]+)$/);
        const suggestionMatch = path.match(/^\/suggestion\/([a-f0-9-]+)$/);

        if (experienceMatch || suggestionMatch) {
            console.log('Direct URL access detected for:', path);

            // Extract UUID and type
            const uuid = experienceMatch ? experienceMatch[1] : suggestionMatch[1];
            const type = experienceMatch ? 'experience' : 'suggestion';

            // For direct URL access, we ensure user auth is checked first
            if (!authChecked && userLoading) {
                console.log('Auth still loading, will handle after auth check');
                return;
            }

            // Auth is checked, show modal and redirect to home
            console.log('Auth checked, showing modal for:', type, uuid);
            setModalPostUuid(uuid);
            setModalPostType(type);
            setShowPostModal(true);

            // Navigate to home page while keeping the modal open
            navigate('/', { replace: true });
        }
    }, [location.pathname, authChecked, userLoading, navigate]);

    const handleCloseModal = () => {
        console.log('Closing post modal');
        setShowPostModal(false);
        setModalPostUuid(null);
        setModalPostType(null);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
                <Route path="/profile" element={<UserProfilePage user={user} setUser={setUser} />} />
                <Route path="/login" element={<LoginPage setUser={setUser} />} />
                <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
                <Route path="/post/create" element={<PostCreationPage user={user} setUser={setUser} />} />

                {/* Keep these routes for fallback/SEO purposes */}
                <Route path="/experience/:uuid" element={
                    <PostViewPage
                        user={user}
                        setUser={setUser}
                        requireAuth={false}
                    />
                } />
                <Route path="/suggestion/:uuid" element={
                    <PostViewPage
                        user={user}
                        setUser={setUser}
                        requireAuth={false}
                    />
                } />

                {/* Experience forks route */}
                <Route path="/experience/:uuid/forks" element={<ExperienceForksPage user={user} setUser={setUser} />} />

                <Route path="/settings" element={<SettingsPage user={user} setUser={setUser} />} />
                <Route path="/profile/:userId" element={<RelationshipProfilePage user={user} setUser={setUser} />} />
                <Route path="/notifications" element={<NotificationsPage user={user} setUser={setUser} />} />
                <Route path="/tags" element={<TagPage user={user} setUser={setUser} />} />
                <Route path="/suggestion/:uuid/replies" element={<SuggestionRepliesPage user={user} setUser={setUser} />} />
                <Route path="/fork/:uuid" element={<ForkExperiencePage user={user} setUser={setUser} />} />
                <Route path="/suggestion/:uuid/reply" element={<ReplySuggestionPage user={user} setUser={setUser} />} />
                <Route path="/oauth-callback" element={<OAuthCallbackPage setUser={setUser} />} />

                {/* Catch-all route for 404s - redirect to home */}
                <Route path="*" element={<HomePage user={user} setUser={setUser} />} />
            </Routes>

            {/* Post popup modal */}
            {showPostModal && modalPostUuid && (
                <PostPopupModal
                    isOpen={showPostModal}
                    onClose={handleCloseModal}
                    postUuid={modalPostUuid}
                    type={modalPostType}
                    user={user}
                    baseApiUrl={API_URL}
                    formatDate={formatDate}
                    enableFallback={true}
                />
            )}
        </>
    );
}

function App() {
    axios.defaults.withCredentials = true;
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    // Use useCallback to prevent fetchCurrentUser from being recreated on every render
    const fetchCurrentUser = useCallback(async () => {
        try {
            console.log('Fetching current user from:', `${API_URL}/api/auth/me`);
            setUserLoading(true);

            const res = await fetch(`${API_URL}/api/auth/me`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    }, []);

    // Initial auth check - only runs once
    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    // Enhanced setUser that properly manages loading states
    const enhancedSetUser = useCallback((userData) => {
        console.log('Setting user data:', userData);
        setUser(userData);
        setUserLoading(false);
        setAuthChecked(true);
    }, []);

    // Show loading only while we're actually loading and haven't checked auth yet
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