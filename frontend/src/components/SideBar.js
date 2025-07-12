import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUserCircle, FaCog, FaSignOutAlt, FaTimes, FaEnvelope, FaTags } from 'react-icons/fa';
import '../styles/SideBar.css';

const Sidebar = ({ user, setUser, profilePicture, handleImageError, sidebarOpen, toggleSidebar, baseApiUrl }) => {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [feedTagCount, setFeedTagCount] = useState(0);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    useEffect(() => {
        if (user) {
            // Fetch feed tag count
            fetch(`${baseApiUrl}/api/auth/me/tags/feed`, {
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => setFeedTagCount(data?.length || 0))
                .catch(error => console.error('Error fetching feed tags:', error));

            // Fetch notifications and count unread ones
            fetch(`${baseApiUrl}/api/auth/me/profile/notifications`, {
                credentials: 'include'
            })
                .then(response => response.json())
                .then(notifications => {
                    if (Array.isArray(notifications)) {
                        const unreadCount = notifications.filter(
                            notification => !notification.read
                        ).length;
                        setUnreadNotificationCount(unreadCount);
                    }
                })
                .catch(error => console.error('Error fetching notifications:', error));
        } else {
            // Reset counts when user logs out
            setFeedTagCount(0);
            setUnreadNotificationCount(0);
        }
    }, [user, baseApiUrl, sidebarOpen]);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
                toggleSidebar();
                navigate('/', { replace: true });
            } else {
                console.error('Logout failed with status:', response.status);
                setUser(null);
                toggleSidebar();
                navigate('/', { replace: true });
            }
        } catch (err) {
            console.error('Logout failed:', err);
            setUser(null);
            toggleSidebar();
            navigate('/', { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
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
                                <p>{user.username || 'User'}</p>
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
                                    <FaEnvelope size={20}/>
                                    <span>Notifications</span>
                                    {unreadNotificationCount > 0 && (
                                        <span className="menu-badge">{unreadNotificationCount}</span>
                                    )}
                                </div>
                                <div className="menu-item" onClick={goToTags}>
                                    <FaTags size={20}/>
                                    <span>Tags</span>
                                    {feedTagCount > 0 && (
                                        <span className="menu-badge">{feedTagCount}</span>
                                    )}
                                </div>
                                <div
                                    className={`menu-item ${isLoggingOut ? 'logging-out' : ''}`}
                                    onClick={handleLogout}
                                    style={{ opacity: isLoggingOut ? 0.6 : 1 }}
                                >
                                    <FaSignOutAlt size={20}/>
                                    <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
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