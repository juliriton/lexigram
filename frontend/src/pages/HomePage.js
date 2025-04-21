import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt, FaTimes, FaPenFancy } from 'react-icons/fa';
import '../styles/HomePage.css';

const HomePage = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [imageError, setImageError] = useState(false);

    const [experiences, setExperiences] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [postFilter, setPostFilter] = useState('all');
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [feedType, setFeedType] = useState('my'); // 'my' | 'following'

    const baseApiUrl = 'http://localhost:8080';

    useEffect(() => {
        const fetchUserAndFeed = async () => {
            try {
                const res = await fetch(`${baseApiUrl}/api/auth/me`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);

                    if (data) {
                        fetchProfilePicture();
                    }

                    let feedUrl = `${baseApiUrl}/api/auth/me/feed`;
                    if (feedType === 'following') {
                        feedUrl += '/following';
                    }

                    const feedRes = await fetch(feedUrl, { credentials: 'include' });
                    if (feedRes.ok) {
                        const feedData = await feedRes.json();
                        setExperiences(feedData.experiences || []);
                        setSuggestions(feedData.suggestions || []);
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Error loading user or feed:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndFeed();
    }, [setUser, feedType]);

    const fetchProfilePicture = async () => {
        try {
            const profileRes = await fetch(`${baseApiUrl}/api/auth/me/profile`, {
                credentials: 'include',
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData.profilePictureUrl) {
                    setProfilePicture(`${baseApiUrl}${profileData.profilePictureUrl}`);
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
        fetch(`${baseApiUrl}/api/auth/me/logout`, {
            method: 'POST',
            credentials: 'include',
        }).then(() => {
            setUser(null);
            navigate('/');
            setSidebarOpen(false);
        }).catch((err) => console.error('Logout failed:', err));
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const goToProfile = () => { navigate(user ? '/profile' : '/login'); setSidebarOpen(false); };
    const goToSettings = () => { navigate(user ? '/settings' : '/login'); setSidebarOpen(false); };
    const goToLogin = () => { navigate('/login'); setSidebarOpen(false); };
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const formatDate = ts => new Date(ts).toLocaleDateString();

    const isVideo = (url) => {
        return url?.match(/\.(mp4|webm|ogg)$/i);
    };

    const renderTags = tags => (
        Array.isArray(tags) && tags.map((tag, i) => (
            <span key={i} className="tag-badge">
                {typeof tag === 'object' ? tag.name : tag}
            </span>
        ))
    );

    const toggleQuote = id => setHiddenQuotes(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleMentions = id => setShowMentions(prev => ({ ...prev, [id]: !prev[id] }));

    const renderMentions = (mentions, id) => (
        showMentions[id] && (
            <div className="post-mentions">
                <h6>Mentions:</h6>
                <div className="mentions-list">
                    {mentions.map((mention, i) => (
                        <span key={i} className="badge bg-info me-1">@{mention}</span>
                    ))}
                </div>
            </div>
        )
    );

    const renderExperience = exp => {
        const id = exp.uuid;
        const hidden = hiddenQuotes[id];
        const author = exp.user?.username || 'Unknown';
        const mediaUrl = exp.style?.backgroundMediaUrl || exp.imageUrl;
        const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;
        const isVideoMedia = isVideo(mediaUrl);

        return (
            <div key={id} className="post-card">
                <div className="post-type">{exp.type}</div>

                {fullMediaUrl && (
                    <div className="post-media">
                        {isVideoMedia ? (
                            <video
                                src={fullMediaUrl}
                                autoPlay
                                muted
                                loop
                                className="post-video"
                                style={{
                                    filter: hidden ? 'none' : 'brightness(70%)'
                                }}
                            />
                        ) : (
                            <div
                                className="post-image"
                                style={{
                                    backgroundImage: `url(${fullMediaUrl})`,
                                    filter: hidden ? 'none' : 'brightness(70%)'
                                }}
                            />
                        )}

                        {!hidden && (
                            <div className="post-quote-overlay">
                                <div className="post-quote" style={{
                                    fontSize: exp.style?.fontSize ? `${exp.style.fontSize}px` : 'inherit',
                                    fontFamily: exp.style?.fontFamily || 'inherit',
                                    color: exp.style?.fontColor || 'inherit'
                                }}>
                                    "{exp.quote || exp.title}"
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="post-content">
                    <h3 className="post-title">{exp.title}</h3>
                    <p>{exp.reflection || exp.content}</p>

                    <div className="post-meta">
                        <small className="post-date">{formatDate(exp.creationDate)}</small>
                    </div>

                    <div className="mt-2">
                        <small className="text-muted">Posted by <strong>{author}</strong></small>
                    </div>

                    {exp.tags?.length > 0 && (
                        <div className="post-tags">{renderTags(exp.tags)}</div>
                    )}

                    <div className="mt-2">
                        {fullMediaUrl && (
                            <button className="btn-link me-3" onClick={() => toggleQuote(id)}>
                                {hidden ? 'Show Quote' : 'Hide Quote'}
                            </button>
                        )}

                        {exp.mentions?.length > 0 && (
                            <button className="btn-link" onClick={() => toggleMentions(id)}>
                                {showMentions[id] ? 'Hide Mentions' : 'Show Mentions'}
                            </button>
                        )}
                    </div>

                    {renderMentions(exp.mentions || [], id)}
                </div>
            </div>
        );
    };

    const renderSuggestion = sug => {
        const id = sug.uuid;
        const author = sug.user?.username || 'Unknown';

        return (
            <div key={id} className="post-card">
                <div className="post-type">Suggestion</div>
                <div className="post-content">
                    <h5 className="post-subtitle">{sug.header || "Tell me about"}</h5>
                    <h3 className="post-title">{sug.body}</h3>

                    <div className="post-meta">
                        <small className="post-date">{formatDate(sug.creationDate)}</small>
                    </div>

                    <div className="mt-2">
                        <small className="text-muted">Posted by <strong>{author}</strong></small>
                    </div>

                    {sug.tags?.length > 0 && (
                        <div className="post-tags">{renderTags(sug.tags)}</div>
                    )}
                </div>
            </div>
        );
    };

    const filteredExperiences = postFilter === 'all' || postFilter === 'experiences' ? experiences : [];
    const filteredSuggestions = postFilter === 'all' || postFilter === 'suggestions' ? suggestions : [];

    if (loading) {
        return <div className="container"><div className="spinner"></div><p>Loading...</p></div>;
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
                    <h3>Menu</h3>
                    <FaTimes className="close-btn" onClick={toggleSidebar} />
                </div>

                <div className="sidebar-content">
                    {user ? (
                        <>
                            <div className="user-info">
                                {profilePicture && !imageError ? (
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
                                <div className="menu-item" onClick={goToProfile}>
                                    <FaUserCircle size={20} /> <span>Profile</span>
                                </div>
                                <div className="menu-item" onClick={goToSettings}>
                                    <FaCog size={20} /> <span>Settings</span>
                                </div>
                                <div className="menu-item" onClick={handleLogout}>
                                    <FaSignOutAlt size={20} /> <span>Log out</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="sidebar-menu-items">
                            <div className="menu-item" onClick={goToLogin}>
                                <FaUserCircle size={20} /> <span>Log In</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            <div className="main-content">
                <h2>Lexigram</h2>
                <p>Feed</p>

                <div className="btn-group mb-3">
                    <button className={`btn btn-outline-primary ${feedType === 'my' ? 'active' : ''}`} onClick={() => setFeedType('my')}>My Feed</button>
                    <button className={`btn btn-outline-primary ${feedType === 'following' ? 'active' : ''}`} onClick={() => setFeedType('following')}>Following</button>
                </div>

                <div className="btn-group mb-3 ms-2">
                    <button className={`btn btn-outline-secondary ${postFilter === 'all' ? 'active' : ''}`} onClick={() => setPostFilter('all')}>All</button>
                    <button className={`btn btn-outline-secondary ${postFilter === 'experiences' ? 'active' : ''}`} onClick={() => setPostFilter('experiences')}>Experiences</button>
                    <button className={`btn btn-outline-secondary ${postFilter === 'suggestions' ? 'active' : ''}`} onClick={() => setPostFilter('suggestions')}>Suggestions</button>
                </div>

                <div className="posts-grid">
                    {filteredExperiences.map(renderExperience)}
                    {filteredSuggestions.map(renderSuggestion)}
                </div>
            </div>

            <div className="create-post-icon" onClick={() => navigate(user ? '/post/create' : '/login')}>
                <FaPenFancy size={30} />
            </div>
        </div>
    );
};

export default HomePage;