import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import '../pages/HomePage.css';

const HomePage = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/auth/me', {
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);

                    if (data) {
                        fetchProfilePicture();
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Error al verificar sesion:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [setUser]);

    const fetchProfilePicture = async () => {
        try {
            const profileRes = await fetch('http://localhost:8080/api/auth/me/profile', {
                credentials: 'include',
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData.profilePictureUrl) {
                    setProfilePicture(`http://localhost:8080${profileData.profilePictureUrl}`);
                } else {
                    setImageError(true);
                }
            } else {
                setImageError(true);
            }
        } catch (err) {
            console.error('Error al obtener foto de perfil:', err);
            setImageError(true);
        }
    };

    const handleLogout = () => {
        fetch('http://localhost:8080/api/auth/me/logout', {
            method: 'POST',
            credentials: 'include',
        })
            .then(() => {
                setUser(null);
                navigate('/');
                setSidebarOpen(false);
            })
            .catch((err) => {
                console.error('Logout failed:', err);
            });
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const goToProfile = () => {
        navigate(user ? '/profile' : '/login');
        setSidebarOpen(false);
    };

    const goToSettings = () => {
        navigate(user ? '/settings' : '/login');
        setSidebarOpen(false);
    };

    const goToLogin = () => {
        navigate('/login');
        setSidebarOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return <div className="container"><p>Loading...</p></div>;
    }

    return (
        <div className="container">
            <label className="burger" htmlFor="burger">
                <input
                    type="checkbox"
                    id="burger"
                    checked={sidebarOpen}
                    onChange={toggleSidebar}
                />
                <span></span>
                <span></span>
                <span></span>
            </label>

            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Menú</h3>
                    <FaTimes className="close-btn" onClick={toggleSidebar} />
                </div>

                <div className="sidebar-content">
                    {user ? (
                        <>
                            <div className="user-info">
                                {profilePicture && !imageError ? (
                                    <img
                                        src={profilePicture}
                                        alt="Perfil"
                                        className="profile-image"
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <FaUserCircle size={40} />
                                )}
                                <h5><p>{user.username || 'Usuario'}</p></h5>
                            </div>
                            <div className="sidebar-menu-items">
                                <div className="menu-item" onClick={goToProfile}>
                                    <FaUserCircle size={20} />
                                    <span>Profile</span>
                                </div>
                                <div className="menu-item" onClick={goToSettings}>
                                    <FaCog size={20} />
                                    <span>Settings</span>
                                </div>
                                <div className="menu-item" onClick={handleLogout}>
                                    <FaSignOutAlt size={20} />
                                    <span>Log out</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="sidebar-menu-items">
                            <div className="menu-item" onClick={goToLogin}>
                                <FaUserCircle size={20} />
                                <span>Log In</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            <div className="main-content">
                <h2>Lexigram</h2>
                <p>Feed</p>
            </div>
        </div>
    );
};

export default HomePage;