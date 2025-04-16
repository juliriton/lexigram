import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingDefaultImage, setUsingDefaultImage] = useState(false);
    const [attemptedLoad, setAttemptedLoad] = useState(false);
    const [newBio, setNewBio] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [postFilter, setPostFilter] = useState('all');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authResponse = await fetch('http://localhost:8080/api/auth/me', {
                    credentials: 'include',
                });
                if (!authResponse.ok) {
                    navigate('/login');
                    return;
                }
            } catch {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const resUser = await fetch(`http://localhost:8080/api/auth/me`, {
                    credentials: 'include'
                });
                const resProfile = await fetch('http://localhost:8080/api/auth/me/profile', {
                    credentials: 'include',
                });

                if (!resUser.ok || !resProfile.ok) throw new Error('Error loading data');

                const userData = await resUser.json();
                const profileData = await resProfile.json();

                setUsername(userData.username);
                setProfile(profileData);
                setNewBio(profileData.biography || '');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            let url;
            switch (postFilter) {
                case 'suggestions':
                    url = 'http://localhost:8080/api/auth/me/profile/posts/suggestions';
                    break;
                case 'experiences':
                    url = 'http://localhost:8080/api/auth/me/profile/posts/experiences';
                    break;
                default:
                    url = 'http://localhost:8080/api/auth/me/profile/posts';
            }
            try {
                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch posts');
                const data = await res.json();
                console.log('Raw data from API:', data);

                // Process the data based on the endpoint
                let processedPosts = [];
                if (postFilter === 'experiences') {
                    // Direct array of experiences
                    processedPosts = data;
                } else if (postFilter === 'suggestions') {
                    // Direct array of suggestions
                    processedPosts = data;
                } else {
                    // Combined posts from UserPostsDTO
                    const experiences = data.experiences || [];
                    const suggestions = data.suggestions || [];
                    processedPosts = [...experiences, ...suggestions];
                }

                setPosts(processedPosts);
                console.log('Fetched posts:', processedPosts);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setPosts([]);
            }
        };
        fetchPosts();
    }, [postFilter]);

    const testImageExists = async (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    useEffect(() => {
        const checkImage = async () => {
            if (profile?.profilePictureUrl && !attemptedLoad) {
                setAttemptedLoad(true);
                const imageUrl = `http://localhost:8080${profile.profilePictureUrl}`;
                const exists = await testImageExists(imageUrl);
                setUsingDefaultImage(!exists);
            }
        };
        checkImage();
    }, [profile, attemptedLoad]);

    const handleBioUpdate = async () => {
        try {
            await fetch(`http://localhost:8080/api/auth/me/profile/edit/biography`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ biography: newBio })
            });
            alert("Biography updated");
        } catch {
            alert("Error updating biography");
        }
    };

    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

    const handlePictureUpload = async () => {
        if (!selectedFile) return alert("Please select an image.");

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await fetch(`http://localhost:8080/api/auth/me/profile/edit/profile-picture`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            alert("Profile picture updated");
            setUsingDefaultImage(false);
            setAttemptedLoad(false);
        } catch {
            alert("Error uploading picture");
        }
    };

    const defaultUrl = 'http://localhost:8080/images/default-profile-picture.jpg';
    const getProfileImageUrl = () => {
        if (!profile?.profilePictureUrl || usingDefaultImage) {
            return defaultUrl;
        }
        return `http://localhost:8080${profile.profilePictureUrl}?t=${new Date().getTime()}`;
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };

    // Render post based on type
    const renderPost = (post) => {
        console.log("Rendering post:", post);

        if (post.type === 'experience') {
            // For experiences from ExperienceDTO
            return (
                <div key={post.uuid} className="card shadow-sm mb-3">
                    <div className="card-body">
                        <h5 className="card-title">{post.quote}</h5>
                        <p className="card-text">{post.reflection}</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-primary">Experience</span>
                            <small className="text-muted">{formatDate(post.creationDate)}</small>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-2">
                                {/* Map through tag objects */}
                                {Array.isArray(post.tags) ? post.tags.map((tag, i) => (
                                    <span key={i} className="badge bg-secondary me-1">
                                        {typeof tag === 'object' ? tag.name : tag}
                                    </span>
                                )) : null}
                            </div>
                        )}
                        {post.imageUrl && (
                            <img
                                src={`http://localhost:8080${post.imageUrl}`}
                                alt="Post media"
                                className="img-fluid mt-2"
                                style={{maxHeight: '200px'}}
                                onError={(e) => {e.target.style.display = 'none'}}
                            />
                        )}
                    </div>
                </div>
            );
        } else {
            // For suggestions or other post types
            return (
                <div key={post.uuid || post.id} className="card shadow-sm mb-3">
                    <div className="card-body">
                        <h5 className="card-title">{post.title}</h5>
                        <p className="card-text">{post.content}</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-secondary">{post.type || 'post'}</span>
                            {post.creationDate && (
                                <small className="text-muted">{formatDate(post.creationDate)}</small>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    };

    if (loading) {
        return <div className="container mt-4">Loading user profile...</div>;
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger"><strong>Error:</strong> {error}</div>
                <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">User profile not found</div>
                <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4" style={{maxWidth: '600px'}}>
            <h3>{username}'s Profile</h3>

            <div className="text-center mb-3">
                <img
                    src={getProfileImageUrl()}
                    alt="Profile"
                    className="profile-pic"
                    style={{maxWidth: '150px', borderRadius: '50%'}}
                    onError={(e) => {
                        setUsingDefaultImage(true);
                        e.target.src = defaultUrl;
                    }}
                />
            </div>

            <p><strong>Biography:</strong> {profile.biography || 'No biography'}</p>

            <hr/>

            <h5>Edit Profile</h5>

            <div className="form-group">
                <label>New biography:</label>
                <textarea
                    className="form-control"
                    value={newBio}
                    rows="3"
                    onChange={(e) => setNewBio(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={handleBioUpdate}>
                    Save Biography
                </button>
            </div>

            <div className="form-group mt-4">
                <label>New Profile Picture (.jpg only):</label>
                <input type="file" className="form-control" accept=".jpg"
                       onChange={handleFileChange}/>
                <button className="btn btn-secondary mt-2" onClick={handlePictureUpload}>
                    Upload Picture
                </button>
            </div>

            <hr/>
            <h5>User Posts</h5>

            <div className="mt-4">
                <div className="form-group mb-3">
                    <label className="form-label">Filter posts:</label>
                    <select
                        className="form-select"
                        value={postFilter}
                        onChange={(e) => setPostFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="suggestions">Suggestions</option>
                        <option value="experiences">Experiences</option>
                    </select>
                </div>

                {posts.length === 0 ? (
                    <p className="text-muted text-center">No posts found for this filter.</p>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {posts.map((post) => renderPost(post))}
                    </div>
                )}
            </div>
            <hr/>
            <button className="btn btn-outline-secondary mt-3" onClick={() => navigate('/')}>
                Back to Home
            </button>
        </div>
    );
};

export default UserProfilePage;