import React, { useState, useEffect } from 'react';
import { FaBookmark, FaRegBookmark, FaReply, FaShare, FaHeart, FaRegHeart } from 'react-icons/fa';
import '../styles/SuggestionInteractions.css';

const SuggestionInteractions = ({ user, suggestion, baseApiUrl, onActionComplete }) => {
    const [interactions, setInteractions] = useState({
        saved: false,
        saveAmount: 0,
        resonated: false,
        resonatesAmount: 0,
        replyAmount: 0
    });

    const [processingAction, setProcessingAction] = useState(false);

    const checkUserInteraction = (userSet, userUuid) => {
        return userSet && userUuid ? userSet.includes(userUuid) : false;
    };

    useEffect(() => {
        const userUuid = user?.uuid;

        setInteractions({
            saved: checkUserInteraction(suggestion.savedBy, userUuid),
            saveAmount: suggestion.savesAmount || 0,
            resonated: checkUserInteraction(suggestion.resonatedBy, userUuid),
            resonatesAmount: suggestion.resonatesAmount || 0,
            replyAmount: suggestion.replyAmount || 0
        });
    }, [suggestion, user]);

    const handleSaveToggle = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        if (processingAction) return;

        setProcessingAction(true);

        const currentlySaved = interactions.saved;

        try {
            const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/${currentlySaved ? 'un-save' : 'save'}`;
            const method = currentlySaved ? 'DELETE' : 'POST';

            console.log(`Attempting to ${currentlySaved ? 'un-save' : 'save'} suggestion ${suggestion.uuid}`);

            const res = await fetch(endpoint, {
                method: method,
                credentials: 'include',
            });

            if (!res.ok) {
                console.error(`Failed to ${currentlySaved ? 'un-save' : 'save'} suggestion:`, res.status, res.statusText);
                throw new Error(`Failed to ${currentlySaved ? 'un-save' : 'save'} suggestion`);
            }

            const updatedSuggestion = await res.json();

            const userUuid = user?.uuid;
            const updatedInteractions = {
                ...interactions,
                saved: checkUserInteraction(updatedSuggestion.savedBy, userUuid),
                saveAmount: updatedSuggestion.savesAmount
            };

            setInteractions(updatedInteractions);

            if (onActionComplete) {
                onActionComplete(updatedSuggestion);
            }
        } catch (err) {
            console.error('Error toggling save:', err);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleResonateToggle = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        if (processingAction) return;

        setProcessingAction(true);

        const currentlyResonated = interactions.resonated;

        try {
            const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/${currentlyResonated ? 'un-resonate' : 'resonate'}`;
            const method = currentlyResonated ? 'DELETE' : 'POST';

            console.log(`Attempting to ${currentlyResonated ? 'un-resonate' : 'resonate'} suggestion ${suggestion.uuid}`);

            const res = await fetch(endpoint, {
                method: method,
                credentials: 'include',
            });

            if (!res.ok) {
                console.error(`Failed to ${currentlyResonated ? 'un-resonate' : 'resonate'} suggestion:`, res.status, res.statusText);
                throw new Error(`Failed to ${currentlyResonated ? 'un-resonate' : 'resonate'} suggestion`);
            }

            const updatedSuggestion = await res.json();

            const userUuid = user?.uuid;
            const updatedInteractions = {
                ...interactions,
                resonated: checkUserInteraction(updatedSuggestion.resonatedBy, userUuid),
                resonatesAmount: updatedSuggestion.resonatesAmount
            };

            setInteractions(updatedInteractions);

            if (onActionComplete) {
                onActionComplete(updatedSuggestion);
            }
        } catch (err) {
            console.error('Error toggling resonate:', err);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleReply = () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        console.log('Reply to suggestion:', suggestion.uuid);
    };

    const handleShare = async () => {
        try {
            const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/share`;
            const res = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include',
            });

            if (res.ok) {
                const shareLink = await res.text();
                navigator.clipboard.writeText(shareLink);
                console.log('Share link copied:', shareLink);
            }
        } catch (err) {
            console.error('Error getting share link:', err);
        }
    };

    const handleViewReplies = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        try {
            const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/replies`;
            const res = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include',
            });

            if (res.ok) {
                const replies = await res.json();
                console.log('Suggestion replies:', replies);
            }
        } catch (err) {
            console.error('Error getting replies:', err);
        }
    };

    return (
        <div className="suggestion-interactions">
            <button
                className={`interaction-button ${interactions.resonated ? 'active resonated' : ''}`}
                onClick={handleResonateToggle}
                disabled={processingAction}
                title={user ? (interactions.resonated ? 'Remove resonate' : 'Resonate') : 'Log in to resonate'}
            >
                {interactions.resonated ? <FaHeart /> : <FaRegHeart />}
                <span className="interaction-count">{interactions.resonatesAmount}</span>
            </button>

            <button
                className={`interaction-button ${interactions.saved ? 'active' : ''}`}
                onClick={handleSaveToggle}
                disabled={processingAction}
                title={user ? (interactions.saved ? 'Unsave' : 'Save') : 'Log in to save'}
            >
                {interactions.saved ? <FaBookmark /> : <FaRegBookmark />}
                <span className="interaction-count">{interactions.saveAmount}</span>
            </button>

            <button
                className="interaction-button"
                onClick={handleReply}
                title={user ? 'Reply to suggestion' : 'Log in to reply'}
            >
                <FaReply />
                <span className="interaction-count">{interactions.replyAmount}</span>
            </button>

            <button
                className="interaction-button"
                onClick={handleShare}
                title="Share"
            >
                <FaShare />
            </button>

            {interactions.replyAmount > 0 && (
                <button
                    className="interaction-button view-replies"
                    onClick={handleViewReplies}
                    title="View replies"
                >
                    View Replies ({interactions.replyAmount})
                </button>
            )}
        </div>
    );
};

export default SuggestionInteractions;