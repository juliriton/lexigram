import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaUser, FaHeart, FaComment, FaArrowLeft, FaArrowRight, FaUserPlus, FaEnvelope } from "react-icons/fa";
import '../styles/NotificationsPage.css';
import Sidebar from '../components/SideBar';
import {API_URL} from "../Api";

const NotificationsPage = ({ user, setUser }) => {
    const [allNotifications, setAllNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [actorProfiles, setActorProfiles] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('notifications');
    const [itemsPerPage] = useState(10);
    const navigate = useNavigate();
    const defaultProfilePicture = `${API_URL}/images/default-profile-picture.jpg`;

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleImageError = () => {
        setProfilePicture(defaultProfilePicture);
    };

    const notifications = allNotifications.filter(n =>
        activeTab === 'notifications' ? n.type !== 'FOLLOW_REQUEST' : n.type === 'FOLLOW_REQUEST'
    );

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
                const res = await fetch(`${API_URL}/api/auth/me/users/${uuid}/profile`, {
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
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me/profile/notifications`, {
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to fetch notifications');

            const data = await res.json();
            setAllNotifications(data);
            setCurrentPage(1);

            const actorUuids = [...new Set(data.filter(n => n.actorUuid).map(n => n.actorUuid))];
            fetchActorProfiles(actorUuids);

        } catch (err) {
            console.error(err);
            setMessage('Error loading notifications.');
        } finally {
            setLoading(false);
        }
    }, [fetchActorProfiles]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/me`, {
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
        const fetchProfilePicture = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/me/profile`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfilePicture(
                        data.profilePictureUrl
                            ? `${API_URL}${data.profilePictureUrl}`
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
    }, [defaultProfilePicture, fetchNotifications]);

    const acknowledgeNotification = async (uuid) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me/profile/notifications/acknowledge/${uuid}`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setAllNotifications(prev =>
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
            const res = await fetch(`${API_URL}/api/auth/me/profile/notifications/acknowledge`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
            const res = await fetch(`${API_URL}/api/auth/me/profile/notifications/delete/${uuid}`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setAllNotifications(prev => prev.filter(n => n.uuid !== uuid));
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
        if (!window.confirm('Are you sure you want to delete all notifications? Follow requests will not be deleted.')) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/me/profile/notifications/delete`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setAllNotifications(prev => prev.filter(n => n.type === 'FOLLOW_REQUEST'));
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
            case 'RESONATE':
                return <FaHeart className="notification-icon like" />;
            case 'COMMENT':
                return <FaComment className="notification-icon comment" />;
            case 'MENTION':
                return <FaEnvelope className="notification-icon mention" />;
            case 'FOLLOW_REQUEST':
                return <FaUserPlus className="notification-icon follow-request-icon" />;
            default:
                return <FaBell className="notification-icon default" />;
        }
    };

    const formatDate = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const handleNotificationClick = useCallback((notification) => {
        if (notification.experienceUuid) {
            navigate(`/experience/${notification.experienceUuid}`);
        } else if (notification.actorUuid) {
            navigate(`/profile/${notification.actorUuid}`);
        }
    }, [navigate]);

    const acceptFollowRequest = async (requestUuid) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me/follow-requests/${requestUuid}/accept`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setMessage('Follow request accepted.');
                fetchNotifications();
            } else {
                setMessage('Failed to accept follow request.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error accepting follow request.');
        }
    };

    const rejectFollowRequest = async (requestUuid) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me/follow-requests/${requestUuid}/reject`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                setMessage('Follow request rejected.');
                fetchNotifications();
            } else {
                setMessage('Failed to reject follow request.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error rejecting follow request.');
        }
    };

    const unreadCount = allNotifications.filter(n => !n.read && n.type !== 'FOLLOW_REQUEST').length;
    const followRequestCount = allNotifications.filter(n => n.type === 'FOLLOW_REQUEST').length;

    if (loading) return (
        <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    const paginatedNotifications = getPaginatedItems(notifications);
    const totalPagesCount = totalPages();
    const showPagination = notifications.length > itemsPerPage;

    return (
        <div className="notifications-page">
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
                baseApiUrl={API_URL}
                defaultProfilePicture={defaultProfilePicture}
            />

            <div className="notifications-header">
                <h2>
                    <FaBell className="me-2" />
                    Notifications
                </h2>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('notifications');
                            setCurrentPage(1);
                        }}
                    >
                        Notifications
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>
                    <button
                        className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('requests');
                            setCurrentPage(1);
                        }}
                    >
                        Follow Requests
                        {followRequestCount > 0 && <span className="notification-badge">{followRequestCount}</span>}
                    </button>
                </div>
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

            {activeTab === 'notifications' && notifications.length > 0 && (
                <div className="notification-actions">
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
                    <div className="no-notifications">
                        {activeTab === 'notifications' ? (
                            <>
                                <FaBell size={48} className="text-muted mb-3" />
                                <h4>No notifications</h4>
                                <p className="text-muted">You're all caught up!</p>
                            </>
                        ) : (
                            <>
                                <FaUserPlus size={48} className="text-muted mb-3" />
                                <h4>No follow requests</h4>
                                <p className="text-muted">When you receive follow requests, they'll appear here.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {paginatedNotifications.map((notification) => (
                            <div
                                key={notification.uuid}
                                className={`notification-item ${!notification.read && activeTab === 'notifications' ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <div className={`notification-icon-wrapper ${notification.type === 'FOLLOW_REQUEST' ? 'follow-request-bg' : ''}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-info">
                                            <h6 className="notification-title">
                                                {notification.title}
                                                {!notification.read && activeTab === 'notifications' && <span className="unread-dot"></span>}
                                            </h6>
                                            <p className="notification-text">{notification.text}</p>
                                            {notification.actorUuid && actorProfiles[notification.actorUuid] && (
                                                <small className="text-muted">
                                                    by @{actorProfiles[notification.actorUuid].username}
                                                </small>
                                            )}
                                            <div className="notification-meta">
                                                <small>{formatDate(notification.creationDate)}</small>
                                            </div>

                                            {notification.type === 'FOLLOW_REQUEST' && (
                                                <div className="notification-follow-request-actions mt-2">
                                                    <button
                                                        className="btn btn-success me-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            acceptFollowRequest(notification.followRequestUuid);
                                                        }}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            rejectFollowRequest(notification.followRequestUuid);
                                                        }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {activeTab === 'notifications' && (
                                    <div className="notification-actions">
                                        {!notification.read && (
                                            <button
                                                className="btn btn-outline-success"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    acknowledgeNotification(notification.uuid);
                                                }}
                                                title="Mark as read"
                                            >
                                                <FaCheck/>
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.uuid);
                                            }}
                                            title="Delete notification"
                                        >
                                            <FaTrash/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {showPagination && (
                            <div className="navigation-buttons">
                                <div className="d-flex justify-content-between align-items-center">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                    >
                                        <FaArrowLeft className="me-1" />
                                        Previous
                                    </button>
                                    <span className="page-info">
                                        Page {currentPage} of {totalPagesCount}
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleNextPage}
                                        disabled={currentPage >= totalPagesCount}
                                    >
                                        Next
                                        <FaArrowRight className="ms-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;