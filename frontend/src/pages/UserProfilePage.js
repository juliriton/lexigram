import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserPorfilePage.css';

const UserProfilePage = () => {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState('');
    const [newBio, setNewBio] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [postFilter, setPostFilter] = useState('all');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingDefaultImage, setUsingDefaultImage] = useState(false);
    const [attemptedLoad, setAttemptedLoad] = useState(false);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [activeTab, setActiveTab] = useState('posts');
    const [updateMessage, setUpdateMessage] = useState('');

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
                    url = `${baseApiUrl}/api/auth/me/profile/posts/suggestion`;
                    break;
                case 'experiences':
                    url = `${baseApiUrl}/api/auth/me/profile/posts/experience`;
                    break;
                default:
                    url = `${baseApiUrl}/api/auth/me/profile/posts`;
            }

            try {
                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch posts');
                const data = await res.json();

                const processed = postFilter === 'all'
                    ? [...(data.experiences || []), ...(data.suggestions || [])]
                    : data;

                setPosts(processed);
            } catch (err) {
                console.error("Error fetching posts:", err);
                setPosts([]);
            }
        };
        fetchPosts();
    }, [postFilter]);

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

    const getProfileImageUrl = () => {
        if (usingDefaultImage || !profile?.profilePictureUrl) {
            return defaultProfilePic;
        }
        return `${baseApiUrl}${profile.profilePictureUrl}?t=${Date.now()}`;
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

    const renderMentions = (mentions, postId) => (
        showMentions[postId] && (
            <div className="post-mentions">
                <h6>Mentions:</h6>
                <div className="mentions-list">
                    {mentions.map((mention, i) => (
                        <span key={i} className="mention-badge">@{mention}</span>
                    ))}
                </div>
            </div>
        )
    );

    const isVideo = (url) => {
        return url?.match(/\.(mp4|webm|ogg)$/i);
    };

    const renderPost = (post) => {
        const isExperience = post.type === 'Experience';
        const postId = post.uuid || post.id;
        const isQuoteHidden = hiddenQuotes[postId];
        const mediaUrl = post.style?.backgroundMediaUrl || post.imageUrl;
        const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;

        if (isExperience) {
            return (
                <div key={postId} className="post-card">
                    <div className="post-type">{post.type}</div>

                    {fullMediaUrl && (
                        <div className="post-media">
                            {isVideo(mediaUrl) ? (
                                <video
                                    src={fullMediaUrl}
                                    autoPlay
                                    muted
                                    loop
                                    className="post-video"
                                    style={{
                                        filter: isQuoteHidden ? 'none' : 'brightness(70%)'
                                    }}
                                />
                            ) : (
                                <div
                                    className="post-image"
                                    style={{
                                        backgroundImage: `url(${fullMediaUrl})`,
                                        filter: isQuoteHidden ? 'none' : 'brightness(70%)'
                                    }}
                                />
                            )}

                            {!isQuoteHidden && (
                                <div className="post-quote-overlay">
                                    <div className="post-quote" style={{
                                        fontSize: post.style?.fontSize ? `${post.style.fontSize}px` : 'inherit',
                                        fontFamily: post.style?.fontFamily || 'inherit',
                                        color: post.style?.fontColor || 'inherit'
                                    }}>
                                        "{post.quote || post.title}"
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="post-content">
                        <h3 className="post-title">{post.title}</h3>
                        <p>{post.reflection || post.content}</p>

                        <div className="post-meta">
                            {post.creationDate && (
                                <small className="post-date">{formatDate(post.creationDate)}</small>
                            )}
                        </div>

                        {post.tags?.length > 0 && (
                            <div className="post-tags">{renderTags(post.tags)}</div>
                        )}

                        {post.mentions?.length > 0 && (
                            <button
                                className="btn-link"
                                onClick={() => setShowMentions(prev => ({ ...prev, [postId]: !prev[postId] }))}
                            >
                                {showMentions[postId] ? 'Hide Mentions' : 'Show Mentions'}
                            </button>
                        )}

                        {renderMentions(post.mentions, postId)}
                    </div>

                    {fullMediaUrl && (
                        <button className="btn-toggle-quote" onClick={() => toggleQuote(postId)}>
                            {isQuoteHidden ? 'Show Quote' : 'Hide Quote'}
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div key={postId} className="post-card">
                <div className="post-type">Suggestion</div>
                <div className="post-content">
                    <h5 className="post-subtitle">{post.header || "Tell me about"}</h5>
                    <h3 className="post-title">{post.body}</h3>

                    <div className="post-meta">
                        {post.creationDate && (
                            <small className="post-date">{formatDate(post.creationDate)}</small>
                        )}
                    </div>

                    {post.tags?.length > 0 && (
                        <div className="post-tags">{renderTags(post.tags)}</div>
                    )}
                </div>
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
                    Back to Home
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
                    <p>{profile.biography || 'No biography yet. Add something about yourself!'}</p>
                </div>
            </div>

            {updateMessage && (
                <div className="alert alert-info animate__animated animate__fadeInDown">
                    {updateMessage}
                </div>
            )}

            <div className="profile-nav">
                <button
                    className={`profile-nav-item ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
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

            {activeTab === 'edit' && (
                <div className="profile-content profile-edit">
                    <div className="edit-section">
                        <h3>Update Biography</h3>
                        <textarea
                            value={newBio}
                            placeholder="Write something about yourself..."
                            rows="3"
                            onChange={(e) => setNewBio(e.target.value)}
                        />
                        <button className="btn-primary" onClick={handleBioUpdate}>
                            Save Biography
                        </button>
                    </div>

                    <div className="edit-section">
                        <h3>Update Profile Picture</h3>
                        <div className="file-upload">
                            <label className="file-upload-label">
                                <input
                                    id="profile-picture-input"
                                    type="file"
                                    accept=".jpg"
                                    onChange={handleFileChange}
                                    className="file-input"
                                />
                                <span>Choose File</span>
                            </label>
                            <span className="file-name">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                        </div>
                        <button
                            className="btn-secondary"
                            onClick={handlePictureUpload}
                            disabled={!selectedFile}
                        >
                            Upload Picture
                        </button>
                    </div>
                </div>
            )}

            <div className="profile-footer">
                <button className="btn-outline" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default UserProfilePage;
