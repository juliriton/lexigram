import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUserCircle, FaCog, FaSignOutAlt, FaTimes, FaEnvelope, FaTags } from 'react-icons/fa';
import '../styles/SideBar.css'

const Sidebar = ({ user, setUser, profilePicture, handleImageError, sidebarOpen, toggleSidebar, baseApiUrl }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        fetch(`${baseApiUrl}/api/auth/me/logout`, {
            method: 'POST',
            credentials: 'include',
        })
            .then(() => {
                setUser(null);
                toggleSidebar();
                window.location.href = '/';
            })
            .catch(err => console.error('Logout failed:', err));
    };

    const goToFeed = () => { navigate('/'); toggleSidebar(); };
    const goToProfile = () => { navigate(user ? '/profile' : '/login'); toggleSidebar(); };
    const goToSettings = () => { navigate(user ? '/settings' : '/login'); toggleSidebar(); };
    const goToNotifications = () => { navigate(user ? '/notifications' : '/login'); toggleSidebar(); };
    const goToTags = () => { navigate(user ? '/tags' : '/login'); toggleSidebar(); };
    const goToLogin = () => { navigate('/login'); toggleSidebar(); };

    return (
        <>
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Menu</h3>
                    <FaTimes className="close-btn" onClick={toggleSidebar} />
                </div>
                <div className="sidebar-content">
                    {user ? (
                        <>
                            <div className="user-info">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt="Profile"
                                        className="profile-image"
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <FaUserCircle size={40} />
                                )}
                                <p>{user.username || 'Usuario'}</p>
                            </div>
                            <div className="sidebar-menu-items">
                                <div className="menu-item" onClick={goToFeed}>
                                    <FaHome size={20}/> <span>Feed</span>
                                </div>
                                <div className="menu-item" onClick={goToProfile}>
                                    <FaUserCircle size={20}/> <span>Profile</span>
                                </div>
                                <div className="menu-item" onClick={goToSettings}>
                                    <FaCog size={20}/> <span>Settings</span>
                                </div>
                                <div className="menu-item" onClick={goToNotifications}>
                                    <FaEnvelope size={20}/> <span>Notifications</span>
                                </div>
                                <div className="menu-item" onClick={goToTags}>
                                    <FaTags size={20}/> <span>Tags</span>
                                </div>
                                <div className="menu-item" onClick={handleLogout}>
                                    <FaSignOutAlt size={20}/> <span>Log out</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="sidebar-menu-items">
                            <div className="menu-item" onClick={goToFeed}>
                                <FaHome size={20}/> <span>Feed</span>
                            </div>
                            <div className="menu-item" onClick={goToLogin}>
                                <FaUserCircle size={20} /> <span>Log In</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default Sidebar;