import React, { useState, useEffect } from 'react';
import { FaBookmark } from 'react-icons/fa';
import ExperienceCard from './ExperienceCard';
import SuggestionCard from './SuggestionCard';
import '../styles/SavedContent.css';

const SavedContent = ({ user, baseApiUrl }) => {
    const [savedExperiences, setSavedExperiences] = useState([]);
    const [savedSuggestions, setSavedSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('experiences');
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedContent = async () => {
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
        };

        fetchSavedContent();
    }, [baseApiUrl]);

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

    const handleExperienceActionComplete = (updatedExperience) => {
        setSavedExperiences(prev =>
            prev.map(exp => exp.uuid === updatedExperience.uuid ? updatedExperience : exp)
        );
    };

    const handleSuggestionActionComplete = (updatedSuggestion) => {
        setSavedSuggestions(prev =>
            prev.map(sug => sug.uuid === updatedSuggestion.uuid ? updatedSuggestion : sug)
        );
    };

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

    return (
        <div className="saved-content-container">
            <div className="saved-content-header">
                <h2><FaBookmark /> Saved Content</h2>

                {!noSavedContent && (
                    <div className="saved-content-tabs">
                        <button
                            className={`tab-button ${activeTab === 'experiences' ? 'active' : ''}`}
                            onClick={() => setActiveTab('experiences')}
                        >
                            Experiences ({savedExperiences.length})
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('suggestions')}
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
                <div className="saved-content-list">
                    {activeTab === 'experiences' && savedExperiences.length === 0 && (
                        <div className="no-saved-content">
                            <p>You haven't saved any experiences yet.</p>
                        </div>
                    )}

                    {activeTab === 'experiences' && savedExperiences.map(experience => (
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
                        />
                    ))}

                    {activeTab === 'suggestions' && savedSuggestions.length === 0 && (
                        <div className="no-saved-content">
                            <p>You haven't saved any suggestions yet.</p>
                        </div>
                    )}

                    {activeTab === 'suggestions' && savedSuggestions.map(suggestion => (
                        <SuggestionCard
                            key={suggestion.uuid}
                            user={user}
                            post={suggestion}
                            baseApiUrl={baseApiUrl}
                            username={suggestion.user?.username || 'Unknown'}
                            formatDate={formatDate}
                            onActionComplete={handleSuggestionActionComplete}
                            isOwner={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedContent;