import React, { useState, useEffect } from 'react';
import './App.css'; // Import the styling

const UserCrudApp = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [backendErrors, setBackendErrors] = useState([]);

    // Fetch users from the backend
    useEffect(() => {
        fetch('http://localhost:8080/api/users')
            .then(response => response.json())
            .then(data => setUsers(data));
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission for adding or updating users
    const handleSubmit = (e) => {
        e.preventDefault();
        setBackendErrors([]);

        const requestMethod = isEditing ? 'PUT' : 'POST';
        const requestUrl = isEditing
            ? `http://localhost:8080/api/users/${currentUser.id}`
            : 'http://localhost:8080/api/users';

        const requestData = {
            username: formData.username || undefined,
            email: formData.email || undefined,
            password: formData.password || undefined,
        };

        fetch(requestUrl, {
            method: requestMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(JSON.stringify(errorData));
                    });
                }
                return response.json();
            })
            .then((userData) => {
                // Handle success response
                if (isEditing) {
                    setUsers(users.map(user => (user.id === userData.id ? userData : user)));
                } else {
                    setUsers([...users, userData]);
                }
                setFormData({ username: '', email: '', password: '' });
            })
            .catch((error) => {
                // Parse and set backend errors
                const errorMessages = JSON.parse(error.message);
                setBackendErrors(errorMessages);
            });
    };

    // Edit an existing user
    const handleEdit = (user) => {
        setIsEditing(true);
        setCurrentUser(user);
        setFormData({ username: user.username, email: user.email, password: '' });
        setBackendErrors([]);
    };

    // Delete a user
    const handleDelete = (id) => {
        fetch(`http://localhost:8080/api/users/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                setUsers(users.filter(user => user.id !== id));
            });
    };

    return (
        <div className="app-container">
            <h1>{isEditing ? 'Edit User' : 'Add User'}</h1>

            <form onSubmit={handleSubmit} className="user-form">
                {backendErrors.length > 0 && (
                    <div className="error-message">
                        {backendErrors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}

                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={backendErrors.username ? 'input-error' : ''}
                        placeholder="Enter username"
                    />
                    {backendErrors.username && <p className="error">{backendErrors.username}</p>}
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={backendErrors.email ? 'input-error' : ''}
                        placeholder="Enter email"
                    />
                    {backendErrors.email && <p className="error">{backendErrors.email}</p>}
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={backendErrors.password ? 'input-error' : ''}
                        placeholder="Enter password"
                    />
                    {backendErrors.password && <p className="error">{backendErrors.password}</p>}
                </div>

                <button type="submit" className="submit-button">{isEditing ? 'Update User' : 'Add User'}</button>
            </form>

            <h2>Users List</h2>
            <table className="user-table">
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                            <button onClick={() => handleEdit(user)} className="edit-button">Edit</button>
                            <button onClick={() => handleDelete(user.id)} className="delete-button">Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserCrudApp;
