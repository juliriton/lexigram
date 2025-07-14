import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './HomePage';
import PostPopupModal from '../components/PostPopUpModal';
import { API_URL } from '../Api.js';

const PostViewPage = ({ user, setUser }) => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPostModal, setShowPostModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Add debugging
    useEffect(() => {
        console.log('PostViewPage mounted with:', {
            uuid,
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            user: user?.id || 'not logged in'
        });
    }, [uuid, location, user]);

    // Determine post type based on the current route
    const getPostType = () => {
        if (location.pathname.includes('/suggestion/')) {
            return 'Suggestion';
        } else if (location.pathname.includes('/experience/')) {
            return 'Experience';
        }
        // Default fallback
        return 'Experience';
    };

    useEffect(() => {
        // Show the modal when component mounts, regardless of authentication status
        if (uuid) {
            console.log('Setting showPostModal to true for UUID:', uuid);
            setShowPostModal(true);
            setIsLoading(false);
        } else {
            console.log('No UUID found, redirecting to home');
            navigate('/', { replace: true });
        }
    }, [uuid, navigate]);

    const handleCloseModal = () => {
        console.log('Closing modal and navigating to home');
        setShowPostModal(false);
        // Navigate back to home page after closing modal
        navigate('/', { replace: true });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };

    // Add a fallback if uuid is missing
    if (!uuid) {
        console.log('No UUID provided, redirecting to home');
        navigate('/', { replace: true });
        return null;
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="container">
                <div className="spinner"></div>
                <p>Loading post...</p>
            </div>
        );
    }

    return (
        <>
            {/* Render the home page in the background */}
            <HomePage user={user} setUser={setUser} />

            {/* Show the post popup modal - this should work even without authentication */}
            <PostPopupModal
                isOpen={showPostModal}
                onClose={handleCloseModal}
                postUuid={uuid}
                type={getPostType()}
                user={user}
                baseApiUrl={API_URL}
                formatDate={formatDate}
                enableFallback={true}
            />
        </>
    );
};

export default PostViewPage;