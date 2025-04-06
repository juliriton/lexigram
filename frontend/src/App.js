import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserListPage from './pages/UserListPage';
import UserProfilePage from './pages/UserProfilePage';
import UserProfileEditPage from './pages/UserProfileEditPage'; // 👈 IMPORTANTE

import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<UserListPage />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
                <Route path="/profile/:userId/edit" element={<UserProfileEditPage />} />
            </Routes>
        </Router>
    );
}

export default App;
