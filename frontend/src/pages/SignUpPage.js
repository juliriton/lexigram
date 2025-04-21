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
            setError('La contraseña debe tener al menos 8 caracteres');
            return false;
        }

        if (/[A-Z]/.test(username)) {
            setError('El nombre de usuario no debe contener mayúsculas');
            return false;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('Por favor ingresa un email válido');
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
                    setError('El nombre de usuario o email ya está en uso');
                } else {
                    setError('Ha ocurrido un error al crear la cuenta');
                }
                setLoading(false);
                return;
            }

            navigate('/');
        } catch (err) {
            setError('Error de conexión con el servidor');
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Crear cuenta</h2>
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
                    {loading ? 'Procesando...' : 'Sign-Up'}
                </button>
            </form>

            <p className="mt-3">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default SignUpPage;