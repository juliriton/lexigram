import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCodeBranch } from 'react-icons/fa';
import ExperienceCard from '../components/ExperienceCard';
import '../styles/ExperienceForksPage.css';

const ExperienceForksPage = ({ user, setUser }) => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [originalExperience, setOriginalExperience] = useState(null);
    const [forks, setForks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});

    const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetchOriginalExperience();
        fetchForks();
    }, [uuid]);

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
                setForks(Array.from(data));
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
        // Update the fork in the list if it was modified
        setForks(prevForks =>
            prevForks.map(fork =>
                fork.uuid === updatedExperience.uuid ? updatedExperience : fork
            )
        );
    };

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
                            {forks.length} fork{forks.length !== 1 ? 's' : ''} found
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
                    {forks.length === 0 ? (
                        <div className="no-forks">
                            <FaCodeBranch className="empty-icon" />
                            <p>No forks found for this experience.</p>
                            <p>Be the first to fork it!</p>
                        </div>
                    ) : (
                        <div className="forks-grid">
                            {forks.map((fork) => (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExperienceForksPage;