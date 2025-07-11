import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaUserCircle,
    FaUserPlus,
    FaUserMinus,
    FaArrowLeft,
    FaArrowRight
} from 'react-icons/fa';
import ExperienceCard from '../components/ExperienceCard';
import SuggestionCard from '../components/SuggestionCard';
import Sidebar from '../components/SideBar';
import '../styles/RelationshipProfilePage.css';
import { API_URL } from '../Api.js';

const RelationshipProfile = ({ user, setUser }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profilePicture, setProfilePicture] = useState(null);
    const [userPosts, setUserPosts] = useState({ experiences: [], suggestions: [] });
    const [isFollowing, setIsFollowing] = useState(false);
    const [canViewPosts, setCanViewPosts] = useState(true);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [activeTab, setActiveTab] = useState('posts');
    const [postFilter, setPostFilter] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userProfilePicture, setUserProfilePicture] = useState(null);
    const [postsPage, setPostsPage] = useState(1);
    const [itemsPerPage] = useState(4);
    const defaultProfilePicture = `${API_URL}/images/default-profile-picture.jpg`;

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleImageError = () => {
        setProfilePicture(defaultProfilePicture);
        setUserProfilePicture(defaultProfilePicture);
    };

    // Pagination functions
    const getPaginatedItems = (items) => {
        const startIndex = (postsPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    const totalPages = (items) => Math.ceil(items.length / itemsPerPage);

    const handlePrevPage = () => {
        setPostsPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = (items) => {
        setPostsPage(prev => Math.min(prev + 1, totalPages(items)));
    };

    useEffect(() => {
        setPostsPage(1); // Reset to first page when tab or filter changes
    }, [activeTab, postFilter]);

    useEffect(() => {
        const fetchUserProfilePicture = async () => {
            try {
                const profileRes = await fetch(`${API_URL}/api/auth/me/profile`, {
                    credentials: 'include',
                });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    const picUrl = profileData.profilePictureUrl
                        ? `${API_URL}${profileData.profilePictureUrl}`
                        : defaultProfilePicture;
                    setUserProfilePicture(picUrl);
                }
            } catch (err) {
                console.error('Error fetching user profile picture:', err);
                setUserProfilePicture(defaultProfilePicture);
            }
        };

        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/me`, {
                    credentials: 'include',
                });
                if (!res.ok) navigate('/login');
                else fetchUserProfilePicture();
            } catch {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate, defaultProfilePicture]);

    const fetchProfileData = useCallback(async () => {
        try {
            const userRes = await fetch(`${API_URL}/api/auth/me/users/${userId}/profile`, {
                credentials: 'include'
            });

            if (!userRes.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await userRes.json();
            setProfileUser(userData);
            setIsFollowing(userData.isFollowing);
            setCanViewPosts(userData.canViewPosts !== false);

            const profilePicUrl = userData.profilePictureUrl
                ? userData.profilePictureUrl.startsWith('http')
                    ? userData.profilePictureUrl
                    : `${API_URL}${userData.profilePictureUrl}`
                : defaultProfilePicture;
            setProfilePicture(profilePicUrl);

            if (userData.canViewPosts !== false) {
                const postsRes = await fetch(`${API_URL}/api/auth/me/users/${userId}/profile/posts`, {
                    credentials: 'include'
                });

                if (postsRes.ok) {
                    const postsData = await postsRes.json();
                    setUserPosts(postsData);
                }
            }
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, defaultProfilePicture]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleMentionClick = (mentionUuid) => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/profile/${mentionUuid}`);
    };

    const handleFollow = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/me/users/${userId}/follow`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchProfileData();
            }
        } catch (err) {
            console.error('Error following user:', err);
        }
    };

    const handleUnfollow = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/me/users/${userId}/unfollow`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchProfileData();
            }
        } catch (err) {
            console.error('Error unfollowing user:', err);
        }
    };

    const formatDate = ts => new Date(ts).toLocaleDateString();

    const renderTags = tags => (
        Array.isArray(tags) && tags.map((tag, i) => (
            <span key={i} className="relationship-tag-badge">
                {typeof tag === 'object' ? tag.name : tag}
            </span>
        ))
    );

    const toggleQuote = (postId) => {
        setHiddenQuotes(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const filterPosts = () => {
        if (!userPosts) return [];

        switch (postFilter) {
            case 'experiences':
                return userPosts.experiences || [];
            case 'suggestions':
                return userPosts.suggestions || [];
            default:
                return [
                    ...(userPosts.experiences || []).map(post => ({ ...post, type: 'Experience' })),
                    ...(userPosts.suggestions || []).map(post => ({ ...post, type: 'Suggestion' }))
                ];
        }
    };

    if (loading) {
        return (
            <div className="relationship-loading">
                <div className="relationship-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    const filteredPosts = filterPosts();
    const paginatedPosts = getPaginatedItems(filteredPosts);
    const totalPagesCount = totalPages(filteredPosts);
    const showPagination = filteredPosts.length > itemsPerPage;

    return (
        <div className="relationship-profile-page">
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
                profilePicture={userProfilePicture}
                handleImageError={handleImageError}
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                baseApiUrl={API_URL}
                defaultProfilePicture={defaultProfilePicture}
            />

            <div className={`relationship-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="relationship-header">
                    <div className="relationship-cover">
                        <div className="relationship-avatar-container">
                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt="Profile"
                                    className="relationship-avatar"
                                    onError={() => setProfilePicture(defaultProfilePicture)}
                                />
                            ) : (
                                <FaUserCircle className="relationship-default-icon"/>
                            )}
                            <div className="relationship-username">@{profileUser?.username}</div>
                        </div>
                    </div>

                    <div className="relationship-bio">
                        <p>{profileUser?.biography || 'No bio provided'}</p>
                    </div>

                    <div className="relationship-stats">
                        <div className="relationship-stat">
                            <span className="relationship-stat-value">
                                {(userPosts.experiences?.length || 0) + (userPosts.suggestions?.length || 0)}
                            </span>
                            <span className="relationship-stat-label">Posts</span>
                        </div>
                        <div className="relationship-stat">
                            <span className="relationship-stat-value">{profileUser?.followerAmount || 0}</span>
                            <span className="relationship-stat-label">Followers</span>
                        </div>
                        <div className="relationship-stat">
                            <span className="relationship-stat-value">{profileUser?.followingAmount || 0}</span>
                            <span className="relationship-stat-label">Following</span>
                        </div>
                    </div>

                    {user && user.uuid !== userId && (
                        <div className="relationship-actions">
                            {isFollowing ? (
                                <button
                                    className="relationship-btn-outline-danger"
                                    onClick={handleUnfollow}
                                >
                                    <FaUserMinus/> Unfollow
                                </button>
                            ) : (
                                <button
                                    className="relationship-btn-primary"
                                    onClick={handleFollow}
                                >
                                    <FaUserPlus/> Follow
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="relationship-nav">
                    <button
                        className={`relationship-nav-item ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Posts
                    </button>
                </div>

                {activeTab === 'posts' && (
                    <div className="relationship-content">
                        {canViewPosts ? (
                            <>
                                <div className="relationship-post-filter">
                                    <select
                                        value={postFilter}
                                        onChange={(e) => {
                                            setPostFilter(e.target.value);
                                            setPostsPage(1);
                                        }}
                                    >
                                        <option value="all">All Posts</option>
                                        <option value="suggestions">Suggestions</option>
                                        <option value="experiences">Experiences</option>
                                    </select>
                                </div>

                                {filteredPosts.length === 0 ? (
                                    <div className="relationship-no-posts">
                                        <p>No posts found.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relationship-posts-grid">
                                            {paginatedPosts.map(post => {
                                                const isExperience = post.type === 'Experience';
                                                const postId = post.uuid || post.id;

                                                if (isExperience) {
                                                    return (
                                                        <ExperienceCard
                                                            key={postId}
                                                            user={user}
                                                            post={post}
                                                            username={profileUser.username}
                                                            baseApiUrl={API_URL}
                                                            hiddenQuotes={hiddenQuotes}
                                                            toggleQuote={() => toggleQuote(postId)}
                                                            showMentions={showMentions}
                                                            setShowMentions={setShowMentions}
                                                            renderMentions={(mentions, id) => (
                                                                showMentions[id] && (
                                                                    <div className="relationship-post-mentions">
                                                                        <h6>Mentions:</h6>
                                                                        <div className="relationship-mentions-list">
                                                                            {mentions.map((mention, i) => (
                                                                                <span
                                                                                    key={i}
                                                                                    className="relationship-mention clickable"
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
                                                            isOwner={user?.uuid === profileUser.uuid}
                                                        />
                                                    );
                                                }

                                                return (
                                                    <SuggestionCard
                                                        key={postId}
                                                        user={user}
                                                        post={post}
                                                        baseApiUrl={API_URL}
                                                        username={profileUser.username}
                                                        renderTags={renderTags}
                                                        formatDate={formatDate}
                                                        isOwner={user?.uuid === profileUser.uuid}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {showPagination && (
                                            <div className="relationship-pagination-controls">
                                                <button
                                                    className="relationship-pagination-button"
                                                    onClick={handlePrevPage}
                                                    disabled={postsPage === 1}
                                                >
                                                    <FaArrowLeft />
                                                </button>
                                                <span className="relationship-page-info">
                                                    Page {postsPage} of {totalPagesCount}
                                                </span>
                                                <button
                                                    className="relationship-pagination-button"
                                                    onClick={() => handleNextPage(filteredPosts)}
                                                    disabled={postsPage >= totalPagesCount}
                                                >
                                                    <FaArrowRight />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="relationship-no-posts">
                                <p>This account is private. Follow to see their posts.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center">
                    <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                        <FaArrowLeft/> Go back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RelationshipProfile;