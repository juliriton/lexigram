import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaArrowLeft, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import ExperienceCard from '../components/ExperienceCard';
import SuggestionCard from '../components/SuggestionCard';
import '../styles/RelationshipProfile.css';

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

    const baseApiUrl = 'http://localhost:8080';
    const defaultProfilePicture = `${baseApiUrl}/images/default-profile-picture.jpg`;

    const fetchProfileData = async () => {
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
    };

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

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
                // Re-fetch the profile data to update counts and follow status
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
            <span key={i} className="tag-badge">
                {typeof tag === 'object' ? tag.name : tag}
            </span>
        ))
    );

    if (loading) {
        return (
            <div className="container loading-container">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </div>

            <div className="profile-header">
                <div className="profile-picture-container">
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="Profile"
                            className="profile-picture"
                            onError={() => setProfilePicture(defaultProfilePicture)}
                        />
                    ) : (
                        <FaUserCircle size={80} className="default-profile-icon" />
                    )}
                </div>

                <div className="profile-info">
                    <div className="profile-details">
                        <h2>@{profileUser?.username}</h2>
                        <p className="profile-bio">{profileUser?.biography || 'No bio provided'}</p>

                        <div className="profile-stats">
                            <div className="stat">
                                <span className="stat-value">{userPosts.experiences.length + userPosts.suggestions.length}</span>
                                <span className="stat-label">Posts</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{profileUser?.followerAmount || 0}</span>
                                <span className="stat-label">Followers</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{profileUser?.followingAmount || 0}</span>
                                <span className="stat-label">Following</span>
                            </div>
                        </div>

                        {user && user.uuid !== userId && (
                            <div className="relationship-actions">
                                {isFollowing ? (
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={handleUnfollow}
                                    >
                                        <FaUserMinus /> Unfollow
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleFollow}
                                    >
                                        <FaUserPlus /> Follow
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <h3 className="content-title">Posts</h3>

                <div className="posts-grid">
                    {userPosts.experiences.map(exp => (
                        <ExperienceCard
                            key={exp.uuid}
                            post={exp}
                            username={profileUser.username}
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
                                                <span key={i} className="mention">@{mention}</span>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                            renderTags={renderTags}
                            formatDate={formatDate}
                            isOwner={user?.uuid === profileUser.uuid}
                        />
                    ))}

                    {userPosts.suggestions.map(sug => (
                        <SuggestionCard
                            key={sug.uuid}
                            post={sug}
                            baseApiUrl={baseApiUrl}
                            username={profileUser.username}
                            renderTags={renderTags}
                            formatDate={formatDate}
                            isOwner={user?.uuid === profileUser.uuid}
                        />
                    ))}

                    {userPosts.experiences.length === 0 && userPosts.suggestions.length === 0 && (
                        <div className="no-content">
                            <p>No posts yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RelationshipProfile;