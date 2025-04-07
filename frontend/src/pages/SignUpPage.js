import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
                credentials: 'include' // mantiene la sesion activa automaticamente
            });

            if (!response.ok) throw new Error('Error');

            // Ya esta logueado, redirige a Home
            navigate('/');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="container">
            <h2>Crear cuenta</h2>
            <form onSubmit={handleSignUp}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Sign-Up</button>
            </form>

            <p className="mt-3">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default SignUpPage;
