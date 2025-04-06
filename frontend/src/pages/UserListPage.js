import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const UserListPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    return (
        <div className="container">
            <h2>Users</h2>
            <table className="user-table">
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Profile</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                            <Link to={`/profile/${user.id}`}>
                                <button>View Profile</button>
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserListPage;