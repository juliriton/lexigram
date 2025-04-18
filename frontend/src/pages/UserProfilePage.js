import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

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
            const base = `${baseApiUrl}/api/auth/me/profile/posts`;
            const url = postFilter === 'all'
                ? base
                : `${base}/${postFilter}`;

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
            const res = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/biography`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ biography: newBio })
            });

            if (!res.ok) throw new Error('Update failed');
            alert("Biography updated");
        } catch (err) {
            console.error("Error updating biography:", err);
            alert("Error updating biography");
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

            alert("Profile picture updated");
            setUsingDefaultImage(false);
            setAttemptedLoad(false);
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
        <span key={i} className="badge bg-secondary me-1">
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
            <div className="mt-2">
                <h6>Mentions:</h6>
                {mentions.map((mention, i) => (
                    <span key={i} className="badge bg-info me-1">{mention}</span>
                ))}
            </div>
        )
    );

    const renderPost = (post) => {
        const isExperience = post.type === 'Experience';
        const postId = post.uuid || post.id;
        const isQuoteHidden = hiddenQuotes[postId];

        if (isExperience) {
            return (
                <div key={postId} className="card shadow-sm mb-4" style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundImage: `url(${baseApiUrl}${post.style?.backgroundMediaUrl || post.imageUrl})`,
                                filter: isQuoteHidden ? 'none' : 'brightness(70%)'
                            }}
                        />
                        {!isQuoteHidden && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '2rem'
                                }}
                            >
                                <div
                                    style={{
                                        padding: '1rem',
                                        borderRadius: post.style?.borderRadius || '10px',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        maxWidth: '80%',
                                        textAlign: 'center'
                                    }}
                                >
                                    <h4
                                        style={{
                                            color: post.style?.fontColor || '#ffffff',
                                            fontSize: post.style?.fontSize || '1.5rem',
                                            fontFamily: post.style?.fontFamily || 'inherit',
                                            fontWeight: 'bold',
                                            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                                            margin: 0
                                        }}
                                    >
                                        "{post.quote || post.title}"
                                    </h4>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="card-body bg-white">
                        <p className="card-text">{post.reflection || post.content}</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-primary">{post.type}</span>
                            {post.creationDate && (
                                <small className="text-muted">{formatDate(post.creationDate)}</small>
                            )}
                        </div>
                        {post.tags?.length > 0 && (
                            <div className="mt-2">{renderTags(post.tags)}</div>
                        )}
                        {post.mentions?.length > 0 && (
                            <button
                                className="btn btn-link mt-2"
                                onClick={() => setShowMentions(prev => ({ ...prev, [postId]: !prev[postId] }))}
                            >
                                {showMentions[postId] ? 'Hide Mentions' : 'Show Mentions'}
                            </button>
                        )}
                        {renderMentions(post.mentions, postId)}
                    </div>

                    <button className="btn btn-link" onClick={() => toggleQuote(postId)}>
                        {isQuoteHidden ? 'Show Quote' : 'Hide Quote'}
                    </button>
                </div>
            );
        }

        return (
            <div key={postId} className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title text-muted small">{post.header || "Tell me about"}</h5>
                    <p className="card-text fw-bold fs-5">{post.body}</p>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-primary">Suggestion</span>
                        {post.creationDate && (
                            <small className="text-muted">{formatDate(post.creationDate)}</small>
                        )}
                    </div>
                    {post.tags?.length > 0 && (
                        <div className="mt-2">{renderTags(post.tags)}</div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) return <div className="container mt-4">Loading user profile...</div>;

    if (error || !profile) {
        return (
            <div className="container mt-4">
                <div className={`alert alert-${error ? 'danger' : 'warning'}`}>
                    <strong>{error ? 'Error:' : 'Notice:'}</strong> {error || 'User profile not found'}
                </div>
                <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className="container mt-4" style={{ maxWidth: '600px' }}>
            <h3>{username}'s Profile</h3>

            <div className="text-center mb-3">
                <img
                    src={getProfileImageUrl()}
                    alt="Profile"
                    className="profile-pic"
                    style={{ maxWidth: '150px', borderRadius: '50%' }}
                    onError={(e) => { setUsingDefaultImage(true); e.target.src = defaultProfilePic; }}
                />
            </div>

            <p><strong>Biography:</strong> {profile.biography || 'No biography'}</p>

            <hr />
            <h5>Edit Profile</h5>

            <div className="form-group mb-2">
                <label>New biography:</label>
                <textarea
                    className="form-control"
                    value={newBio}
                    rows="3"
                    onChange={(e) => setNewBio(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={handleBioUpdate}>Update Biography</button>
            </div>

            <div className="form-group mt-3">
                <label>Change profile picture:</label>
                <input type="file" className="form-control" onChange={handleFileChange} />
                <button className="btn btn-secondary mt-2" onClick={handlePictureUpload}>Upload Picture</button>
            </div>

            <hr />
            <h5>Your Posts</h5>
            <div className="btn-group mb-3">
                <button className={`btn btn-outline-primary ${postFilter === 'all' ? 'active' : ''}`} onClick={() => setPostFilter('all')}>All</button>
                <button className={`btn btn-outline-primary ${postFilter === 'experiences' ? 'active' : ''}`} onClick={() => setPostFilter('experiences')}>Experiences</button>
                <button className={`btn btn-outline-primary ${postFilter === 'suggestions' ? 'active' : ''}`} onClick={() => setPostFilter('suggestions')}>Suggestions</button>
            </div>

            {posts.length > 0 ? posts.map(renderPost) : (<p>No posts found for this filter.</p>)}
        </div>
    );
};

export default UserProfilePage;
