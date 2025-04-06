import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css';

const UserProfilePage = () => {
    const { userId } = useParams();

    const [username, setUsername] = useState('');
    const [profile, setProfile] = useState(null);
    const [privacy, setPrivacy] = useState(null);

    useEffect(() => {
        // Obtener datos del usuario
        fetch(`http://localhost:8080/api/users/${userId}`)
            .then(res => res.json())
            .then(data => setUsername(data.username));

        fetch(`http://localhost:8080/api/users/${userId}/profile`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
            });

        fetch(`http://localhost:8080/api/users/${userId}/privacy`)
            .then(res => res.json())
            .then(data => setPrivacy(data));
    }, [userId]);

    if (!profile || privacy === null || !username) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="container mt-4" style={{ maxWidth: '500px' }}>
            {/* VER PERFIL */}
            <h3>{username}'s Profile</h3>

            <div className="text-center mb-3">
                <img
                    src={`http://localhost:8080${profile.profilePictureUrl}`}
                    alt="Foto de perfil"
                    style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                    }}
                />
            </div>

            <p><strong>Biografía:</strong> {profile.biography}</p>
            <p><strong>Perfil público:</strong> {privacy.visibility ? 'Sí' : 'No'}</p>

            <Link to={`/profile/${userId}/edit`}>
                <button className="btn btn-sm btn-outline-primary mt-3">Editar perfil</button>
            </Link>
        </div>
    );
};

export default UserProfilePage;
