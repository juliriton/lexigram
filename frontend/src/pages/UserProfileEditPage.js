import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const UserProfileEditPage = () => {
    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [newBio, setNewBio] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // Cargar el perfil actual
    useEffect(() => {
        fetch(`http://localhost:8080/api/users/${userId}/profile`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setNewBio(data.biography);
                console.log("URL de imagen:", data.profilePictureUrl);
            })
            .catch(err => console.error("Error cargando perfil:", err));
    }, [userId]);

    // Actualizar biografía
    const handleBioUpdate = () => {
        fetch(`http://localhost:8080/api/users/${userId}/profile/edit/biography`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ biography: newBio })
        })
            .then(res => res.text())
            .then(() => {
                alert("Biografía actualizada");
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
            alert("Por favor selecciona un archivo.");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        fetch(`http://localhost:8080/api/users/${userId}/profile/edit/profile-picture`, {
            method: 'POST',
            body: formData
        })
            .then(res => res.text())
            .then(relativeUrl => {
                alert("Foto de perfil actualizada");
                setProfile(prev => ({
                    ...prev,
                    profilePictureUrl: relativeUrl
                }));
                console.log("Nueva imagen subida:", relativeUrl);
            })
            .catch(err => {
                console.error('Error subiendo imagen:', err);
            });
    };

    if (!profile) {
        return <div>Cargando...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Editar Perfil</h2>

            {/* Imagen actual */}
            {profile.profilePictureUrl && (
                <div style={{ marginBottom: '20px' }}>
                    <h4>Foto actual:</h4>
                    <img
                        src={`http://localhost:8080${profile.profilePictureUrl.startsWith('/') ? '' : '/'}${profile.profilePictureUrl}`}
                        alt="Foto de perfil"
                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => {
                            console.error("Error cargando imagen:", e.target.src);
                            e.target.src = 'https://via.placeholder.com/150';
                        }}
                    />
                </div>
            )}

            {/* Biografía */}
            <div>
                <label>Nueva biografía:</label><br />
                <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    rows="4"
                    cols="50"
                />
                <br />
                <button onClick={handleBioUpdate}>Guardar biografía</button>
            </div>

            <br /><br />

            {/* Subir imagen */}
            <div>
                <label>Foto de perfil (.jpg):</label><br />
                <input type="file" accept=".jpg" onChange={handleFileChange} />
                <br />
                <button onClick={handlePictureUpload}>Subir nueva foto</button>
            </div>
        </div>
    );
};

export default UserProfileEditPage;
