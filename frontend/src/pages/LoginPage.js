import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = ({ setUser }) => {  // Accept setUser as a prop
    const [credential, setCredential] = useState(''); // Credential for username or email
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Eliminar espacios en blanco antes de enviar los datos
        const trimmedCredential = credential.trim();
        const trimmedPassword = password.trim();

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: trimmedCredential, password: trimmedPassword }),  // Enviar las credenciales sin espacios
                credentials: 'include',  // Esto asegura que la cookie de sesion se incluya
            });

            if (!response.ok) throw new Error('Error al iniciar sesion');

            const data = await response.json();
            localStorage.setItem('userId', data.userId);  // Almacenar el userId en localStorage
            setUser(data);  // Actualizar el estado de usuario
            navigate('/');  // Redirigir a la pagina principal después del login exitoso
        } catch (err) {
            alert(err.message);  // Mostrar mensaje de error si falla el login
        }
    };

    return (
        <div className="container">
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username or Email"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>

            <p className="mt-3">
                Don't have an Account yet? <Link to="/signup">Sign-Up here</Link>
            </p>
        </div>
    );
};

export default LoginPage;
