import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
    const [privacy, setPrivacy] = useState(null);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [oldEmail, setOldEmail] = useState('');
    const [oldUsername, setOldUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [oldPrivacy, setOldPrivacy] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const resUser = await fetch('http://localhost:8080/api/auth/me', {
                    credentials: 'include',
                });
                const resPrivacy = await fetch('http://localhost:8080/api/auth/me/privacy', {
                    credentials: 'include',
                });

                if (!resUser.ok || !resPrivacy.ok) throw new Error('Error loading data');

                const userData = await resUser.json();
                const privacyData = await resPrivacy.json();

                setOldEmail(userData.email);
                setOldUsername(userData.username);
                setOldPrivacy(privacyData.visibility);

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
        if (username !== oldUsername) {
            try {
                const res = await fetch('http://localhost:8080/api/auth/me/username', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ username }),
                });
                if (!res.ok) throw new Error('Failed');
                setMessage(`Username updated successfully. Old: ${oldUsername}, New: ${username}`);
                setOldUsername(username);
            } catch {
                setMessage('Error updating username.');
            }
        }
    };

    const updateEmail = async () => {
        if (email !== oldEmail) {
            try {
                const res = await fetch('http://localhost:8080/api/auth/me/email', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email }),
                });
                if (!res.ok) throw new Error('Failed');
                setMessage(`Email updated successfully. Old: ${oldEmail}, New: ${email}`);
                setOldEmail(email); // Update old value to the new one
            } catch {
                setMessage('Error updating email.');
            }
        }
    };

    const updatePassword = async () => {
        if (password !== oldPassword) {
            try {
                const res = await fetch('http://localhost:8080/api/auth/me/password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ password }),
                });
                if (!res.ok) throw new Error('Failed');
                setPassword('');
                setMessage('Password updated successfully.');
                setOldPassword(password);
            } catch {
                setMessage('Error updating password.');
            }
        }
    };

    const togglePrivacy = async () => {
        const newPrivacy = !privacy;
        try {
            const res = await fetch('http://localhost:8080/api/auth/me/privacy', {
                method: 'PUT',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setPrivacy(data.visibility);
            setMessage(`Privacy setting updated. Old: ${oldPrivacy ? 'Public' : 'Private'}, New: ${newPrivacy ? 'Public' : 'Private'}`);
            setOldPrivacy(newPrivacy);
        } catch {
            setMessage('Error updating privacy.');
        }
    };

    const deleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

        try {
            const res = await fetch('http://localhost:8080/api/auth/me', {
                method: 'DELETE',
                credentials: 'include',
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
        <div className="settings-page container mt-4">
            <h2 className="mb-4 text-center">Account Settings</h2>

            {message && <div className="alert alert-info">{message}</div>}

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Current Information</h5>
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Privacy:</strong> {privacy === true ? 'Public' : 'Private'}</p>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Update Username</h5>
                    <input
                        type="text"
                        className="form-control mb-2"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button className="btn btn-primary w-100" onClick={updateUsername}>Save Changes</button>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Update Email</h5>
                    <input
                        type="email"
                        className="form-control mb-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="btn btn-primary w-100" onClick={updateEmail}>Save Changes</button>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Change Password</h5>
                    <input
                        type="password"
                        className="form-control mb-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-primary w-100" onClick={updatePassword}>Save Changes</button>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Profile Visibility</h5>
                    <p>Current: <strong>{privacy ? 'Public' : 'Private'}</strong></p>
                    <button className="btn btn-secondary w-100" onClick={togglePrivacy}>
                        {privacy ? 'Make Private' : 'Make Public'}
                    </button>
                </div>
            </div>

            <div className="card shadow border-danger mb-4">
                <div className="card-body">
                    <h5 className="card-title text-danger">Delete Account</h5>
                    <p className="text-muted">This action is irreversible.</p>
                    <button className="btn btn-danger w-100" onClick={deleteAccount}>Delete My Account</button>
                </div>
            </div>

            <div className="text-center">
                <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>
                    <i className="bi bi-house-door"></i> Back to Home
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
