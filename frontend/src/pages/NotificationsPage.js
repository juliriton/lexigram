import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaUser, FaHeart, FaComment, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import '../styles/NotificationsPage.css';
import Sidebar from '../components/SideBar';

const NotificationsPage = ({ user, setUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [actorProfiles, setActorProfiles] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const navigate = useNavigate();
    const baseApiUrl = 'http://localhost:8080';
    const defaultProfilePicture = `${baseApiUrl}/images/default-profile-picture.jpg`;

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleImageError = () => {
        setProfilePicture(defaultProfilePicture);
    };

    // Pagination functions
    const getPaginatedItems = (items) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    const totalPages = () => Math.ceil(notifications.length / itemsPerPage);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages()));
    };

    const fetchActorProfiles = useCallback(async (actorUuids) => {
        const profiles = {};

        for (const uuid of actorUuids) {
            try {
                const res = await fetch(`${baseApiUrl}/api/auth/me/users/${uuid}/profile`, {
                    credentials: 'include',
                });

                if (res.ok) {
                    const profile = await res.json();
                    profiles[uuid] = profile;
                }
            } catch (err) {
                console.error(`Failed to fetch profile for ${uuid}:`, err);
            }
        }

        setActorProfiles(profiles);
    }, [baseApiUrl]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/notifications`, {
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to fetch notifications');

            const data = await res.json();
            setNotifications(data);
            setCurrentPage(1); // Reset to first page when notifications change

            const actorUuids = [...new Set(data.filter(n => n.actorUuid).map(n => n.actorUuid))];
            fetchActorProfiles(actorUuids);

        } catch (err) {
            console.error(err);
            setMessage('Error loading notifications.');
        } finally {
            setLoading(false);
        }
    }, [baseApiUrl, fetchActorProfiles]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${baseApiUrl}/api/auth/me`, {
                    credentials: 'include',
                });
                if (!res.ok) navigate('/login');
            } catch {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate, baseApiUrl]);

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const res = await fetch(`${baseApiUrl}/api/auth/me/profile`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfilePicture(
                        data.profilePictureUrl
                            ? `${baseApiUrl}${data.profilePictureUrl}`
                            : defaultProfilePicture
                    );
                }
            } catch (err) {
                console.error('Error fetching profile picture:', err);
                setProfilePicture(defaultProfilePicture);
            }
        };

        fetchProfilePicture();
        fetchNotifications();
    }, [baseApiUrl, defaultProfilePicture, fetchNotifications]);

    const acknowledgeNotification = async (uuid) => {
        try {
            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/notifications/acknowledge/${uuid}`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => n.uuid === uuid ? { ...n, read: true } : n)
                );
                setMessage('Notification marked as read.');
            } else {
                setMessage('Failed to acknowledge notification.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error acknowledging notification.');
        }
    };

    const acknowledgeAllNotifications = async () => {
        try {
            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/notifications/acknowledge`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setMessage('All notifications marked as read.');
            } else {
                setMessage('Failed to acknowledge all notifications.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error acknowledging all notifications.');
        }
    };

    const deleteNotification = async (uuid) => {
        try {
            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/notifications/delete/${uuid}`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.uuid !== uuid));
                setMessage('Notification deleted.');
            } else {
                setMessage('Failed to delete notification.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error deleting notification.');
        }
    };

    const deleteAllNotifications = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/notifications/delete`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setNotifications([]);
                setMessage('All notifications deleted.');
            } else {
                setMessage('Failed to delete all notifications.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error deleting all notifications.');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'FOLLOW':
                return <FaUser className="notification-icon follow" />;
            case 'LIKE':
                return <FaHeart className="notification-icon like" />;
            case 'COMMENT':
                return <FaComment className="notification-icon comment" />;
            default:
                return <FaBell className="notification-icon default" />;
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const handleNotificationClick = useCallback((notification) => {
        if (notification.experienceUuid) {
            navigate(`/experience/${notification.experienceUuid}`);
        } else if (notification.actorUuid) {
            navigate(`/profile/${notification.actorUuid}`);
        }
    }, [navigate]);

    if (loading) return <div className="container mt-4">Loading notifications...</div>;

    const paginatedNotifications = getPaginatedItems(notifications);
    const totalPagesCount = totalPages();
    const showPagination = notifications.length > itemsPerPage;

    return (
        <div className="notifications-page container mt-4">
            <label className="burger" htmlFor="burger">
                <input
                    type="checkbox"
                    id="burger"
                    checked={sidebarOpen}
                    onChange={toggleSidebar}
                />
                <span></span><span></span><span></span>
            </label>

            <Sidebar
                user={user}
                setUser={setUser}
                profilePicture={profilePicture}
                handleImageError={handleImageError}
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                baseApiUrl={baseApiUrl}
                defaultProfilePicture={defaultProfilePicture}
            />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-center flex-grow-1">
                    <FaBell className="me-2" />
                    Notifications
                </h2>
            </div>

            {message && (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    {message}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage('')}
                    ></button>
                </div>
            )}

            {notifications.length > 0 && (
                <div className="notification-actions mb-4">
                    <div className="d-flex gap-2 justify-content-between align-items-center">
                        <div className="pagination-info">
                            Showing {paginatedNotifications.length} of {notifications.length} notifications
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={acknowledgeAllNotifications}
                            >
                                <FaCheck className="me-1" />
                                Mark All Read
                            </button>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={deleteAllNotifications}
                            >
                                <FaTrash className="me-1" />
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications text-center py-5">
                        <FaBell size={48} className="text-muted mb-3" />
                        <h4 className="text-muted">No notifications</h4>
                        <p className="text-muted">You're all caught up!</p>
                    </div>
                ) : (
                    <>
                        {paginatedNotifications.map((notification) => (
                            <div
                                key={notification.uuid}
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <div className="notification-icon-wrapper">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-info flex-grow-1">
                                            <h6 className="notification-title mb-1">
                                                {notification.title}
                                                {!notification.read && <span className="unread-dot"></span>}
                                            </h6>
                                            <p className="notification-text mb-1">{notification.text}</p>
                                            {notification.actorUuid && actorProfiles[notification.actorUuid] && (
                                                <small className="text-muted">
                                                    by @{actorProfiles[notification.actorUuid].username}
                                                </small>
                                            )}
                                            <div className="notification-meta">
                                                <small className="text-muted">
                                                    {formatDate(notification.creationDate)}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="notification-actions">
                                    {!notification.read && (
                                        <button
                                            className="btn btn-sm btn-outline-success me-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                acknowledgeNotification(notification.uuid);
                                            }}
                                            title="Mark as read"
                                        >
                                            <FaCheck />
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.uuid);
                                        }}
                                        title="Delete notification"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {showPagination && (
                            <div className="pagination-controls mt-4">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                >
                                    <FaArrowLeft />
                                </button>
                                <span className="page-info mx-3">
                                    Page {currentPage} of {totalPagesCount}
                                </span>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPagesCount}
                                >
                                    <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;