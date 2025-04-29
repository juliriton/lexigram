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
            setError('Username must be between 3 and 25 characters, ' +
                'must be lowercase, ' +
                'can only contain letters, ' +
                'numbers, and underscores ');
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

        if (!validateForm()) {
            return;
        }

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
                if (data.message) {
                    setError(data.message);
                } else if (response.status === 409) {
                    setError('Username or email already in use');
                } else {
                    setError('An error has occurred creating your account');
                }
                setLoading(false);
                return;
            }

            navigate('/');
        } catch (err) {
            setError('Error');
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Lexigram</h2>
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
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
                <button
                    type="submit"
                    className="boton-elegante"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Sign-Up'}
                </button>
            </form>

            <p className="mt-3">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default SignUpPage;