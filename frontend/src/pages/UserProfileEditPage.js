import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const UserProfileEditPage = () => {
    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [newBio, setNewBio] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // Cargar el perfil actual
    useEffect(() => {
        fetch(`http://localhost:8080/api/auth/me/profile`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setNewBio(data.biography);
                console.log("Image URL:", data.profilePictureUrl);
            })
            .catch(err => console.error("Error:", err));
    }, [userId]);

    // Actualizar biografia
    const handleBioUpdate = () => {
        fetch(`http://localhost:8080/api/auth/me/profile/edit/biography`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ biography: newBio })
        })
            .then(res => res.text())
            .then(() => {
                alert("Bio updated");
            });
    };

    // Manejar archivo seleccionado
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    // Subir imagen de perfil
    const handlePictureUpload = () => {
        if (!selectedFile) {
            alert("Select a file.");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        fetch(`http://localhost:8080/api/auth/me/profile/edit/profile-picture`, {
            method: 'POST',
            body: formData
        })
            .then(res => res.text())
            .then(relativeUrl => {
                alert("Profile picture updated");
                setProfile(prev => ({
                    ...prev,
                    profilePictureUrl: relativeUrl
                }));
                console.log("New image uploaded:", relativeUrl);
            })
            .catch(err => {
                console.error('Error:', err);
            });
    };

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Edit Profile</h2>

            {profile.profilePictureUrl && (
                <div style={{ marginBottom: '20px' }}>
                    <h4>Current Profile picture:</h4>
                        src={`http://localhost:8080${profile.profilePictureUrl.startsWith('/') ? '' : '/'}${profile.profilePictureUrl}`}
                        alt="Profile picture"
                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => {
                            console.error("Error:", e.target.src);
                            e.target.src = 'https://via.placeholder.com/150';
                        }}
                    />
                </div>
            )}

            <div>
                <label>New Bio:</label><br />
                <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    rows="4"
                    cols="50"
                />
                <br />
                <button onClick={handleBioUpdate}> Save Bio</button>
            </div>

            <br /><br />

            <div>
                <label>New Profile picture: (.jpg):</label><br />
                <input type="file" accept=".jpg" onChange={handleFileChange} />
                <br />
                <button onClick={handlePictureUpload}>Upload</button>
            </div>
        </div>
    );
};

export default UserProfileEditPage;
