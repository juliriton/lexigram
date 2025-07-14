import React, { useState, useEffect, useCallback } from 'react';
import { FaBookmark, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import ExperienceCard from './ExperienceCard';
import SuggestionCard from './SuggestionCard';
import '../styles/SavedContent.css';

const SavedContent = ({ user, baseApiUrl, currentPage, itemsPerPage, onPageChange, onContentUnsaved }) => {
    const [savedExperiences, setSavedExperiences] = useState([]);
    const [savedSuggestions, setSavedSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('experiences');
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [error, setError] = useState(null);

    const fetchSavedContent = useCallback(async () => {
        try {
            setLoading(true);
            const [experiencesRes, suggestionsRes] = await Promise.all([
                fetch(`${baseApiUrl}/api/auth/me/profile/saved/experiences`, {
                    credentials: 'include',
                }),
                fetch(`${baseApiUrl}/api/auth/me/profile/saved/suggestions`, {
                    credentials: 'include',
                })
            ]);

            if (!experiencesRes.ok || !suggestionsRes.ok) {
                throw new Error('Failed to fetch saved content');
            }

            const experiences = await experiencesRes.json();
            const suggestions = await suggestionsRes.json();

            setSavedExperiences(experiences);
            setSavedSuggestions(suggestions);
        } catch (err) {
            console.error('Error fetching saved content:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [baseApiUrl]);

    useEffect(() => {
        fetchSavedContent();
    }, [fetchSavedContent]);

    const toggleQuote = (postId) => {
        setHiddenQuotes(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString();

    const renderTags = (tags) => {
        if (!Array.isArray(tags)) return null;
        return tags.map((tag, i) => (
            <span key={i} className="tag-badge">
                #{typeof tag === 'object' ? tag.name : tag}
            </span>
        ));
    };

    const handleExperienceActionComplete = useCallback((updatedExperience) => {
        // Immediately remove from saved list if unsaved
        setSavedExperiences(prev =>
            prev.filter(exp => exp.uuid !== updatedExperience.uuid)
        );

        // Call parent callback to update the main posts array
        if (onContentUnsaved) {
            onContentUnsaved(updatedExperience, 'experience');
        }
    }, [onContentUnsaved]);

    // Update the handleSuggestionActionComplete function
    const handleSuggestionActionComplete = useCallback((updatedSuggestion) => {
        // Immediately remove from saved list if unsaved
        setSavedSuggestions(prev =>
            prev.filter(sug => sug.uuid !== updatedSuggestion.uuid)
        );

        // Call parent callback to update the main posts array
        if (onContentUnsaved) {
            onContentUnsaved(updatedSuggestion, 'suggestion');
        }
    }, [onContentUnsaved]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        onPageChange(1);
    };

    const getPaginatedItems = (items) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    const getTotalPages = (items) => Math.ceil(items.length / itemsPerPage);

    if (loading) {
        return (
            <div className="saved-content-loading">
                <div className="spinner"></div>
                <p>Loading saved content...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="saved-content-error">
                <p>Error loading saved content: {error}</p>
            </div>
        );
    }

    const noSavedContent = savedExperiences.length === 0 && savedSuggestions.length === 0;
    const currentItems = activeTab === 'experiences' ? savedExperiences : savedSuggestions;
    const paginatedItems = getPaginatedItems(currentItems);
    const totalPages = getTotalPages(currentItems);

    return (
        <div className="saved-content-container">
            <div className="saved-content-header">
                <h2><FaBookmark /> Saved Content</h2>

                {!noSavedContent && (
                    <div className="saved-content-tabs">
                        <button
                            className={`tab-button ${activeTab === 'experiences' ? 'active' : ''}`}
                            onClick={() => handleTabChange('experiences')}
                        >
                            Experiences ({savedExperiences.length})
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
                            onClick={() => handleTabChange('suggestions')}
                        >
                            Suggestions ({savedSuggestions.length})
                        </button>
                    </div>
                )}
            </div>

            {noSavedContent ? (
                <div className="no-saved-content">
                    <p>You haven't saved any content yet.</p>
                    <p>When you save experiences or suggestions, they'll appear here.</p>
                </div>
            ) : (
                <>
                    <div className="saved-content-list">
                        {activeTab === 'experiences' && savedExperiences.length === 0 && (
                            <div className="no-saved-content">
                                <p>You haven't saved any experiences yet.</p>
                            </div>
                        )}

                        {activeTab === 'experiences' && paginatedItems.map(experience => (
                            <ExperienceCard
                                key={experience.uuid}
                                user={user}
                                post={experience}
                                baseApiUrl={baseApiUrl}
                                username={experience.user?.username || 'Unknown'}
                                hiddenQuotes={hiddenQuotes}
                                toggleQuote={toggleQuote}
                                showMentions={showMentions}
                                setShowMentions={setShowMentions}
                                formatDate={formatDate}
                                renderTags={renderTags}
                                onActionComplete={handleExperienceActionComplete}
                                isOwner={false}
                                isSavedView={true}  // Add this prop
                            />
                        ))}

                        {activeTab === 'suggestions' && savedSuggestions.length === 0 && (
                            <div className="no-saved-content">
                                <p>You haven't saved any suggestions yet.</p>
                            </div>
                        )}

                        {activeTab === 'suggestions' && paginatedItems.map(suggestion => (
                            <SuggestionCard
                                key={suggestion.uuid}
                                user={user}
                                post={suggestion}
                                baseApiUrl={baseApiUrl}
                                username={suggestion.user?.username || 'Unknown'}
                                formatDate={formatDate}
                                onActionComplete={handleSuggestionActionComplete}
                                isOwner={false}
                                isSavedView={true}  // Add this prop
                            />
                        ))}
                    </div>

                    {currentItems.length > itemsPerPage && (
                        <div className="saved-content-pagination">
                            <button
                                className="pagination-button"
                                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <FaArrowLeft />
                            </button>
                            <span className="page-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="pagination-button"
                                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage >= totalPages}
                            >
                                <FaArrowRight />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SavedContent;