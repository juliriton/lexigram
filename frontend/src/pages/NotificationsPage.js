import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaBell, FaCheck, FaTrash, FaUser, FaHeart, FaComment } from "react-icons/fa";
import '../styles/NotificationsPage.css';

const NotificationsPage = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [actorProfiles, setActorProfiles] = useState({});
    const navigate = useNavigate();
    const baseApiUrl = 'http://localhost:8080';

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
    }, [navigate]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/notifications`, {
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to fetch notifications');

            const data = await res.json();
            setNotifications(data);

            // Fetch actor profiles for notifications that have actorUuid
            const actorUuids = [...new Set(data.filter(n => n.actorUuid).map(n => n.actorUuid))];
            fetchActorProfiles(actorUuids);

        } catch (err) {
            console.error(err);
            setMessage('Error loading notifications.');
        } finally {
            setLoading(false);
        }
    };

    const fetchActorProfiles = async (actorUuids) => {
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
    };

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

    const handleNotificationClick = (notification) => {
        // Navigate based on notification type
        if (notification.experienceUuid) {
            navigate(`/experience/${notification.experienceUuid}`);
        } else if (notification.actorUuid) {
            navigate(`/profile/${notification.actorUuid}`);
        }
    };

    if (loading) return <div className="container mt-4">Loading notifications...</div>;

    return (
        <div className="notifications-page container mt-4">
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
                    <div className="d-flex gap-2 justify-content-end">
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
            )}

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications text-center py-5">
                        <FaBell size={48} className="text-muted mb-3" />
                        <h4 className="text-muted">No notifications</h4>
                        <p className="text-muted">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.uuid}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
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
                                        onClick={() => acknowledgeNotification(notification.uuid)}
                                        title="Mark as read"
                                    >
                                        <FaCheck />
                                    </button>
                                )}
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => deleteNotification(notification.uuid)}
                                    title="Delete notification"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="navigation-buttons mt-4">
                <div className="d-flex justify-content-center gap-3">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft className="me-1" />
                        Go Back
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={() => navigate('/')}
                    >
                        <FaHome className="me-1" />
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;