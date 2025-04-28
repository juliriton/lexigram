import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {FaUserCircle, FaUserPlus, FaUserMinus, FaHome, FaArrowLeft} from 'react-icons/fa';
import ExperienceCard from '../components/ExperienceCard';
import SuggestionCard from '../components/SuggestionCard';
import '../styles/RelationshipProfilePage.css';

const RelationshipProfile = ({ user }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profilePicture, setProfilePicture] = useState(null);
    const [userPosts, setUserPosts] = useState({ experiences: [], suggestions: [] });
    const [isFollowing, setIsFollowing] = useState(false);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [activeTab, setActiveTab] = useState('posts');
    const [postFilter, setPostFilter] = useState('all');
    const baseApiUrl = 'http://localhost:8080';
    const defaultProfilePicture = `${baseApiUrl}/images/default-profile-picture.jpg`;

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

    const fetchProfileData = useCallback(async () => {
        try {



            const userRes = await fetch(`${baseApiUrl}/api/auth/me/users/${userId}/profile`, {
                credentials: 'include'
            });

            if (!userRes.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await userRes.json();
            setProfileUser(userData);

            setIsFollowing(userData.isFollowing);

            setProfilePicture(
                userData.profilePictureUrl
                    ? userData.profilePictureUrl.startsWith('http')
                        ? userData.profilePictureUrl
                        : `${baseApiUrl}${userData.profilePictureUrl}`
                    : defaultProfilePicture
            );

            const postsRes = await fetch(`${baseApiUrl}/api/auth/me/users/${userId}/profile/posts`, {
                credentials: 'include'
            });

            if (postsRes.ok) {
                const postsData = await postsRes.json();
                setUserPosts(postsData);
            }
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, baseApiUrl, defaultProfilePicture]);

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
            const response = await fetch(`${baseApiUrl}/api/auth/me/users/${userId}/follow`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchProfileData();
            } else {
                console.error('Failed to follow user:', await response.text());
            }
        } catch (err) {
            console.error('Error following user:', err);
        }
    };

    const handleUnfollow = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/users/${userId}/unfollow`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchProfileData();
            } else {
                console.error('Failed to unfollow user:', await response.text());
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

        switch(postFilter) {
            case 'experiences':
                return userPosts.experiences || [];
            case 'suggestions':
                return userPosts.suggestions || [];
            default:
                return [
                    ...(userPosts.experiences || []).map(post => ({...post, type: 'Experience'})),
                    ...(userPosts.suggestions || []).map(post => ({...post, type: 'Suggestion'}))
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

    return (
        <div className="relationship-container">

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
                        <span
                            className="relationship-stat-value">{profileUser?.followerAmount || 0}</span>
                        <span className="relationship-stat-label">Followers</span>
                    </div>
                    <div className="relationship-stat">
                        <span
                            className="relationship-stat-value">{profileUser?.followingAmount || 0}</span>
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
                    <div className="relationship-post-filter">
                        <select
                            value={postFilter}
                            onChange={(e) => setPostFilter(e.target.value)}
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
                        <div className="relationship-posts-grid">
                            {filteredPosts.map(post => {
                                const isExperience = post.type === 'Experience';
                                const postId = post.uuid || post.id;

                                if (isExperience) {
                                    return (
                                        <ExperienceCard
                                            key={postId}
                                            user={user}
                                            post={post}
                                            username={profileUser.username}
                                            baseApiUrl={baseApiUrl}
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
                                        baseApiUrl={baseApiUrl}
                                        username={profileUser.username}
                                        renderTags={renderTags}
                                        formatDate={formatDate}
                                        isOwner={user?.uuid === profileUser.uuid}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'about' && (
                <div className="relationship-content">
                    <h3 className="relationship-content-title">About {profileUser?.username}</h3>
                    <p>{profileUser?.biography || 'This user has not added any biographical information yet.'}</p>
                </div>
            )}

            <div className="text-center">
                <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                    <FaArrowLeft/> Go back
                </button>
            </div>

            <div className="text-center">
                <button className="btn btn-success mt-3" onClick={() => navigate('/')}>
                    <FaHome/> Home
                </button>
            </div>

        </div>
    );
};

export default RelationshipProfile;