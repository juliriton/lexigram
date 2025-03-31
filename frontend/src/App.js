import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importing components (you need to create these components)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Define Routes for each page */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </Router>
    );
}

export default App;
