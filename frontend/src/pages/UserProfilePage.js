import React, { useEffect, useState, useCallback } from 'react';
import { FaUser, FaUsers, FaBookmark, FaTimes, FaUserEdit, FaImage, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfilePage.css';
import ExperienceCard from '../components/ExperienceCard';
import SuggestionCard from '../components/SuggestionCard';
import EditSuggestionModal from '../components/EditSuggestionModal';
import EditExperienceModal from '../components/EditExperienceModal';
import SavedContent from '../components/SavedContent';
import Sidebar from '../components/SideBar';
import { API_URL } from '../Api.js';

const UserProfilePage = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState('');
    const [newBio, setNewBio] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [postFilter, setPostFilter] = useState('all');
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingDefaultImage, setUsingDefaultImage] = useState(false);
    const [attemptedLoad, setAttemptedLoad] = useState(false);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [activeTab, setActiveTab] = useState('posts');
    const [updateMessage, setUpdateMessage] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [editingSuggestion, setEditingSuggestion] = useState(null);
    const [editingExperience, setEditingExperience] = useState(null);
    const [postCount, setPostCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [removeFollowerConfirmation, setRemoveFollowerConfirmation] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);

    // Pagination states
    const [postsPage, setPostsPage] = useState(1);
    const [savedPage, setSavedPage] = useState(1);
    const [followersPage, setFollowersPage] = useState(1);
    const [followingPage, setFollowingPage] = useState(1);
    const [itemsPerPage] = useState(4);

    const defaultProfilePic = `${API_URL}/images/default-profile-picture.jpg`;

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleImageError = () => {
        setUsingDefaultImage(true);
        setProfilePicture(defaultProfilePic);
    };

    // Pagination functions
    const getPaginatedItems = (items, currentPage) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    const totalPages = (items) => Math.ceil(items.length / itemsPerPage);

    const handlePrevPage = (setPage, currentPage) => {
        setPage(Math.max(currentPage - 1, 1));
    };

    const handleNextPage = (setPage, currentPage, items) => {
        setPage(Math.min(currentPage + 1, totalPages(items)));
    };

    // Reset pagination when tab changes
    useEffect(() => {
        setPostsPage(1);
        setSavedPage(1);
        setFollowersPage(1);
        setFollowingPage(1);
    }, [activeTab]);

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
        const loadProfile = async () => {
            try {
                const [resUser, resProfile] = await Promise.all([
                    fetch(`${API_URL}/api/auth/me`, {
                        credentials: 'include'
                    }),
                    fetch(`${API_URL}/api/auth/me/profile`, {
                        credentials: 'include'
                    })
                ]);

                if (!resUser.ok || !resProfile.ok) throw new Error('Error loading data');

                const userData = await resUser.json();
                const profileData = await resProfile.json();

                setUsername(userData.username);
                setProfile(profileData);
                setProfilePicture(
                    profileData.profilePictureUrl
                        ? `${API_URL}${profileData.profilePictureUrl}`
                        : defaultProfilePic
                );
                setNewBio(profileData.biography || '');
            } catch (err) {
                setError(err.message);
                console.error("Error loading profile:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [defaultProfilePic]);

    useEffect(() => {
        const fetchPosts = async () => {
            let url;
            switch (postFilter) {
                case 'suggestions':
                    url = `${API_URL}/api/auth/me/profile/posts/suggestions`;
                    break;
                case 'experiences':
                    url = `${API_URL}/api/auth/me/profile/posts/experiences`;
                    break;
                default:
                    url = `${API_URL}/api/auth/me/profile/posts`;
            }

            try {
                const res = await fetch(url, {
                    credentials: 'include'
                });

                if (!res.ok) throw new Error('Failed to fetch posts');

                const data = await res.json();
                let processedPosts = [];

                if (postFilter === 'all') {
                    if (data.experiences && Array.isArray(data.experiences)) {
                        processedPosts = [...processedPosts, ...data.experiences.map(exp => ({ ...exp, type: 'Experience' }))];
                    }
                    if (data.suggestions && Array.isArray(data.suggestions)) {
                        processedPosts = [...processedPosts, ...data.suggestions.map(sug => ({ ...sug, type: 'Suggestion' }))];
                    }
                    if (Array.isArray(data)) {
                        processedPosts = data;
                    }
                    setPostCount(processedPosts.length);
                } else {
                    if (Array.isArray(data)) {
                        processedPosts = data.map(item => ({ ...item, type: postFilter === 'experiences' ? 'Experience' : 'Suggestion' }));
                    } else if (typeof data === 'object' && data !== null) {
                        const items = postFilter === 'experiences' ? data.experiences : data.suggestions;
                        if (Array.isArray(items)) {
                            processedPosts = items.map(item => ({ ...item, type: postFilter === 'experiences' ? 'Experience' : 'Suggestion' }));
                        }
                    }
                }

                setPosts(processedPosts);
                setPostsPage(1); // Reset to first page when posts change
            } catch (err) {
                console.error("Error fetching posts:", err);
                setPosts([]);
            }
        };

        fetchPosts();
    }, [postFilter]);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const followerRes = await fetch(`${API_URL}/api/auth/me/profile/followers`, {
                    credentials: 'include'
                });

                if (followerRes.ok) {
                    const followerData = await followerRes.json();
                    setFollowers(followerData);
                    setFollowerCount(followerData.length);
                }

                const followingRes = await fetch(`${API_URL}/api/auth/me/profile/following`, {
                    credentials: 'include'
                });

                if (followingRes.ok) {
                    const followingData = await followingRes.json();
                    setFollowing(followingData);
                    setFollowingCount(followingData.length);
                }
            } catch (err) {
                console.error("Error fetching connections:", err);
            }
        };

        fetchConnections();
    }, [activeTab]);

    useEffect(() => {
        const validateImage = async () => {
            if (!profile?.profilePictureUrl || attemptedLoad) return;

            setAttemptedLoad(true);
            const imgUrl = `${API_URL}${profile.profilePictureUrl}`;
            const img = new Image();
            img.onload = () => setUsingDefaultImage(false);
            img.onerror = () => setUsingDefaultImage(true);
            img.src = imgUrl;
        };

        validateImage();
    }, [profile, attemptedLoad]);

    const handleBioUpdate = async () => {
        try {
            const previousBioValue = profile.biography || 'No bio yet — still searching for the right words.';
            const bioToUpdate = newBio.trim() || 'No bio yet — still searching for the right words.';

            const res = await fetch(`${API_URL}/api/auth/me/profile/edit/biography`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ biography: bioToUpdate })
            });

            if (!res.ok) throw new Error('Update failed');

            setProfile(prev => ({ ...prev, biography: bioToUpdate }));
            setUpdateMessage(`Your biography has been updated!
Previous: "${previousBioValue}"
New: "${bioToUpdate}"`);
        } catch (err) {
            console.error("Error updating biography:", err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'image/jpeg') {
            alert("Please select a JPG image.");
            return;
        }
        setSelectedFile(file);
    };

    const handlePictureUpload = async () => {
        if (!selectedFile) return alert("Please select an image.");

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch(`${API_URL}/api/auth/me/profile/edit/profile-picture`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Upload failed');

            const profileRes = await fetch(`${API_URL}/api/auth/me/profile`, {
                credentials: 'include'
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
                setProfilePicture(
                    profileData.profilePictureUrl
                        ? `${API_URL}${profileData.profilePictureUrl}`
                        : defaultProfilePic
                );
            }

            setUsingDefaultImage(false);
            setAttemptedLoad(false);
            setSelectedFile(null);
            const fileInput = document.getElementById('profile-picture-input');
            if (fileInput) fileInput.value = '';
            setUpdateMessage('Your profile picture has been updated!');
        } catch (err) {
            console.error("Error uploading picture:", err);
            alert("Error uploading picture");
        }
    };

    const handleDeletePost = async () => {
        if (!deleteConfirmation) return;

        const { uuid, type } = deleteConfirmation;

        try {
            const endpoint = type === 'Experience'
                ? `${API_URL}/api/auth/me/profile/posts/delete/experiences/${uuid}`
                : `${API_URL}/api/auth/me/profile/posts/delete/suggestions/${uuid}`;

            const res = await fetch(endpoint, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error(`Failed to delete ${type.toLowerCase()}`);
            }

            setPosts(posts.filter(post => post.uuid !== uuid));
            setPostCount(prevCount => prevCount - 1);
            setUpdateMessage(`${type} successfully deleted`);
            setDeleteConfirmation(null);
        } catch (err) {
            console.error(`Error deleting ${type.toLowerCase()}:`, err);
            setUpdateMessage(`Error deleting ${type.toLowerCase()}: ${err.message}`);
        }
    };

    const handleRemoveFollower = async () => {
        if (!removeFollowerConfirmation) return;

        const { uuid, username } = removeFollowerConfirmation;

        try {
            const res = await fetch(`${API_URL}/api/auth/me/profile/followers/remove/${uuid}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Failed to remove follower');
            }

            setFollowers(followers.filter(follower => follower.uuid !== uuid));
            setFollowerCount(prevCount => prevCount - 1);
            setUpdateMessage(`${username} has been removed from your followers`);
            setRemoveFollowerConfirmation(null);
        } catch (err) {
            console.error('Error removing follower:', err);
            setUpdateMessage(`Error removing follower: ${err.message}`);
            setRemoveFollowerConfirmation(null);
        }
    };

    const confirmRemoveFollower = (follower) => {
        const uuid = follower?.uuid;
        const username = follower?.username;

        if (!uuid || !username) {
            console.error("Cannot remove follower: Missing UUID or username", follower);
            setUpdateMessage("Error: Cannot remove this follower. Missing information.");
            return;
        }

        setRemoveFollowerConfirmation({ uuid, username });
    };

    const cancelRemoveFollower = () => {
        setRemoveFollowerConfirmation(null);
    };

    const confirmDelete = (post, postType) => {
        const uuid = post?.uuid;
        if (!uuid) {
            console.error("Cannot delete post: Missing UUID", post);
            setUpdateMessage("Error: Cannot delete this post. Missing UUID.");
            return;
        }

        setDeleteConfirmation({ uuid: uuid, type: postType });
    };

    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    const handleEditSuggestion = (suggestion) => {
        setEditingSuggestion(suggestion);
    };

    const handleEditExperience = (experience) => {
        setEditingExperience(experience);
    };

    const handleContentUnsaved = useCallback((unsavedItem, type) => {
        // Update the posts array with the updated post data
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.uuid === unsavedItem.uuid
                    ? { ...unsavedItem, type: post.type } // Preserve the type
                    : post
            )
        );
    }, []);

    const handleCloseSuggestionModal = () => {
        setEditingSuggestion(null);
        setTimeout(() => {}, 50);
    };

    const handleCloseExperienceModal = () => {
        setEditingExperience(null);
        setTimeout(() => {}, 50);
    };

    const handleUpdateSuggestion = (updatedSuggestion, message) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.uuid === updatedSuggestion.uuid) {
                    // Ensure we maintain all existing properties and only update the changed ones
                    return {
                        ...post,
                        ...updatedSuggestion,
                        type: 'Suggestion'  // Ensure type is preserved
                    };
                }
                return post;
            })
        );

        // Close the modal after successful update
        setEditingSuggestion(null);
    };

    const handleUpdateExperience = (updatedExperience, message) => {
        setPosts(prevPosts => prevPosts.map(post =>
            post.uuid === updatedExperience.uuid ? {
                ...updatedExperience,
                type: 'Experience'  // Ensure type is preserved
            } : post
        ));

        // Force a refresh of the editing experience if it exists
        if (editingExperience && editingExperience.uuid === updatedExperience.uuid) {
            setEditingExperience(updatedExperience);
        }

    };

    const getProfileImageUrl = () => {
        if (usingDefaultImage || !profile?.profilePictureUrl) {
            return defaultProfilePic;
        }
        return `${API_URL}${profile.profilePictureUrl}?t=${Date.now()}`;
    };

    const handleNavigateToUserProfile = (uuid) => {
        navigate(`/profile/${uuid}`);
    };

    const getConnectionProfileImageUrl = (connection) => {
        if (!connection?.profilePictureUrl) {
            return defaultProfilePic;
        }
        return `${API_URL}${connection.profilePictureUrl}`;
    };

    const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString();

    const renderTags = (tags) =>
        Array.isArray(tags) && tags.map((tag, i) => (
            <span key={i} className="tag-badge">
                {typeof tag === 'object' ? tag.name : tag}
            </span>
        ));

    const toggleQuote = (postId) => {
        setHiddenQuotes(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleMentionClick = (mentionUuid) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.uuid !== mentionUuid) {
            navigate(`/profile/${mentionUuid}`);
        }
    };

    const renderMentions = (mentions, id) => (
        showMentions[id] && (
            <div className="post-mentions">
                <h6>Mentions:</h6>
                <div className="mentions-list">
                    {mentions.map((mention, i) => (
                        <span
                            key={i}
                            className="mention clickable"
                            onClick={() => handleMentionClick(mention.uuid)}
                            style={{cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline'}}
                        >
                            @{mention.username}
                        </span>
                    ))}
                </div>
            </div>
        )
    );

    const renderPost = (post) => {
        const isExperience = post.type === 'Experience';
        const postId = post.uuid || post.id;

        if (isExperience) {
            return (
                <div key={postId} className="post-wrapper">
                    <ExperienceCard
                        key={postId}
                        user={user}
                        post={post}
                        baseApiUrl={API_URL}
                        username={'Me'}
                        hiddenQuotes={hiddenQuotes}
                        toggleQuote={toggleQuote}
                        showMentions={showMentions}
                        setShowMentions={setShowMentions}
                        renderMentions={renderMentions}
                        renderTags={renderTags}
                        formatDate={formatDate}
                        onDelete={() => confirmDelete(post, 'Experience')}
                        onEdit={() => handleEditExperience(post)}
                        onActionComplete={handleUpdateExperience}
                        onInteraction={(updatedPost) => {
                            setPosts(posts.map(p =>
                                p.uuid === updatedPost.uuid ? updatedPost : p
                            ));
                        }}
                        isOwner={true}
                        disableInteractions={false}
                        showEditOption={true}
                        disablePopup={true}
                    />
                </div>
            );
        }

        return (
            <div key={postId} className="post-wrapper">
                <SuggestionCard
                    user={user}
                    post={post}
                    baseApiUrl={API_URL}
                    username={'Me'}
                    hiddenQuotes={hiddenQuotes}
                    toggleQuote={toggleQuote}
                    showMentions={showMentions}
                    setShowMentions={setShowMentions}
                    renderMentions={renderMentions}
                    renderTags={renderTags}
                    formatDate={formatDate}
                    onActionComplete={handleUpdateSuggestion}
                    onInteraction={(updatedPost) => {
                        setPosts(posts.map(p =>
                            p.uuid === updatedPost.uuid ? updatedPost : p
                        ));
                    }}
                    onDelete={() => confirmDelete(post, 'Suggestion')}
                    onEdit={() => handleEditSuggestion(post)}
                    isOwner={true}
                    disableInteractions={true}
                    disableInternalEdit={false}
                />
            </div>
        );
    };

    const renderConnectionList = (connections, connectionType, currentPage, setPage) => {
        if (connections.length === 0) {
            return (
                <div className="no-connections">
                    <p>No {connectionType} found.</p>
                </div>
            );
        }

        const paginatedConnections = getPaginatedItems(connections, currentPage);
        const totalPagesCount = totalPages(connections);

        return (
            <div className="connections-container">
                <div className="connections-list">
                    {paginatedConnections.map(connection => (
                        <div key={connection.uuid} className="connection-card">
                            <div
                                className="connection-info-clickable"
                                onClick={() => handleNavigateToUserProfile(connection.uuid)}
                            >
                                <div className="connection-avatar">
                                    <img
                                        src={getConnectionProfileImageUrl(connection)}
                                        alt={connection.username}
                                        onError={(e) => {
                                            e.target.src = defaultProfilePic;
                                        }}
                                    />
                                </div>
                                <div className="connection-info">
                                    <h4 className="connection-username">{connection.username}</h4>
                                    <p className="connection-email">{connection.email}</p>
                                </div>
                            </div>
                            {connectionType === 'followers' && (
                                <button
                                    className="remove-follower-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmRemoveFollower(connection);
                                    }}
                                    title="Remove follower"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {connections.length > itemsPerPage && (
                    <div className="pagination-controls">
                        <button
                            className="pagination-button"
                            onClick={() => handlePrevPage(setPage, currentPage)}
                            disabled={currentPage === 1}
                        >
                            <FaArrowLeft />
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {totalPagesCount}
                        </span>
                        <button
                            className="pagination-button"
                            onClick={() => handleNextPage(setPage, currentPage, connections)}
                            disabled={currentPage >= totalPagesCount}
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="profile-error">
                <div className="error-icon"></div>
                <h3>Error Loading Profile</h3>
                <p>{error || "No profile data found"}</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
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
                defaultProfilePicture={defaultProfilePic}
            />

            <div className="profile-header">
                <div className="profile-cover">
                    <div className="profile-avatar-container">
                        <img
                            src={getProfileImageUrl()}
                            alt="Profile"
                            className="profile-avatar"
                            onError={(e) => {
                                setUsingDefaultImage(true);
                                e.target.src = defaultProfilePic;
                            }}
                        />
                        <div className="profile-username">{username}</div>
                    </div>
                </div>
            </div>

            <div className="profile-bio">
                <p>{profile.biography}</p>
            </div>

            <div className="profile-stats">
                <div className="profile-stat">
                    <div className="profile-stat-value">{postCount}</div>
                    <div className="profile-stat-label">Posts</div>
                </div>
                <div className="profile-stat">
                    <div className="profile-stat-value">{followerCount}</div>
                    <div className="profile-stat-label">Followers</div>
                </div>
                <div className="profile-stat">
                    <div className="profile-stat-value">{followingCount}</div>
                    <div className="profile-stat-label">Following</div>
                </div>
            </div>

            {updateMessage && (
                <div className="alert alert-info animate__animated animate__fadeInDown">
                    {updateMessage}
                    <button onClick={() => setUpdateMessage('')} className="close-alert" aria-label="Close">&times;</button>
                </div>
            )}

            {deleteConfirmation && (
                <div className="modal-backdrop">
                    <div className="delete-confirmation-modal">
                        <h3>Delete {deleteConfirmation.type}</h3>
                        <p>Are you sure you want to delete this {deleteConfirmation.type.toLowerCase()}? This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={cancelDelete}>Cancel</button>
                            <button className="btn-danger" onClick={handleDeletePost}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {removeFollowerConfirmation && (
                <div className="modal-backdrop">
                    <div className="delete-confirmation-modal">
                        <h3>Remove Follower</h3>
                        <p>Are you sure you want to remove <strong>{removeFollowerConfirmation.username}</strong> from your followers? They will no longer see your updates.</p>
                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={cancelRemoveFollower}>Cancel</button>
                            <button className="btn-danger" onClick={handleRemoveFollower}>Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {editingSuggestion && (
                <EditSuggestionModal
                    suggestion={editingSuggestion}
                    onClose={handleCloseSuggestionModal}
                    onUpdate={handleUpdateSuggestion}
                    baseApiUrl={API_URL}
                />
            )}

            {editingExperience && (
                <EditExperienceModal
                    experience={editingExperience}
                    onClose={handleCloseExperienceModal}
                    onUpdate={handleUpdateExperience}
                    baseApiUrl={API_URL}
                />
            )}

            <div className="profile-nav">
                <button
                    className={`profile-nav-item ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </button>
                <button
                    className={`profile-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    <FaBookmark /> Saved
                </button>
                <button
                    className={`profile-nav-item ${activeTab === 'followers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('followers')}
                >
                    <FaUser /> Followers
                </button>
                <button
                    className={`profile-nav-item ${activeTab === 'following' ? 'active' : ''}`}
                    onClick={() => setActiveTab('following')}
                >
                    <FaUsers /> Following
                </button>
                <button
                    className={`profile-nav-item ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('edit')}
                >
                    Edit Profile
                </button>
            </div>

            {activeTab === 'posts' && (
                <div className="profile-content profile-posts">
                    <div className="post-filter">
                        <div className="filter-controls">
                            <select
                                value={postFilter}
                                onChange={(e) => {
                                    setPostFilter(e.target.value);
                                    setPostsPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="all">All Posts</option>
                                <option value="suggestions">Suggestions</option>
                                <option value="experiences">Experiences</option>
                            </select>
                        </div>
                    </div>

                    {posts.length === 0 ? (
                        <div className="no-posts">
                            <p>No posts found for this filter.</p>
                        </div>
                    ) : (
                        <div className="posts-container">
                            <div className="posts-grid">
                                {getPaginatedItems(posts, postsPage).map(renderPost)}
                            </div>

                            {posts.length > itemsPerPage && (
                                <div className="pagination-controls">
                                    <button
                                        className="pagination-button"
                                        onClick={() => handlePrevPage(setPostsPage, postsPage)}
                                        disabled={postsPage === 1}
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <span className="page-info">
                                        Page {postsPage} of {totalPages(posts)}
                                    </span>
                                    <button
                                        className="pagination-button"
                                        onClick={() => handleNextPage(setPostsPage, postsPage, posts)}
                                        disabled={postsPage >= totalPages(posts)}
                                    >
                                        <FaArrowRight />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="profile-content profile-saved">
                    <SavedContent
                        user={user}
                        baseApiUrl={API_URL}
                        currentPage={savedPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setSavedPage}
                        onContentUnsaved={handleContentUnsaved}  // Add this prop
                    />
                </div>
            )}

            {activeTab === 'followers' && (
                <div className="profile-content profile-connections">
                    <h3>People who follow you</h3>
                    {renderConnectionList(followers, 'followers', followersPage, setFollowersPage)}
                </div>
            )}

            {activeTab === 'following' && (
                <div className="profile-content profile-connections">
                    <h3>People you follow</h3>
                    {renderConnectionList(following, 'following', followingPage, setFollowingPage)}
                </div>
            )}

            {activeTab === 'edit' && (
                <div className="profile-content profile-edit">
                    <div className="edit-section">
                        <h3><FaUserEdit style={{ marginRight: '8px' }}/> Update Biography</h3>
                        <textarea
                            value={newBio}
                            onChange={(e) => setNewBio(e.target.value)}
                            rows="4"
                            placeholder="Write something about yourself..."
                        />
                        <button className="btn-primary" onClick={handleBioUpdate}>Save Biography</button>
                    </div>

                    <div className="edit-section">
                        <h3><FaImage style={{ marginRight: '8px' }}/> Change Profile Picture</h3>
                        <input
                            type="file"
                            id="profile-picture-input"
                            accept="image/jpeg"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="edit-section-2">
                        <button className="btn-primary" onClick={handlePictureUpload}>Upload Picture</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;