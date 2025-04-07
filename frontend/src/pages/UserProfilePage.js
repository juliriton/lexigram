import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingDefaultImage, setUsingDefaultImage] = useState(false);
    const [attemptedLoad, setAttemptedLoad] = useState(false);
    const [newBio, setNewBio] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

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
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8080/api/users/me/profile', {
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Error');
                const profileData = await response.json();
                setProfile(profileData);
                setNewBio(profileData.biography || '');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

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
            await fetch(`http://localhost:8080/api/users/me/profile/edit/biography`, {
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
            await fetch(`http://localhost:8080/api/users/me/profile/edit/profile-picture`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            alert("Profile picture updated");
            // Refresh image
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
        <div className="container mt-4" style={{ maxWidth: '600px' }}>
            <h3>{profile.username}'s Profile</h3>

            <div className="text-center mb-3">
                <img
                    src={getProfileImageUrl()}
                    alt="Profile"
                    className="profile-pic"
                    style={{ maxWidth: '150px', borderRadius: '50%' }}
                    onError={(e) => {
                        setUsingDefaultImage(true);
                        e.target.src = defaultUrl;
                    }}
                />
            </div>

            <p><strong>Biography:</strong> {profile.biography || 'No biography'}</p>

            <hr />

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
                <input type="file" className="form-control" accept=".jpg" onChange={handleFileChange} />
                <button className="btn btn-secondary mt-2" onClick={handlePictureUpload}>
                    Upload Picture
                </button>
            </div>

            <hr />
            <button className="btn btn-outline-secondary mt-3" onClick={() => navigate('/')}>
                Back to Home
            </button>
        </div>
    );
};

export default UserProfilePage;
