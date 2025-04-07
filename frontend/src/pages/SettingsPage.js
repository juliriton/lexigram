import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← for navigation

const SettingsPage = () => {
    const [privacy, setPrivacy] = useState(null);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const navigate = useNavigate(); // ← Hook for navigation

    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const resUser = await fetch(`http://localhost:8080/api/users/me`, {
                    credentials: 'include'
                });
                const resPrivacy = await fetch(`http://localhost:8080/api/users/me/privacy`, {
                    credentials: 'include'
                });

                if (!resUser.ok || !resPrivacy.ok) throw new Error('Error loading data');

                const userData = await resUser.json();
                const privacyData = await resPrivacy.json();

                setEmail(userData.email);
                setUsername(userData.username);
                setPrivacy(privacyData.visibility);
            } catch (err) {
                console.error(err);
                setMessage('Error loading settings.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserSettings();
    }, []);

    const updateUsername = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/users/me/username', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username }),
            });
            if (!res.ok) throw new Error('Failed');
            setMessage('Username updated successfully.');
        } catch {
            setMessage('Error updating username.');
        }
    };

    const updateEmail = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/users/me/email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error('Failed');
            setMessage('Email updated successfully.');
        } catch {
            setMessage('Error updating email.');
        }
    };

    const updatePassword = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/users/me/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password }),
            });
            if (!res.ok) throw new Error('Failed');
            setPassword('');
            setMessage('Password updated successfully.');
        } catch {
            setMessage('Error updating password.');
        }
    };

    const togglePrivacy = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/users/me/privacy', {
                method: 'PUT',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setPrivacy(data.visibility);
            setMessage('Privacy setting updated.');
        } catch {
            setMessage('Error updating privacy.');
        }
    };

    const deleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

        try {
            const res = await fetch('http://localhost:8080/api/users/me', {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed');

            setMessage('Account deleted. Redirecting...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch {
            setMessage('Error deleting account.');
        }
    };

    if (loading) return <div className="container mt-4">Loading settings...</div>;

    return (
        <div className="container mt-4" style={{ maxWidth: '500px' }}>
            <h3>Account Settings</h3>

            <button className="btn btn-outline-secondary mt-2 mb-4" onClick={() => navigate('/')}>
                ← Back to Home
            </button>

            {message && <div className="alert alert-info mt-2">{message}</div>}

            {/* Display current data summary */}
            <div className="card mb-4 p-3">
                <h5>Current Info</h5>
                <p><strong>Username:</strong> {username}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Privacy:</strong> {privacy === true ? 'Public' : 'Private'}</p>
            </div>

            {/* Update Username */}
            <div className="form-group mt-3">
                <label>New Username</label>
                <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={updateUsername}>
                    Update Username
                </button>
            </div>

            {/* Update Email */}
            <div className="form-group mt-4">
                <label>New Email</label>
                <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={updateEmail}>
                    Update Email
                </button>
            </div>

            {/* Update Password */}
            <div className="form-group mt-4">
                <label>New Password</label>
                <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={updatePassword}>
                    Update Password
                </button>
            </div>

            {/* Toggle Privacy */}
            <div className="form-group mt-4">
                <label>
                    <strong>Profile Visibility:</strong>{' '}
                    {privacy === true ? 'Public' : privacy === false ? 'Private' : 'Unknown'}
                </label>
                <button className="btn btn-secondary d-block mt-2" onClick={togglePrivacy}>
                    {privacy ? 'Make Private' : 'Make Public'}
                </button>
            </div>

            {/* Delete account */}
            <div className="form-group mt-5">
                <hr/>
                <button className="btn btn-danger" onClick={deleteAccount}>
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;