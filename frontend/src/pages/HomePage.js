import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUserCircle,
    FaTimes,
    FaPenFancy,
    FaPhotoVideo,
    FaQuestion,
    FaBorderAll,
    FaSearch,
    FaArrowLeft,
    FaArrowRight
} from 'react-icons/fa';
import ExperienceCard from '../components/ExperienceCard';
import SuggestionCard from '../components/SuggestionCard';
import SideBar from '../components/SideBar';
import '../styles/HomePage.css';
import { API_URL } from '../Api.js';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [searchFilters, setSearchFilters] = useState({
        users: true,
        experiences: true, // Master switch for experiences
        experienceType: 'all', // 'all', 'forks', 'replies', 'origins'
        suggestions: true,
        tags: true,
        exactMatch: false
    });
    const [searchFocused, setSearchFocused] = useState(false);
    const defaultProfilePicture = `${API_URL}/images/default-profile-picture.jpg`;

    const fetchGuestFeed = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/feed`);
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
        if (!user) {
            setProfilePicture(defaultProfilePicture);
            return;
        }

        try {
            const profileRes = await fetch(`${API_URL}/api/auth/me/profile`, {
                credentials: 'include',
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfilePicture(
                    profileData.profilePictureUrl
                        ? `${API_URL}${profileData.profilePictureUrl}`
                        : defaultProfilePicture
                );
            } else {
                setProfilePicture(defaultProfilePicture);
            }
        } catch (err) {
            console.error('Error fetching profile picture:', err);
            setProfilePicture(defaultProfilePicture);
        }
    }, [user, defaultProfilePicture]);

    const fetchFeed = useCallback(async () => {
        if (!user) {
            await fetchGuestFeed();
            return;
        }

        try {
            let feedUrl = `${API_URL}/api/auth/me/feed`;
            if (feedType === 'following') {
                feedUrl += '/following';
            } else if (feedType === 'discover') {
                feedUrl += '/discover';
            }

            const feedRes = await fetch(feedUrl, { credentials: 'include' });
            if (feedRes.ok) {
                const feedData = await feedRes.json();
                setExperiences(feedData.experiences || []);
                setSuggestions(feedData.suggestions || []);
            } else {
                // If feed fetch fails, user might be logged out
                if (feedRes.status === 401) {
                    setUser(null);
                    await fetchGuestFeed();
                }
            }
        } catch (err) {
            console.error('Error loading feed:', err);
        }
    }, [user, feedType, setUser]);

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanedQuery = searchQuery.trim().replace(/\s+/g, ' ');

        if (!cleanedQuery) {
            setSearchResults(null);
            setCurrentPage(1);
            return;
        }

        if (!user) {
            navigate('/login');
            return;
        }

        if (searching) {
            return;
        }

        setSearching(true);
        try {
            const params = {
                users: searchFilters.users,
                suggestions: searchFilters.suggestions,
                tags: searchFilters.tags,
                exact: searchFilters.exactMatch
            };

            // Only add experience filters if experiences are enabled
            if (searchFilters.experiences) {
                params.experiences = true;
                params.experienceType = searchFilters.experienceType;
            }

            const response = await fetch(`${API_URL}/api/auth/me/feed/search/${encodeURIComponent(cleanedQuery)}?` +
                new URLSearchParams(params), {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults({
                    users: data.connections || [],
                    experiences: data.experiences || [],
                    suggestions: data.suggestions || [],
                    tags: data.tags || []
                });
                setCurrentPage(1);
            } else {
                console.error('Search failed:', response.status);
                setSearchResults({ users: [], experiences: [], suggestions: [], tags: [] });
            }
        } catch (err) {
            console.error('Error performing search:', err);
            setSearchResults({ users: [], experiences: [], suggestions: [], tags: [] });
        } finally {
            setSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
        setCurrentPage(1);
        setSearchFocused(false);
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

    const getPaginatedItems = (items) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    const getInterleavedPosts = () => {
        const result = [];
        const maxLength = Math.max(displayExperiences.length, displaySuggestions.length);

        for (let i = 0; i < maxLength; i++) {
            if (i < displayExperiences.length) {
                result.push({ ...displayExperiences[i], type: 'experience' });
            }
            if (i < displaySuggestions.length) {
                result.push({ ...displaySuggestions[i], type: 'suggestion' });
            }
        }

        return result;
    };

// Helper function to filter experiences based on type
    const filterExperiencesByType = (experiences, experienceType) => {
        if (!experiences || experienceType === 'all') {
            return experiences;
        }

        switch (experienceType) {
            case 'forks':
                // A fork is an experience that is NOT an origin (origin === false)
                return experiences.filter(exp => exp.origin === false);
            case 'replies':
                // A reply is an experience that has isReply === true
                return experiences.filter(exp => exp.isReply === true);
            case 'origins':
                // An origin is an experience that has origin === true
                return experiences.filter(exp => exp.origin === true);
            default:
                return experiences;
        }
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchProfilePicture(),
                fetchFeed()
            ]);
            setCurrentPage(1);
            setLoading(false);
        };

        loadData();
    }, [user, feedType, fetchProfilePicture, fetchFeed]);

    const handleImageError = () => setProfilePicture(defaultProfilePicture);

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const formatDate = ts => new Date(ts).toLocaleDateString();

    const renderTags = tags => (
        Array.isArray(tags) && tags.map((tag, i) => (
            <span key={i} className="tag-badge">
                {typeof tag === 'object' ? tag.name : tag}
            </span>
        ))
    );

    let displayExperiences = [];
    let displaySuggestions = [];

    if (searchResults) {
        const allSearchExperiences = searchResults.experiences || [];
        const allSearchSuggestions = searchResults.suggestions || [];

        // Apply experience type filtering to search results
        const filteredSearchExperiences = searchFilters.experiences
            ? filterExperiencesByType(allSearchExperiences, searchFilters.experienceType)
            : [];

        if (postFilter === 'all') {
            displayExperiences = filteredSearchExperiences;
            displaySuggestions = allSearchSuggestions;
        } else if (postFilter === 'experiences') {
            displayExperiences = filteredSearchExperiences;
            displaySuggestions = [];
        } else if (postFilter === 'suggestions') {
            displayExperiences = [];
            displaySuggestions = allSearchSuggestions;
        }
    } else {
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

    const interleavedPosts = getInterleavedPosts();
    const paginatedPosts = getPaginatedItems(interleavedPosts);
    const totalPagesCount = Math.ceil(interleavedPosts.length / itemsPerPage);
    const showPagination = interleavedPosts.length > itemsPerPage && !searching;

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

            <SideBar
                user={user}
                setUser={setUser}
                profilePicture={profilePicture}
                handleImageError={handleImageError}
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                baseApiUrl={API_URL}
                defaultProfilePicture={defaultProfilePicture}
            />

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
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => {
                                if (!searchQuery) {
                                    setSearchFocused(false);
                                }
                            }}
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

                    {(searchFocused || searchQuery) && (
                        <div className="search-filters">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={searchFilters.users}
                                    onChange={() => setSearchFilters({...searchFilters, users: !searchFilters.users})}
                                /> Users
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={searchFilters.experiences}
                                    onChange={(e) => setSearchFilters({
                                        ...searchFilters,
                                        experiences: e.target.checked,
                                        experienceType: e.target.checked ? 'all' : 'none'
                                    })}
                                /> Experiences
                            </label>

                            {searchFilters.experiences && (
                                <div className="experience-subfilters">
                                    <label>
                                        <input
                                            type="radio"
                                            name="experienceType"
                                            checked={searchFilters.experienceType === 'all'}
                                            onChange={() => setSearchFilters({
                                                ...searchFilters,
                                                experienceType: 'all'
                                            })}
                                        /> All Experiences
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="experienceType"
                                            checked={searchFilters.experienceType === 'forks'}
                                            onChange={() => setSearchFilters({
                                                ...searchFilters,
                                                experienceType: 'forks'
                                            })}
                                        /> Only Forks
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="experienceType"
                                            checked={searchFilters.experienceType === 'replies'}
                                            onChange={() => setSearchFilters({
                                                ...searchFilters,
                                                experienceType: 'replies'
                                            })}
                                        /> Only Replies
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="experienceType"
                                            checked={searchFilters.experienceType === 'origins'}
                                            onChange={() => setSearchFilters({
                                                ...searchFilters,
                                                experienceType: 'origins'
                                            })}
                                        /> Origins Only
                                    </label>
                                </div>
                            )}

                            <label>
                                <input
                                    type="checkbox"
                                    checked={searchFilters.suggestions}
                                    onChange={() => setSearchFilters({...searchFilters, suggestions: !searchFilters.suggestions})}
                                /> Suggestions
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={searchFilters.tags}
                                    onChange={() => setSearchFilters({...searchFilters, tags: !searchFilters.tags})}
                                /> Tags
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={searchFilters.exactMatch}
                                    onChange={() => setSearchFilters({...searchFilters, exactMatch: !searchFilters.exactMatch})}
                                /> Exact Match
                            </label>
                        </div>
                    )}
                </form>

                {!searchResults && user && (
                    <div className="btn-group mb-3">
                        <button
                            className={`btn btn-outline-primary ${feedType === 'my' ? 'active' : ''}`}
                            onClick={() => setFeedType('my')}
                        >My feed
                        </button>
                        <button
                            className={`btn btn-outline-primary ${feedType === 'following' ? 'active' : ''}`}
                            onClick={() => setFeedType('following')}
                        >Following
                        </button>
                        <button
                            className={`btn btn-outline-primary ${feedType === 'discover' ? 'active' : ''}`}
                            onClick={() => setFeedType('discover')}
                        >Discover
                        </button>
                    </div>
                )}

                <div className="btn-group mb-3 ms-2">
                    <button
                        className={`btn btn-outline-primary ${postFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setPostFilter('all')}
                    > <FaBorderAll size={25} /> </button>
                    <button
                        className={`btn btn-outline-primary ${postFilter === 'experiences' ? 'active' : ''}`}
                        onClick={() => setPostFilter('experiences')}
                    > <FaPhotoVideo size={25} /></button>
                    <button
                        className={`btn btn-outline-primary ${postFilter === 'suggestions' ? 'active' : ''}`}
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
                                                    src={`${API_URL}${userResult.profilePictureUrl}`}
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

                        {searchResults.tags && searchResults.tags.length > 0 && (
                            <div className="tags-section">
                                <h4>Tags</h4>
                                <div className="tags-grid">
                                    {searchResults.tags.map(tag => (
                                        <div key={tag.uuid} className="tag-result">
                                            #{tag.name}
                                            {user && (
                                                <button
                                                    className="btn btn-sm btn-primary ms-2"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            const endpoint = tag.inFeed ? "remove" : "add";
                                                            const response = await fetch(`${API_URL}/api/auth/me/tags/feed/${endpoint}/${tag.uuid}`, {
                                                                method: 'POST',
                                                                credentials: 'include'
                                                            });
                                                            if (response.ok) {
                                                                alert(`Tag #${tag.name} ${tag.inFeed ? 'removed from' : 'added to'} your feed!`);
                                                                // Update the UI
                                                                setSearchResults(prev => ({
                                                                    ...prev,
                                                                    tags: prev.tags.map(t =>
                                                                        t.uuid === tag.uuid ? {...t, inFeed: !t.inFeed} : t
                                                                    )
                                                                }));
                                                            } else {
                                                                alert('Failed to update tag feed');
                                                            }
                                                        } catch (err) {
                                                            console.error('Error updating tag feed:', err);
                                                            alert('Error updating tag feed');
                                                        }
                                                    }}
                                                >
                                                    {tag.inFeed ? 'Remove from Feed' : 'Add to Feed'}
                                                </button>
                                            )}
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
                    {paginatedPosts.map(post => {
                        if (post.type === 'experience') {
                            return (
                                <ExperienceCard
                                    key={post.uuid}
                                    user={user}
                                    post={post}
                                    baseApiUrl={API_URL}
                                    username={post.user?.username || user?.username || 'Usuario'}
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
                                    disablePopup={false}
                                    isOwner={user && post.user && user.uuid === post.user.uuid}
                                />
                            );
                        } else {
                            return (
                                <SuggestionCard
                                    key={post.uuid}
                                    user={user}
                                    post={post}
                                    baseApiUrl={API_URL}
                                    username={post.user?.username || user?.username || 'Usuario'}
                                    renderTags={renderTags}
                                    formatDate={formatDate}
                                    isOwner={user && post.user && user.uuid === post.user.uuid}
                                />
                            );
                        }
                    })}

                    {searchResults &&
                        displayExperiences.length === 0 &&
                        displaySuggestions.length === 0 &&
                        (!searchResults.users || searchResults.users.length === 0) &&
                        (!searchResults.tags || searchResults.tags.length === 0) && (
                            <div className="no-results">
                                <p>No results found for "{searchQuery}"</p>
                            </div>
                        )}
                </div>

                {showPagination && (
                    <div className="pagination-container">
                        <button
                            className="pagination-button"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <FaArrowLeft />
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {totalPagesCount}
                        </span>
                        <button
                            className="pagination-button"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage >= totalPagesCount}
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                )}
            </div>

            <div className="create-post-icon" onClick={() => navigate(user ? '/post/create' : '/login')}>
                <FaPenFancy size={30} />
            </div>
        </div>
    );
};

export default HomePage;