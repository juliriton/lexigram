import React, { useState, useEffect } from 'react';
import { FaComment, FaTimes, FaSpinner } from 'react-icons/fa';
import ExperienceCard from './ExperienceCard';
import '../styles/SuggestionReplies.css';

const SuggestionReplies = ({
                               suggestion,
                               baseApiUrl,
                               user,
                               formatDate,
                               onClose
                           }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});

    const toggleQuote = (postId) => {
        setHiddenQuotes(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const fetchReplies = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/replies`, {
                credentials: 'include'
            });

            if (response.ok) {
                const repliesData = await response.json();
                setReplies(repliesData);

                const initialStates = repliesData.reduce((acc, reply) => {
                    acc.hiddenQuotes[reply.uuid] = false;
                    acc.showMentions[reply.uuid] = false;
                    return acc;
                }, { hiddenQuotes: {}, showMentions: {} });

                setHiddenQuotes(initialStates.hiddenQuotes);
                setShowMentions(initialStates.showMentions);
            } else {
                setError('Failed to load replies');
            }
        } catch (err) {
            console.error('Error fetching replies:', err);
            setError('Error loading replies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReplies();
    }, [suggestion.uuid, baseApiUrl]);

    return (
        <div className="replies-modal-overlay">
            <div className="replies-modal">
                <div className="replies-header">
                    <h3>
                        <FaComment className="replies-icon" />
                        Replies to "{suggestion.body?.substring(0, 50)}{suggestion.body?.length > 50 ? '...' : ''}"
                    </h3>
                    <button className="close-replies-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="replies-content">
                    {loading && (
                        <div className="replies-loading">
                            <FaSpinner className="spinner" />
                            <span>Loading replies...</span>
                        </div>
                    )}

                    {error && (
                        <div className="replies-error">
                            <p>{error}</p>
                            <button onClick={fetchReplies} className="retry-btn">
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && replies.length === 0 && (
                        <div className="no-replies">
                            <FaComment className="no-replies-icon" />
                            <p>No replies yet</p>
                            <span>Be the first to share your experience!</span>
                        </div>
                    )}

                    {!loading && !error && replies.length > 0 && (
                        <div className="replies-list">
                            {replies.map((reply) => (
                                <ExperienceCard
                                    key={reply.uuid}
                                    post={{
                                        ...reply,
                                        // Ensure mentions is always an array
                                        mentions: Array.isArray(reply.mentions) ? reply.mentions : [],
                                        user: reply.user || { uuid: '', username: 'Unknown' }
                                    }}
                                    user={user}
                                    username={reply.user?.username || 'Unknown'}
                                    baseApiUrl={baseApiUrl}
                                    formatDate={formatDate}
                                    isOwner={false}
                                    hiddenQuotes={hiddenQuotes}
                                    toggleQuote={toggleQuote}
                                    showMentions={showMentions}
                                    setShowMentions={setShowMentions}
                                    disablePopup={false}
                                    onActionComplete={(updatedExp) => {
                                        setReplies(prev => prev.map(r =>
                                            r.uuid === updatedExp.uuid ? updatedExp : r
                                        ));
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuggestionReplies;