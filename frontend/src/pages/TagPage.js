import React, { useState, useEffect } from 'react';
import '../styles/TagPage.css';
import { useNavigate } from "react-router-dom";
import Sidebar from '../components/SideBar';

const TagPage = ({ user, setUser }) => {
    const [allTags, setAllTags] = useState([]);
    const [feedTags, setFeedTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const baseApiUrl = 'http://localhost:8080';
    const defaultProfilePicture = `${baseApiUrl}/images/default-profile-picture.jpg`;

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleImageError = () => {
        setProfilePicture(defaultProfilePicture);
    };

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
    }, [baseApiUrl, defaultProfilePicture]);

    // Fetch all tags
    const fetchAllTags = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/all`, {
                credentials: 'include'
            });
            if (response.ok) {
                const tags = await response.json();
                setAllTags(tags);
            } else if (response.status === 401) {
                setError('Unauthorized - please log in');
            } else {
                setError('Failed to fetch tags');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    // Fetch feed tags
    const fetchFeedTags = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed`, {
                credentials: 'include'
            });
            if (response.ok) {
                const tags = await response.json();
                setFeedTags(Array.from(tags));
            }
        } catch (err) {
            console.error('Error fetching feed tags:', err);
        }
    };

    // Add tag to feed
    const addTagToFeed = async (uuid) => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed/add/${uuid}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                await fetchFeedTags();
            }
        } catch (err) {
            console.error('Error adding tag to feed:', err);
        }
    };

    // Remove tag from feed
    const removeTagFromFeed = async (uuid) => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed/remove/${uuid}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                await fetchFeedTags();
            }
        } catch (err) {
            console.error('Error removing tag from feed:', err);
        }
    };

    // Add all tags to feed
    const addAllTagsToFeed = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed/add-all`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                await fetchFeedTags();
            }
        } catch (err) {
            console.error('Error adding all tags to feed:', err);
        }
    };

    // Clear all tags from feed
    const clearFeed = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed/clear`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                await fetchFeedTags();
            }
        } catch (err) {
            console.error('Error clearing feed:', err);
        }
    };

    // Check if tag is in feed
    const isTagInFeed = (tagUuid) => {
        return feedTags.some(feedTag => feedTag.uuid === tagUuid);
    };

    // Toggle tag in feed
    const toggleTagInFeed = (tag) => {
        if (isTagInFeed(tag.uuid)) {
            removeTagFromFeed(tag.uuid);
        } else {
            addTagToFeed(tag.uuid);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchAllTags(), fetchFeedTags()]);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) return <div className="loading">Loading tags...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="tag-page">
            {/* Burger menu for sidebar */}
            <label className="burger" htmlFor="burger">
                <input
                    type="checkbox"
                    id="burger"
                    checked={sidebarOpen}
                    onChange={toggleSidebar}
                />
                <span></span><span></span><span></span>
            </label>

            {/* Sidebar component */}
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

            <div className="header">
                <h1>Manage Tags</h1>
            </div>

            <div className="controls">
                <button
                    className="btn add-all-btn"
                    onClick={addAllTagsToFeed}
                    disabled={allTags.length === 0}
                >
                    Add All to Feed
                </button>
                <button
                    className="btn clear-btn"
                    onClick={clearFeed}
                    disabled={feedTags.length === 0}
                >
                    Clear Feed
                </button>
            </div>

            <div className="stats">
                <span>Total: {allTags.length}</span>
                <span>In Feed: {feedTags.length}</span>
            </div>

            <div className="tags-container">
                <div className="section">
                    <h2>All Tags</h2>
                    <div className="tags-list">
                        {allTags.map(tag => (
                            <div
                                key={tag.uuid}
                                className={`tag ${isTagInFeed(tag.uuid) ? 'selected' : ''}`}
                                onClick={() => toggleTagInFeed(tag)}
                            >
                                <span className="tag-name">{tag.name}</span>
                                <span className="tag-action">
                                    {isTagInFeed(tag.uuid) ? '✓' : '+'}
                                </span>
                            </div>
                        ))}
                    </div>
                    {allTags.length === 0 && (
                        <div className="no-tags">No tags available</div>
                    )}
                </div>

                <div className="section">
                    <h2>Feed Tags</h2>
                    <div className="tags-list">
                        {feedTags.map(tag => (
                            <div
                                key={tag.uuid}
                                className="tag feed-tag"
                                onClick={() => removeTagFromFeed(tag.uuid)}
                            >
                                <span className="tag-name">{tag.name}</span>
                                <span className="tag-action">×</span>
                            </div>
                        ))}
                    </div>
                    {feedTags.length === 0 && (
                        <div className="no-tags">No tags in feed</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TagPage;