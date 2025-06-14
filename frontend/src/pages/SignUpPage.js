import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/SignUpPage.css';

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        if (password.length < 8) {
            setError('Password must have at least 8 characters');
            return false;
        }

        if (/[A-Z]/.test(username)) {
            setError('Username must be lowercase only');
            return false;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email');
            return false;
        }

        return true;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Username or email already in use');
                setLoading(false);
                return;
            }

            navigate('/');
        } catch (err) {
            setError('An error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Create Your Account 📝</h2>
                {error && <div className="error-message"><p>{error}</p></div>}
                <form onSubmit={handleSignUp}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="boton-elegante" disabled={loading}>
                        {loading ? 'Processing...' : 'Sign-Up'}
                    </button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;
