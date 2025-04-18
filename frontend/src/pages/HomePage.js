import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt, FaTimes, FaPenFancy } from 'react-icons/fa';
import '../styles/HomePage.css';

const HomePage = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [experiences, setExperiences] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [postFilter, setPostFilter] = useState('all');
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});

    const baseApiUrl = 'http://localhost:8080';

    useEffect(() => {
        const fetchUserAndFeed = async () => {
            try {
                const res = await fetch(`${baseApiUrl}/api/auth/me`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);

                    const feedRes = await fetch(`${baseApiUrl}/api/auth/me/feed`, { credentials: 'include' });
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
    }, [setUser]);

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

    const goToProfile = () => { navigate(user ? '/profile' : '/login'); setSidebarOpen(false); };
    const goToSettings = () => { navigate(user ? '/settings' : '/login'); setSidebarOpen(false); };
    const goToLogin = () => { navigate('/login'); setSidebarOpen(false); };
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const formatDate = ts => new Date(ts).toLocaleDateString();
    const renderTags = tags => (
        Array.isArray(tags) && tags.map((tag, i) => (
            <span key={i} className="badge bg-secondary me-1">
                {typeof tag === 'object' ? tag.name : tag}
            </span>
        ))
    );
    const toggleQuote = id => setHiddenQuotes(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleMentions = id => setShowMentions(prev => ({ ...prev, [id]: !prev[id] }));
    const renderMentions = (mentions, id) => (
        showMentions[id] && (
            <div className="mt-2">
                <h6>Mentions:</h6>
                {mentions.map((m, idx) => (
                    <span key={idx} className="badge bg-info me-1">{m}</span>
                ))}
            </div>
        )
    );

    const renderExperience = exp => {
        const id = exp.uuid;
        const hidden = hiddenQuotes[id];
        const author = exp.user?.username || 'Unknown';

        return (
            <div key={id} className="card shadow-sm mb-4">
                <div className="card-img-top" style={{
                    height: 250,
                    backgroundImage: `url(${baseApiUrl}${exp.style?.backgroundMediaUrl || exp.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: hidden ? 'none' : 'brightness(70%)',
                    position: 'relative'
                }}>
                    {!hidden && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4">
                            <div className="p-3 bg-dark bg-opacity-50 rounded">
                                <h4 className="text-white fw-bold mb-0 text-center" style={{ fontSize: exp.style?.fontSize || '1.5rem' }}>
                                    "{exp.quote || exp.title}"
                                </h4>
                            </div>
                        </div>
                    )}
                </div>
                <div className="card-body">
                    <p>{exp.reflection || exp.content}</p>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-primary">{exp.type}</span>
                        <small className="text-muted">{formatDate(exp.creationDate)}</small>
                    </div>
                    <div className="mt-1">
                        <small className="text-muted">Posted by <strong>{author}</strong></small>
                    </div>
                    <div className="mt-2">{renderTags(exp.tags)}</div>
                    <div className="mt-2">
                        <button className="btn btn-link p-0 me-3" onClick={() => toggleQuote(id)}>
                            {hidden ? 'Show Quote' : 'Hide Quote'}
                        </button>
                        {exp.mentions?.length > 0 && (
                            <button className="btn btn-link p-0" onClick={() => toggleMentions(id)}>
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
            <div key={id} className="card shadow-sm mb-3 d-flex flex-row suggestion-card">
                <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h6 className="text-muted">{sug.header || 'Tell me about'}</h6>
                        <p className="fw-bold fs-5 mb-2">{sug.body}</p>
                        <div>{renderTags(sug.tags)}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="badge bg-primary">{sug.type}</span>
                        <small className="text-muted">{formatDate(sug.creationDate)}</small>
                    </div>
                    <div>
                        <small className="text-muted">Posted by <strong>{author}</strong></small>
                    </div>
                </div>
            </div>
        );
    };

    const filteredExperiences = postFilter === 'all' || postFilter === 'experiences' ? experiences : [];
    const filteredSuggestions = postFilter === 'all' || postFilter === 'suggestions' ? suggestions : [];

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
                    <h3>Menu</h3>
                    <FaTimes className="close-btn" onClick={toggleSidebar} />
                </div>

                <div className="sidebar-content">
                    {user ? (
                        <>
                            <div className="user-info">
                                <FaUserCircle size={40} />
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
                    <button className={`btn btn-outline-primary ${postFilter === 'all' ? 'active' : ''}`} onClick={() => setPostFilter('all')}>All</button>
                    <button className={`btn btn-outline-primary ${postFilter === 'experiences' ? 'active' : ''}`} onClick={() => setPostFilter('experiences')}>Experiences</button>
                    <button className={`btn btn-outline-primary ${postFilter === 'suggestions' ? 'active' : ''}`} onClick={() => setPostFilter('suggestions')}>Suggestions</button>
                </div>

                {filteredExperiences.map(renderExperience)}
                {filteredSuggestions.map(renderSuggestion)}
            </div>

            <div className="create-post-icon" onClick={() => navigate(user ? '/post/create' : '/login')}>
                <FaPenFancy size={30} />
            </div>
        </div>
    );
};

export default HomePage;
