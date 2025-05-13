import React, { useEffect, useState } from 'react';
import { FaHome, FaArrowLeft, FaUser, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfilePage.css';
import ExperienceCard from '../components/ExperienceCard';
import SuggestionCard from '../components/SuggestionCard';
import EditSuggestionModal from '../components/EditSuggestionModal';

const UserProfilePage = ({ user }) => {
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

    const defaultProfilePic = 'http://localhost:8080/images/default-profile-picture.jpg';
    const baseApiUrl = 'http://localhost:8080';

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

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const [resUser, resProfile] = await Promise.all([
                    fetch(`${baseApiUrl}/api/auth/me`, { credentials: 'include' }),
                    fetch(`${baseApiUrl}/api/auth/me/profile`, { credentials: 'include' })
                ]);

                if (!resUser.ok || !resProfile.ok) throw new Error('Error loading data');

                const userData = await resUser.json();
                const profileData = await resProfile.json();

                setUsername(userData.username);
                setProfile(profileData);
                setNewBio(profileData.biography || '');
            } catch (err) {
                setError(err.message);
                console.error("Error loading profile:", err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            let url;
            switch (postFilter) {
                case 'suggestions':
                    url = `${baseApiUrl}/api/auth/me/profile/posts/suggestions`;
                    break;
                case 'experiences':
                    url = `${baseApiUrl}/api/auth/me/profile/posts/experiences`;
                    break;
                default:
                    url = `${baseApiUrl}/api/auth/me/profile/posts`;
            }

            try {
                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch posts');
                const data = await res.json();

                let processedPosts = [];

                if (postFilter === 'all') {
                    if (data.experiences && Array.isArray(data.experiences)) {
                        processedPosts = [...processedPosts, ...data.experiences.map(exp => ({...exp, type: 'Experience'}))];
                    }
                    if (data.suggestions && Array.isArray(data.suggestions)) {
                        processedPosts = [...processedPosts, ...data.suggestions.map(sug => ({...sug, type: 'Suggestion'}))];
                    }
                    if (Array.isArray(data)) {
                        processedPosts = data;
                    }
                } else {
                    if (Array.isArray(data)) {
                        processedPosts = data.map(item => ({
                            ...item,
                            type: postFilter === 'experiences' ? 'Experience' : 'Suggestion'
                        }));
                    } else if (typeof data === 'object' && data !== null) {
                        const items = postFilter === 'experiences' ? data.experiences : data.suggestions;
                        if (Array.isArray(items)) {
                            processedPosts = items.map(item => ({
                                ...item,
                                type: postFilter === 'experiences' ? 'Experience' : 'Suggestion'
                            }));
                        }
                    }
                }

                console.log("Processed posts:", processedPosts);
                setPosts(processedPosts);
            } catch (err) {
                console.error("Error fetching posts:", err);
                setPosts([]);
            }
        };
        fetchPosts();
    }, [postFilter]);

    useEffect(() => {
        const fetchConnections = async () => {
            if (activeTab === 'followers' || activeTab === 'following') {
                try {
                    const endpoint = activeTab === 'followers'
                        ? `${baseApiUrl}/api/auth/me/profile/followers`
                        : `${baseApiUrl}/api/auth/me/profile/following`;

                    const res = await fetch(endpoint, { credentials: 'include' });
                    if (!res.ok) throw new Error(`Failed to fetch ${activeTab}`);

                    const data = await res.json();
                    if (activeTab === 'followers') {
                        setFollowers(data);
                    } else {
                        setFollowing(data);
                    }
                } catch (err) {
                    console.error(`Error fetching ${activeTab}:`, err);
                }
            }
        };

        fetchConnections();
    }, [activeTab, baseApiUrl]);

    useEffect(() => {
        const validateImage = async () => {
            if (!profile?.profilePictureUrl || attemptedLoad) return;
            setAttemptedLoad(true);

            const imgUrl = `${baseApiUrl}${profile.profilePictureUrl}`;

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

            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/biography`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ biography: bioToUpdate })
            });

            if (!res.ok) throw new Error('Update failed');

            setProfile(prev => ({
                ...prev,
                biography: bioToUpdate
            }));

            setUpdateMessage(`Your biography has been updated! Previous: "${previousBioValue}" New: "${bioToUpdate}"`);
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
            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/profile-picture`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Upload failed');

            const profileRes = await fetch(`${baseApiUrl}/api/auth/me/profile`, {
                credentials: 'include'
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
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
                ? `${baseApiUrl}/api/auth/me/profile/posts/delete/experiences/${uuid}`
                : `${baseApiUrl}/api/auth/me/profile/posts/delete/suggestions/${uuid}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error(`Failed to delete ${type.toLowerCase()}`);
            }

            setPosts(posts.filter(post => post.uuid !== uuid));
            setUpdateMessage(`${type} successfully deleted`);
            setDeleteConfirmation(null);

        } catch (err) {
            console.error(`Error deleting ${type.toLowerCase()}:`, err);
            setUpdateMessage(`Error deleting ${type.toLowerCase()}: ${err.message}`);
        }
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

    const handleCloseSuggestionModal = () => {
        setEditingSuggestion(null);
    };

    const handleUpdateSuggestion = (updatedSuggestion) => {
        setPosts(posts.map(post =>
            post.uuid === updatedSuggestion.uuid ? { ...post, ...updatedSuggestion } : post
        ));
        setUpdateMessage("Suggestion updated successfully!");
    };

    const getProfileImageUrl = () => {
        if (usingDefaultImage || !profile?.profilePictureUrl) {
            return defaultProfilePic;
        }
        return `${baseApiUrl}${profile.profilePictureUrl}?t=${Date.now()}`;
    };

    const handleNavigateToUserProfile = (uuid) => {
        navigate(`/profile/${uuid}`);
    };

    const getConnectionProfileImageUrl = (connection) => {
        if (!connection?.profilePictureUrl) {
            return defaultProfilePic;
        }
        return `${baseApiUrl}${connection.profilePictureUrl}`;
    };

    const formatDate = (timestamp) =>
        new Date(timestamp).toLocaleDateString();

    const renderTags = (tags) => Array.isArray(tags) && tags.map((tag, i) => (
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
        if (user.uuid !== mentionUuid){
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
                            style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
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
                <ExperienceCard
                    key={postId}
                    user={user}
                    post={post}
                    baseApiUrl={baseApiUrl}
                    username={'Me'}
                    hiddenQuotes={hiddenQuotes}
                    toggleQuote={toggleQuote}
                    showMentions={showMentions}
                    setShowMentions={setShowMentions}
                    renderMentions={renderMentions}
                    renderTags={renderTags}
                    formatDate={formatDate}
                    onDelete={() => confirmDelete(post, 'Experience')}
                    isOwner={true}
                />
            );
        }

        return (
            <SuggestionCard
                key={postId}
                user={user}
                post={post}
                baseApiUrl={baseApiUrl}
                username={'Me'}
                hiddenQuotes={hiddenQuotes}
                toggleQuote={toggleQuote}
                showMentions={showMentions}
                setShowMentions={setShowMentions}
                renderMentions={renderMentions}
                renderTags={renderTags}
                formatDate={formatDate}
                onDelete={() => confirmDelete(post, 'Suggestion')}
                onEdit={() => handleEditSuggestion(post)}
                isOwner={true}
            />
        );
    };

    const renderConnectionList = (connections, connectionType) => {
        if (connections.length === 0) {
            return (
                <div className="no-connections">
                    <p>No {connectionType} found.</p>
                </div>
            );
        }

        return (
            <div className="connections-list">
                {connections.map(connection => (
                    <div
                        key={connection.uuid}
                        className="connection-card"
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
                ))}
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
                <div className="error-icon"> </div>
                <h3>Error Loading Profile</h3>
                <p>{error || "No profile data found"}</p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                    Home
                </button>
            </div>
        );
    }

    return (
        <div className="profile-container">
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

                <div className="profile-bio">
                    <p>{profile.biography}</p>
                </div>
            </div>

            {updateMessage && (
                <div className="alert alert-info animate__animated animate__fadeInDown">
                    {updateMessage}
                    <button
                        onClick={() => setUpdateMessage('')}
                        className="close-alert"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
            )}

            {deleteConfirmation && (
                <div className="modal-backdrop">
                    <div className="delete-confirmation-modal">
                        <h3>Delete {deleteConfirmation.type}</h3>
                        <p>Are you sure you want to delete
                            this {deleteConfirmation.type.toLowerCase()}? This action cannot be
                            undone.</p>
                        <div className="modal-buttons">
                            <button
                                className="btn-secondary"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDeletePost}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingSuggestion && (
                <EditSuggestionModal
                    suggestion={editingSuggestion}
                    onClose={handleCloseSuggestionModal}
                    onUpdate={handleUpdateSuggestion}
                    baseApiUrl={baseApiUrl}
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
                        <select
                            value={postFilter}
                            onChange={(e) => setPostFilter(e.target.value)}
                        >
                            <option value="all">All Posts</option>
                            <option value="suggestions">Suggestions</option>
                            <option value="experiences">Experiences</option>
                        </select>
                    </div>

                    {posts.length === 0 ? (
                        <div className="no-posts">
                            <p>No posts found for this filter.</p>
                        </div>
                    ) : (
                        <div className="posts-grid">
                            {posts.map(renderPost)}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'followers' && (
                <div className="profile-content profile-connections">
                    <h3>People who follow you</h3>
                    {renderConnectionList(followers, 'followers')}
                </div>
            )}

            {activeTab === 'following' && (
                <div className="profile-content profile-connections">
                    <h3>People you follow</h3>
                    {renderConnectionList(following, 'following')}
                </div>
            )}

            {activeTab === 'edit' && (
                <div className="profile-content profile-edit">
                    <div className="edit-section">
                        <h3>Update Biography</h3>
                        <textarea
                            value={newBio}
                            onChange={(e) => setNewBio(e.target.value)}
                            rows="4"
                            placeholder="Write something about yourself..."
                        />
                        <button
                            className="btn-primary"
                            onClick={handleBioUpdate}
                        >
                            Save Biography
                        </button>
                    </div>

                    <div className="edit-section">
                        <h3>Change Profile Picture</h3>
                        <input
                            type="file"
                            id="profile-picture-input"
                            accept="image/jpeg"
                            onChange={handleFileChange}
                        />
                        <button
                            className="btn-primary"
                            onClick={handlePictureUpload}
                        >
                            Upload Picture
                        </button>
                    </div>
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

export default UserProfilePage;