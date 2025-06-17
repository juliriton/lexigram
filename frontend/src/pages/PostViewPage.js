import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import PostPopupModal from '../components/PostPopUpModal';

const PostViewPage = ({ user, setUser }) => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [showPostModal, setShowPostModal] = useState(false);

    useEffect(() => {
        // Show the modal when component mounts
        if (uuid) {
            setShowPostModal(true);
        }
    }, [uuid]);

    const handleCloseModal = () => {
        setShowPostModal(false);
        // Navigate back to home page after closing modal
        navigate('/', { replace: true });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <>
            {/* Render the home page in the background */}
            <HomePage user={user} setUser={setUser} />

            {/* Show the post popup modal */}
            <PostPopupModal
                isOpen={showPostModal}
                onClose={handleCloseModal}
                postUuid={uuid}
                user={user}
                baseApiUrl="http://localhost:8080"
                formatDate={formatDate}
            />
        </>
    );
};

export default PostViewPage;