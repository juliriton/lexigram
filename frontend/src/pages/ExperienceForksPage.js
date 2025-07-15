import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCodeBranch, FaArrowRight } from 'react-icons/fa';
import ExperienceCard from '../components/ExperienceCard';
import Sidebar from '../components/SideBar';
import '../styles/ExperienceForksPage.css';

const ExperienceForksPage = ({ user, setUser }) => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [originalExperience, setOriginalExperience] = useState(null);
    const [allForks, setAllForks] = useState([]);
    const [filteredForks, setFilteredForks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);

    const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const defaultProfilePicture = `${baseApiUrl}/images/default-profile-picture.jpg`;

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleImageError = () => {
        setProfilePicture(defaultProfilePicture);
    };

    useEffect(() => {
        fetchOriginalExperience();
        fetchForks();
    }, [uuid]);

    useEffect(() => {
        if (originalExperience) {
            setFilteredForks(allForks.filter(fork => fork.uuid !== originalExperience.uuid));
        } else {
            setFilteredForks(allForks);
        }
    }, [allForks, originalExperience]);

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

    const fetchOriginalExperience = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/experience/${uuid}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setOriginalExperience(data);
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                setError('Error loading original experience');
            }
        } catch (err) {
            console.error('Error fetching original experience:', err);
            setError('Error loading original experience');
        }
    };

    const fetchForks = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/experience/${uuid}/branches`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setAllForks(data);
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                setError('Error loading forks');
            }
        } catch (err) {
            console.error('Error fetching forks:', err);
            setError('Error loading forks');
        } finally {
            setLoading(false);
        }
    };

    const toggleQuote = (postId) => {
        setHiddenQuotes(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleActionComplete = (updatedExperience) => {
        setAllForks(prevForks =>
            prevForks.map(fork =>
                fork.uuid === updatedExperience.uuid ? updatedExperience : fork
            )
        );
    };

    const getPaginatedForks = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredForks.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredForks.length / itemsPerPage);
    const showPagination = filteredForks.length > itemsPerPage;

    if (loading) {
        return (
            <div className="forks-page">
                <div className="container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading forks...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="forks-page">
                <div className="container">
                    <div className="error-message">
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
        <div className="forks-page">
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

            <div className="container">
                <div className="forks-header">
                    <button
                        onClick={() => navigate(-1)}
                        className="back-button"
                        aria-label="Go back"
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="header-content">
                        <h1>
                            <FaCodeBranch className="branch-icon" />
                            Forks of Experience
                        </h1>
                        <p className="forks-count">
                            {filteredForks.length} fork{filteredForks.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                </div>

                {originalExperience && (
                    <div className="original-experience-section">
                        <h2>Original Experience</h2>
                        <ExperienceCard
                            user={user}
                            post={originalExperience}
                            username={originalExperience.user.username}
                            baseApiUrl={baseApiUrl}
                            hiddenQuotes={hiddenQuotes}
                            toggleQuote={toggleQuote}
                            showMentions={showMentions}
                            setShowMentions={setShowMentions}
                            formatDate={formatDate}
                            disablePopup={true}
                            onActionComplete={handleActionComplete}
                        />
                    </div>
                )}

                <div className="forks-section">
                    <h2>Forks</h2>
                    {filteredForks.length === 0 ? (
                        <div className="no-forks">
                            <FaCodeBranch className="empty-icon" />
                            <p>No forks found for this experience.</p>
                            <p>Be the first to fork it!</p>
                        </div>
                    ) : (
                        <>
                            <div className="forks-grid">
                                {getPaginatedForks().map((fork) => (
                                    <ExperienceCard
                                        key={fork.uuid}
                                        user={user}
                                        post={fork}
                                        username={fork.user.username}
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
                                <div className="pagination-container">
                                    <button
                                        className="pagination-button"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <span className="page-info">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="pagination-button"
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

export default ExperienceForksPage;