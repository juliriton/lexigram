import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import '../App.css';

const HomePage = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/auth/me', {
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Error al verificar sesión:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [setUser]);

    const handleLogout = () => {
        fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        })
            .then(() => {
                setUser(null);
                navigate('/');
            })
            .catch((err) => {
                console.error('Logout failed:', err);
            });
    };

    const goToProfile = () => {
        navigate(user ? '/profile' : '/login');
    };

    const goToSettings = () => {
        navigate(user ? '/settings' : '/login');
    };

    if (loading) {
        return <div className="container"><p>Loading...</p></div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
                <FaUserCircle size={30} style={{ cursor: 'pointer' }} onClick={goToProfile} />
                <FaCog size={30} style={{ cursor: 'pointer' }} onClick={goToSettings} />
                {user && (
                    <FaSignOutAlt size={30} style={{ cursor: 'pointer' }} onClick={handleLogout} />
                )}
            </div>

            <h2>Lexigram</h2>
            <p>Feed</p>
        </div>
    );
};

export default HomePage;
