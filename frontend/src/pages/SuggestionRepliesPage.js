import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaComment, FaArrowRight } from 'react-icons/fa';
import SuggestionCard from '../components/SuggestionCard';
import ExperienceCard from '../components/ExperienceCard';
import Sidebar from '../components/SideBar';
import '../styles/SuggestionRepliesPage.css';

const SuggestionRepliesPage = ({ user, setUser }) => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [originalSuggestion, setOriginalSuggestion] = useState(null);
    const [allReplies, setAllReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);

    const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const defaultProfilePicture = `${baseApiUrl}/images/default-profile-picture.jpg`;

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleImageError = () => {
        setProfilePicture(defaultProfilePicture);
    };

    useEffect(() => {
        fetchOriginalSuggestion();
        fetchReplies();
    }, [uuid]);

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const res = await fetch(`${baseApiUrl}/api/auth/me/profile`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfilePicture(
                        data.profilePictureUrl
                            ? `${baseApiUrl}${data.profilePictureUrl}`
                            : defaultProfilePicture
                    );
                }
            } catch (err) {
                console.error('Error fetching profile picture:', err);
                setProfilePicture(defaultProfilePicture);
            }
        };

        if (user) {
            fetchProfilePicture();
        }
    }, [user, baseApiUrl, defaultProfilePicture]);

    const fetchOriginalSuggestion = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/suggestion/${uuid}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setOriginalSuggestion(data);
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                setError('Error loading original suggestion');
            }
        } catch (err) {
            console.error('Error fetching original suggestion:', err);
            setError('Error loading original suggestion');
        }
    };

    const fetchReplies = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/suggestion/${uuid}/replies`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setAllReplies(data);
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                setError('Error loading replies');
            }
        } catch (err) {
            console.error('Error fetching replies:', err);
            setError('Error loading replies');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const toggleQuote = (postId) => {
        setHiddenQuotes(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleActionComplete = (updatedPost) => {
        if (updatedPost.uuid === originalSuggestion?.uuid) {
            setOriginalSuggestion(updatedPost);
        } else {
            setAllReplies(prevReplies =>
                prevReplies.map(reply =>
                    reply.uuid === updatedPost.uuid ? updatedPost : reply
                )
            );
        }
    };

    const getPaginatedReplies = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allReplies.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(allReplies.length / itemsPerPage);
    const showPagination = allReplies.length > itemsPerPage;

    if (loading) {
        return (
            <div className="suggestion-replies-page">
                <div className="suggestion-container">
                    <div className="suggestion-loading-spinner">
                        <div className="suggestion-spinner"></div>
                        <p>Loading replies...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="suggestion-replies-page">
                <div className="suggestion-container">
                    <div className="suggestion-error-message">
                        <p>{error}</p>
                        <button onClick={() => navigate(-1)} className="btn btn-primary">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="suggestion-replies-page">
            <label className="burger" htmlFor="burger">
                <input
                    type="checkbox"
                    id="burger"
                    checked={sidebarOpen}
                    onChange={toggleSidebar}
                />
                <span></span><span></span><span></span>
            </label>

            <Sidebar
                user={user}
                setUser={setUser}
                profilePicture={profilePicture}
                handleImageError={handleImageError}
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                baseApiUrl={baseApiUrl}
                defaultProfilePicture={defaultProfilePicture}
            />

            <div className="suggestion-container">
                <div className="suggestion-replies-header">
                    <button
                        onClick={() => navigate(-1)}
                        className="suggestion-back-button"
                        aria-label="Go back"
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="suggestion-header-content">
                        <h1>
                            <FaComment className="suggestion-comment-icon" />
                            Replies to Suggestion
                        </h1>
                        <p className="suggestion-replies-count">
                            {allReplies.length} repl{allReplies.length !== 1 ? 'ies' : 'y'} found
                        </p>
                    </div>
                </div>

                {originalSuggestion && (
                    <div className="suggestion-original-section">
                        <h2>Original Suggestion</h2>
                        <SuggestionCard
                            user={user}
                            post={originalSuggestion}
                            username={originalSuggestion.user.username}
                            baseApiUrl={baseApiUrl}
                            formatDate={formatDate}
                            onActionComplete={handleActionComplete}
                        />
                    </div>
                )}

                <div className="suggestion-replies-section">
                    <h2>Replies</h2>
                    {allReplies.length === 0 ? (
                        <div className="suggestion-no-replies">
                            <FaComment className="suggestion-empty-icon" />
                            <p>No replies found for this suggestion.</p>
                            <p>Be the first to reply!</p>
                        </div>
                    ) : (
                        <>
                            <div className="suggestion-replies-grid">
                                {getPaginatedReplies().map((reply) => (
                                    <ExperienceCard
                                        key={reply.uuid}
                                        user={user}
                                        post={reply}
                                        username={reply.user.username}
                                        baseApiUrl={baseApiUrl}
                                        hiddenQuotes={hiddenQuotes}
                                        toggleQuote={toggleQuote}
                                        showMentions={showMentions}
                                        setShowMentions={setShowMentions}
                                        formatDate={formatDate}
                                        disablePopup={true}
                                        onActionComplete={handleActionComplete}
                                    />
                                ))}
                            </div>
                            {showPagination && (
                                <div className="suggestion-pagination-container">
                                    <button
                                        className="suggestion-pagination-button"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <span className="suggestion-page-info">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="suggestion-pagination-button"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage >= totalPages}
                                    >
                                        <FaArrowRight />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuggestionRepliesPage;