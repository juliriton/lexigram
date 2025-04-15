import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfilePage.css';

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
    const [activeTab, setActiveTab] = useState('posts'); // New state for tabs

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
                setPosts(data);
            } catch (err) {
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

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <div className="error-icon">⚠️</div>
                <h3>Error Loading Profile</h3>
                <p>{error}</p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-not-found">
                <div className="not-found-icon">🔍</div>
                <h3>Profile Not Found</h3>
                <p>We couldn't find your profile information.</p>
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
                                e.target.src = defaultUrl;
                            }}
                        />
                        <div className="profile-username">{username}</div>
                    </div>
                </div>

                <div className="profile-bio">
                    <p>{profile.biography || 'No biography yet. Add something about yourself!'}</p>
                </div>
            </div>

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
                            {posts.map((post, index) => (
                                <div className="post-card" key={index}>
                                    <div className="post-type">{post.type}</div>
                                    <h3 className="post-title">{post.title}</h3>
                                    <p className="post-content">{post.content}</p>
                                </div>
                            ))}
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
                    <i className="bi bi-house-door"></i> Back to Home
                </button>
            </div>
        </div>
    );
};

export default UserProfilePage;