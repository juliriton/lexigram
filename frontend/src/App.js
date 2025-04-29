import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SettingsPage from './pages/SettingsPage';
import PostCreationPage from './pages/PostCreationPage';
import RelationshipProfilePage from './pages/RelationshipProfilePage';

import './App.css';

function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
                <Route path="/profile" element={<UserProfilePage user={user} />} />
                <Route path="/login" element={<LoginPage setUser={setUser} />} />
                <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
                <Route path="/post/create" element={<PostCreationPage user={user} />} />
                <Route path="/settings" element={<SettingsPage user={user} />} />
                <Route path="/profile/:userId" element={<RelationshipProfilePage user={user} />} />
            </Routes>
        </Router>
    );
}

export default App;
