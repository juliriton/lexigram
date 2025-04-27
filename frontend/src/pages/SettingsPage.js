import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SettingsPage.css';
import {FaArrowLeft, FaHome} from "react-icons/fa";

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
                    <h5 className="card-title">Account information</h5>
                    <p><strong>Username:</strong> {oldUsername}</p>
                    <p><strong>Email:</strong> {oldEmail}</p>
                    <p><strong>Privacy:</strong> {oldPrivacy === true ? 'Public' : 'Private'}</p>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Update username</h5>
                    <input
                        type="text"
                        className="form-control mb-2"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter new username"
                    />
                    <button className="btn btn-primary w-100" onClick={updateUsername}>Save
                        Changes
                    </button>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Update email</h5>
                    <input
                        type="email"
                        className="form-control mb-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter new email"
                    />
                    <button className="btn btn-primary w-100" onClick={updateEmail}>Save Changes
                    </button>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Change password</h5>
                    <input
                        type="password"
                        className="form-control mb-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-primary w-100" onClick={updatePassword}>Save
                        Changes
                    </button>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Profile visibility</h5>
                    <p>Current: <strong>{privacy ? 'Public' : 'Private'}</strong></p>
                    <button className="btn btn-secondary w-100" onClick={togglePrivacy}>
                        {privacy ? 'Make Private' : 'Make Public'}
                    </button>
                </div>
            </div>

            <div className="card shadow border-danger mb-4">
                <div className="card-body">
                    <h5 className="card-title text-danger">Delete account</h5>
                    <p className="text-muted">This action is irreversible.</p>
                    <button className="btn btn-danger w-100" onClick={deleteAccount}>Delete my
                        account
                    </button>
                </div>
            </div>

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

export default SettingsPage;
