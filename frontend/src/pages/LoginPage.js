import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage = ({ setUser }) => {
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const trimmedCredential = credential.trim();
        const trimmedPassword = password.trim();

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: trimmedCredential, password: trimmedPassword }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Error signing in');
            const data = await response.json();

            localStorage.setItem('userId', data.userId);
            setUser(data);
            navigate('/');
        } catch (err) {
            setErrorMessage('Incorrect username or password. Try again.');
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Welcome Back</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={credential}
                        onChange={(e) => {
                            setCredential(e.target.value);
                            setErrorMessage('');
                            setShowError(false);
                        }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMessage('');
                            setShowError(false);
                        }}
                        required
                    />
                    {errorMessage && (
                        <div className={`alert fade-error ${showError ? '' : 'hidden'}`}>
                            {errorMessage}
                        </div>
                    )}
                    <button type="submit" className="boton-elegante">Login</button>
                </form>
                <p>
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
