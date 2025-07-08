import React, { useState } from 'react';
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

function App() {
    axios.defaults.withCredentials = true;
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
                <Route path="/profile" element={<UserProfilePage user={user} />} />
                <Route path="/login" element={<LoginPage setUser={setUser} />} />
                <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
                <Route path="/post/create" element={<PostCreationPage user={user} />} />
                <Route path="/experience/:uuid" element={<PostViewPage user={user} setUser={setUser} />} />
                <Route path="/suggestion/:uuid" element={<PostViewPage user={user} setUser={setUser} />} />
                <Route path="/settings" element={<SettingsPage user={user} />} />
                <Route path="/profile/:userId" element={<RelationshipProfilePage user={user} />} />
                <Route path="/notifications" element={<NotificationsPage user={user} /> } />
                <Route path="/tags" element={<TagPage user={user} /> } />
                <Route path="/fork/:uuid" element={<ForkExperiencePage user={user} />} />
                <Route path="/suggestion/:uuid/reply" element={<ReplySuggestionPage user={user} />} />
                <Route path="/login/success" element={<OAuthCallbackPage setUser={setUser} />} />
            </Routes>
        </Router>
    );
}

export default App;