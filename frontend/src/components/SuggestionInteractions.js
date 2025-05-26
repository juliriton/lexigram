import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaReply, FaShare } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/SuggestionInteractions.css';

const SuggestionInteractions = ({
                                    user,
                                    suggestion,
                                    baseApiUrl,
                                    onActionComplete
                                }) => {
    const navigate = useNavigate();
    const [isResonated, setIsResonated] = useState(
        user && suggestion.resonatedBy && suggestion.resonatedBy.includes(user.uuid)
    );
    const [isSaved, setIsSaved] = useState(
        user && suggestion.savedBy && suggestion.savedBy.includes(user.uuid)
    );
    const [resonateCount, setResonateCount] = useState(suggestion.resonatesAmount || 0);
    const [saveCount, setSaveCount] = useState(suggestion.savesAmount || 0);
    const [replyCount, setReplyCount] = useState(suggestion.replyAmount || 0);
    const [isLoading, setIsLoading] = useState(false);

    const handleResonate = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/${isResonated ? 'un-resonate' : 'resonate'}`;
            const method = isResonated ? 'DELETE' : 'POST';

            const response = await fetch(endpoint, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const updatedSuggestion = await response.json();
                setIsResonated(!isResonated);
                setResonateCount(isResonated ? resonateCount - 1 : resonateCount + 1);
                if (onActionComplete) onActionComplete(updatedSuggestion);
            } else {
                console.error("Error with resonate action:", await response.text());
            }
        } catch (error) {
            console.error("Error toggling resonate:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/${isSaved ? 'un-save' : 'save'}`;
            const method = isSaved ? 'DELETE' : 'POST';

            const response = await fetch(endpoint, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const updatedSuggestion = await response.json();
                setIsSaved(!isSaved);
                setSaveCount(isSaved ? saveCount - 1 : saveCount + 1);
                if (onActionComplete) onActionComplete(updatedSuggestion);
            } else {
                console.error("Error with save action:", await response.text());
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        sessionStorage.setItem('replyToSuggestion', suggestion.uuid);
        navigate('/post/create');
    };

    const handleShare = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/share`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const shareLink = await response.text();
                await navigator.clipboard.writeText(shareLink);
                alert('Link copied to clipboard!');
            } else {
                console.error("Error getting share link:", await response.text());
            }
        } catch (error) {
            console.error("Error sharing suggestion:", error);
        }
    };

    return (
        <div className="suggestion-interactions">
            <div className="interaction-btn-group">
                <button
                    className={`interaction-btn ${isResonated ? 'active' : ''}`}
                    onClick={handleResonate}
                    disabled={isLoading}
                    aria-label={isResonated ? "Un-resonate" : "Resonate"}
                >
                    {isResonated ? <FaHeart /> : <FaRegHeart />}
                    <span className="interaction-count">{resonateCount}</span>
                </button>

                <button
                    className={`interaction-btn ${isSaved ? 'active' : ''}`}
                    onClick={handleSave}
                    disabled={isLoading}
                    aria-label={isSaved ? "Un-save" : "Save"}
                >
                    {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    <span className="interaction-count">{saveCount}</span>
                </button>

                <button
                    className="interaction-btn"
                    onClick={handleReply}
                    disabled={isLoading}
                    aria-label="Reply"
                >
                    <FaReply />
                    <span className="interaction-count">{replyCount}</span>
                </button>

                <button
                    className="interaction-btn"
                    onClick={handleShare}
                    disabled={isLoading}
                    aria-label="Share"
                >
                    <FaShare />
                </button>
            </div>
        </div>
    );
};

export default SuggestionInteractions;