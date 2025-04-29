import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUserCircle,
    FaCog,
    FaSignOutAlt,
    FaTimes,
    FaPenFancy,
    FaPhotoVideo,
    FaQuestion,
    FaBorderAll,
    FaSearch
} from 'react-icons/fa';
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
    const [feedType, setFeedType] = useState('my');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);

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

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanedQuery = searchQuery.trim().replace(/\s+/g, ' ');

        if (!cleanedQuery) {
            setSearchResults(null);
            return;
        }

        if (!user) {
            navigate('/login');
            return;
        }

        // Prevent searching while already in progress
        if (searching) {
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/feed/search/${encodeURIComponent(cleanedQuery)}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                // Always completely replace previous results
                setSearchResults({
                    users: data.connections || [],
                    experiences: data.experiences || [],
                    suggestions: data.suggestions || []
                });
            } else {
                console.error('Search failed:', response.status);
                setSearchResults({ users: [], experiences: [], suggestions: [] });
            }
        } catch (err) {
            console.error('Error performing search:', err);
            setSearchResults({ users: [], experiences: [], suggestions: [] });
        } finally {
            setSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
        // No need to refetch, the experiences and suggestions are still in state
    };

    const handleMentionClick = (mentionUuid) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.uuid !== mentionUuid){
            navigate(`/profile/${mentionUuid}`);
        }
    };

    const renderExperienceCards = (experiencesArray) => {
        return experiencesArray.map(exp => {
            const userUuid = exp.user?.uuid || null;

            return (
                <ExperienceCard
                    key={exp.uuid}
                    user={user}
                    post={exp}
                    baseApiUrl={baseApiUrl}
                    username={exp.user?.username ?? user?.username ?? 'Usuario'}
                    userUuid={userUuid}
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
                                        <span
                                            key={i}
                                            className="mention clickable"
                                            onClick={() => handleMentionClick(mention.uuid)}
                                            style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
                                        >
                                            @{mention.username}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                    renderTags={renderTags}
                    formatDate={formatDate}
                    isOwner={user && exp.user && user.uuid === exp.user.uuid}
                />
            );
        });
    };

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

    // Filter the posts based on both search results and post filter
    let displayExperiences = [];
    let displaySuggestions = [];

    if (searchResults) {
        // When searching, apply the postFilter to the search results
        const allSearchExperiences = searchResults.experiences || [];
        const allSearchSuggestions = searchResults.suggestions || [];

        if (postFilter === 'all') {
            displayExperiences = allSearchExperiences;
            displaySuggestions = allSearchSuggestions;
        } else if (postFilter === 'experiences') {
            displayExperiences = allSearchExperiences;
            displaySuggestions = [];
        } else if (postFilter === 'suggestions') {
            displayExperiences = [];
            displaySuggestions = allSearchSuggestions;
        }
    } else {
        // Normal feed filtering
        if (postFilter === 'all') {
            displayExperiences = experiences;
            displaySuggestions = suggestions;
        } else if (postFilter === 'experiences') {
            displayExperiences = experiences;
            displaySuggestions = [];
        } else if (postFilter === 'suggestions') {
            displayExperiences = [];
            displaySuggestions = suggestions;
        }
    }

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
                <h1 className="app-title">Lexigram</h1>

                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search users, posts, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-button">
                            <FaSearch />
                        </button>
                        {searchResults && (
                            <button type="button" className="clear-search-button" onClick={clearSearch}>
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </form>

                {!searchResults && user && (
                    <div className="btn-group mb-3">
                        <button
                            className={`btn btn-outline-primary ${feedType === 'my' ? 'active' : ''}`}
                            onClick={() => setFeedType('my')}
                        >My feed</button>
                        <button
                            className={`btn btn-outline-primary ${feedType === 'following' ? 'active' : ''}`}
                            onClick={() => setFeedType('following')}
                        >Following</button>
                    </div>
                )}

                <div className="btn-group mb-3 ms-2">
                    <button
                        className={`btn btn-outline-secondary ${postFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setPostFilter('all')}
                    > <FaBorderAll size={25} /> </button>
                    <button
                        className={`btn btn-outline-secondary ${postFilter === 'experiences' ? 'active' : ''}`}
                        onClick={() => setPostFilter('experiences')}
                    > <FaPhotoVideo size={25} /></button>
                    <button
                        className={`btn btn-outline-secondary ${postFilter === 'suggestions' ? 'active' : ''}`}
                        onClick={() => setPostFilter('suggestions')}
                    > <FaQuestion size={25} /></button>
                </div>

                {searchResults && (
                    <div className="search-results">
                        <h3 className="search-results-title">Search Results for: "{searchQuery}"</h3>

                        {searchResults.users && searchResults.users.length > 0 && (
                            <div className="users-section">
                                <h4>Users</h4>
                                <div className="users-grid">
                                    {searchResults.users.map(userResult => (
                                        <div
                                            key={userResult.uuid}
                                            className="user-result"
                                            onClick={() => navigate(`/profile/${userResult.uuid}`)}
                                        >
                                            {userResult.profilePictureUrl ? (
                                                <img
                                                    src={`${baseApiUrl}${userResult.profilePictureUrl}`}
                                                    alt={userResult.username}
                                                    className="user-avatar"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = defaultProfilePicture;
                                                    }}
                                                />
                                            ) : (
                                                <FaUserCircle size={30} />
                                            )}
                                            <span>{userResult.username}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {searching && (
                    <div className="text-center mt-4">
                        <div className="spinner"></div>
                        <p>Searching...</p>
                    </div>
                )}

                <div className="posts-grid">
                    {renderExperienceCards(displayExperiences)}

                    {displaySuggestions.map(sug => (
                        <SuggestionCard
                            key={sug.uuid}
                            user={user}
                            post={sug}
                            baseApiUrl={baseApiUrl}
                            username={sug.user?.username || user?.username || 'Usuario'}
                            renderTags={renderTags}
                            formatDate={formatDate}
                            isOwner={user && sug.user && user.uuid === sug.user.uuid}
                        />
                    ))}

                    {searchResults &&
                        displayExperiences.length === 0 &&
                        displaySuggestions.length === 0 &&
                        (!searchResults.users || searchResults.users.length === 0) && (
                            <div className="no-results">
                                <p>No results found for "{searchQuery}"</p>
                            </div>
                        )}
                </div>
            </div>

            <div className="create-post-icon" onClick={() => navigate(user ? '/post/create' : '/login')}>
                <FaPenFancy size={30} />
            </div>
        </div>
    );
};

export default HomePage;