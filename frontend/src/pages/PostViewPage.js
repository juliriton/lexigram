import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './HomePage';
import PostPopupModal from '../components/PostPopUpModal';
import { API_URL } from '../Api.js';

const PostViewPage = ({ user, setUser, requireAuth = true }) => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPostModal, setShowPostModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [postData, setPostData] = useState(null);

    // Get UUID from either URL params or query params
    const getPostUuid = () => {
        // First try to get from URL params (e.g., /suggestion/uuid)
        if (uuid) {
            return uuid;
        }

        // Then try query params (e.g., /?suggestion=uuid or /?experience=uuid)
        const urlParams = new URLSearchParams(location.search);
        return urlParams.get('suggestion') || urlParams.get('experience');
    };

    // Determine post type based on the current route or query parameters
    const getPostType = () => {
        // First check URL path
        if (location.pathname.includes('/suggestion/')) {
            return 'suggestion';
        } else if (location.pathname.includes('/experience/')) {
            return 'experience';
        }

        // Then check query parameters
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.has('suggestion')) {
            return 'suggestion';
        } else if (urlParams.has('experience')) {
            return 'experience';
        }

        // Default fallback
        return 'experience';
    };

    const currentUuid = getPostUuid();

    // Add debugging
    useEffect(() => {
        console.log('PostViewPage mounted with:', {
            uuid,
            currentUuid,
            postType: getPostType(),
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            user: user?.id || 'not logged in'
        });
    }, [uuid, location, user]);

    // Check if user has access to view the post
    const checkPostAccess = async () => {
        try {
            console.log('Checking post access for UUID:', currentUuid);
            const postType = getPostType();

            // First try public endpoint
            let endpoint = `${API_URL}/api/public/${postType}/${currentUuid}`;
            let response = await fetch(endpoint, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Handle public endpoint response
            if (response.ok) {
                const data = await response.json();
                console.log('Post data retrieved from public endpoint:', data);
                setPostData(data);
                return { hasAccess: true, postData: data };
            } else if (response.status === 403) {
                // Private post - get user info for redirect
                const errorData = await response.json();
                console.log('Private post detected:', errorData);
                if (errorData.private && errorData.userId) {
                    // Redirect to profile page to show it's private
                    navigate(`/profile/${errorData.userId}`, { replace: true });
                    return { hasAccess: false, isPrivate: true };
                }
            }

            // If public access fails and user is logged in, try authenticated endpoint
            if (!response.ok && user) {
                endpoint = `${API_URL}/api/auth/me/${postType}/${currentUuid}`;
                response = await fetch(endpoint, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Post data retrieved from authenticated endpoint:', data);
                    setPostData(data);
                    return { hasAccess: true, postData: data };
                } else if (response.status === 403) {
                    // Still private even with auth - user doesn't have access
                    // Try to get user info from the response
                    try {
                        const errorData = await response.json();
                        if (errorData.private && errorData.userId) {
                            navigate(`/profile/${errorData.userId}`, { replace: true });
                            return { hasAccess: false, isPrivate: true };
                        }
                    } catch (e) {
                        console.log('Could not parse error response');
                    }

                    // If we can't get user info, redirect to home
                    navigate('/', { replace: true });
                    return { hasAccess: false };
                }
            }

            // Handle 404 or other errors
            if (response.status === 404) {
                console.log('Post not found');
                navigate('/', { replace: true });
                return { hasAccess: false };
            } else {
                console.log('Error fetching post:', response.status);
                navigate('/', { replace: true });
                return { hasAccess: false };
            }
        } catch (error) {
            console.error('Error checking post access:', error);
            navigate('/', { replace: true });
            return { hasAccess: false };
        }
    };

    useEffect(() => {
        const initializeAccess = async () => {
            if (!currentUuid) {
                navigate('/', { replace: true });
                return;
            }

            setIsLoading(true);
            const { hasAccess, postData, isPrivate } = await checkPostAccess();

            if (hasAccess) {
                setShowPostModal(true);
                setAccessDenied(false);
            } else {
                setAccessDenied(true);
                // The redirection is already handled in checkPostAccess
            }
            setIsLoading(false);
        };

        initializeAccess();
    }, [currentUuid, navigate, location, user]);

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
    if (!currentUuid) {
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

    // If access is denied, this component will redirect to profile or home
    // so we don't need to render anything here
    if (accessDenied) {
        return (
            <div className="container">
                <div className="spinner"></div>
                <p>Redirecting...</p>
            </div>
        );
    }

    return (
        <>
            {/* Render the home page in the background */}
            <HomePage user={user} setUser={setUser} />

            {/* Show the post popup modal only if access is granted */}
            {showPostModal && (
                <PostPopupModal
                    isOpen={showPostModal}
                    onClose={handleCloseModal}
                    postUuid={currentUuid}
                    type={getPostType()}
                    user={user}
                    baseApiUrl={API_URL}
                    formatDate={formatDate}
                    enableFallback={true}
                />
            )}
        </>
    );
};

export default PostViewPage;