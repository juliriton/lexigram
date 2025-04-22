import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt, FaTimes, FaPenFancy } from 'react-icons/fa';
import ExperienceCard from '../components/ExperienceCard';
import SuggestionCard from '../components/SuggestionCard';
import '../styles/HomePage.css';

const HomePage = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [postFilter, setPostFilter] = useState('all');
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [feedType, setFeedType] = useState('my'); // 'my' | 'following'

    const baseApiUrl = 'http://localhost:8080';
    const defaultProfilePicture = `${baseApiUrl}/images/default-profile-picture.jpg`;

    const fetchGuestFeed = async () => {
        try {
            const res = await fetch(`${baseApiUrl}/api/auth/feed`);
            if (res.ok) {
                const feedData = await res.json();
                setExperiences(feedData.experiences || []);
                setSuggestions(feedData.suggestions || []);
            }
        } catch (err) {
            console.error('Error loading guest feed:', err);
        }
    };

    const fetchProfilePicture = useCallback(async () => {
        try {
            const profileRes = await fetch(`${baseApiUrl}/api/auth/me/profile`, {
                credentials: 'include',
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfilePicture(
                    profileData.profilePictureUrl
                        ? `${baseApiUrl}${profileData.profilePictureUrl}`
                        : defaultProfilePicture
                );
            } else {
                setProfilePicture(defaultProfilePicture);
            }
        } catch (err) {
            console.error('Error fetching profile picture:', err);
            setProfilePicture(defaultProfilePicture);
        }
    }, [baseApiUrl, defaultProfilePicture]);

    useEffect(() => {
        const fetchUserAndFeed = async () => {
            try {
                const res = await fetch(`${baseApiUrl}/api/auth/me`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);

                    fetchProfilePicture();

                    let feedUrl = `${baseApiUrl}/api/auth/me/feed`;
                    if (feedType === 'following') feedUrl += '/following';

                    const feedRes = await fetch(feedUrl, { credentials: 'include' });
                    if (feedRes.ok) {
                        const feedData = await feedRes.json();
                        setExperiences(feedData.experiences || []);
                        setSuggestions(feedData.suggestions || []);
                    }
                } else {
                    setUser(null);
                    await fetchGuestFeed();
                }
            } catch (err) {
                console.error('Error loading user or feed:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndFeed();
    }, [setUser, feedType, fetchProfilePicture, baseApiUrl]);

    const handleLogout = () => {
        fetch(`${baseApiUrl}/api/auth/me/logout`, {
            method: 'POST',
            credentials: 'include',
        })
            .then(() => {
                setUser(null);
                setSidebarOpen(false);
                window.location.href = '/';
            })
            .catch(err => console.error('Logout failed:', err));
    };

    const handleImageError = () => setProfilePicture(defaultProfilePicture);

    const goToProfile = () => { navigate(user ? '/profile' : '/login'); setSidebarOpen(false); };
    const goToSettings = () => { navigate(user ? '/settings' : '/login'); setSidebarOpen(false); };
    const goToLogin = () => { navigate('/login'); setSidebarOpen(false); };
    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const formatDate = ts => new Date(ts).toLocaleDateString();

    const renderTags = tags => (
        Array.isArray(tags) && tags.map((tag, i) => (
            <span key={i} className="tag-badge">
        {typeof tag === 'object' ? tag.name : tag}
      </span>
        ))
    );

    // Filter posts
    const filteredExperiences = (postFilter === 'all' || postFilter === 'experiences') ? experiences : [];
    const filteredSuggestions = (postFilter === 'all' || postFilter === 'suggestions') ? suggestions : [];

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
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
                <span></span><span></span><span></span>
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

                <div className="btn-group mb-3">
                    <button
                        className={`btn btn-outline-primary ${feedType === 'my' ? 'active' : ''}`}
                        onClick={() => setFeedType('my')}
                    >My Feed</button>
                    <button
                        className={`btn btn-outline-primary ${feedType === 'following' ? 'active' : ''}`}
                        onClick={() => setFeedType('following')}
                    >Following</button>
                </div>

                <div className="btn-group mb-3 ms-2">
                    <button
                        className={`btn btn-outline-secondary ${postFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setPostFilter('all')}
                    >All</button>
                    <button
                        className={`btn btn-outline-secondary ${postFilter === 'experiences' ? 'active' : ''}`}
                        onClick={() => setPostFilter('experiences')}
                    >Experiences</button>
                    <button
                        className={`btn btn-outline-secondary ${postFilter === 'suggestions' ? 'active' : ''}`}
                        onClick={() => setPostFilter('suggestions')}
                    >Suggestions</button>
                </div>

                <div className="posts-grid">
                    {filteredExperiences.map(exp => (
                        <ExperienceCard
                            key={exp.uuid || exp.id}
                            post={exp}
                            baseApiUrl={baseApiUrl}
                            hiddenQuotes={hiddenQuotes}
                            toggleQuote={id => setHiddenQuotes(prev => ({ ...prev, [id]: !prev[id] }))}
                            showMentions={showMentions}
                            setShowMentions={setShowMentions}
                            renderMentions={(mentions, id) => (
                                showMentions[id] && (
                                    <div className="post-mentions">
                                        <h6>Mentions:</h6>
                                        <div className="mentions-list">
                                            {mentions.map((mention, i) => (
                                                <span className="mention">@{mention}</span>

                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                            renderTags={renderTags}
                            formatDate={formatDate}
                        />
                    ))}

                    {filteredSuggestions.map(sug => (
                        <SuggestionCard
                            key={sug.uuid}
                            post={sug}
                            baseApiUrl={baseApiUrl}
                            renderTags={renderTags}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            </div>

            <div className="create-post-icon" onClick={() => navigate(user ? '/post/create' : '/login')}>
                <FaPenFancy size={30} />
            </div>
        </div>
    );
};

export default HomePage;
