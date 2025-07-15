import React, { useState, useEffect } from 'react';
import { FaBookmark, FaRegBookmark, FaReply, FaShare, FaHeart, FaRegHeart } from 'react-icons/fa';
import '../styles/SuggestionInteractions.css';
import { useNavigate } from "react-router-dom";

const SuggestionInteractions = ({ user, suggestion, baseApiUrl, onActionComplete }) => {
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const navigate = useNavigate();

    const [interactions, setInteractions] = useState({
        saved: false,
        saveAmount: 0,
        resonated: false,
        resonatesAmount: 0,
        replyAmount: 0
    });

    const [processingAction, setProcessingAction] = useState(false);

    const privacySettings = suggestion.privacySettings || {};
    const allowResonates = privacySettings.allowResonates !== false;
    const allowSaves = privacySettings.allowSaves !== false;

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
            navigate('/login');
            return;
        }
        if (processingAction) return;

        setProcessingAction(true);
        const currentlySaved = interactions.saved;

        try {
            const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/${currentlySaved ? 'un-save' : 'save'}`;
            const method = currentlySaved ? 'DELETE' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                credentials: 'include',
            });

            if (!res.ok) throw new Error();

            const updatedSuggestion = await res.json();
            const userUuid = user?.uuid;

            setInteractions({
                ...interactions,
                saved: checkUserInteraction(updatedSuggestion.savedBy, userUuid),
                saveAmount: updatedSuggestion.savesAmount
            });

            if (onActionComplete) {
                onActionComplete({
                    ...updatedSuggestion,
                    saved: checkUserInteraction(updatedSuggestion.savedBy, userUuid)
                });
            }
        } catch (err) {
            console.error('Error toggling save:', err);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleResonateToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (processingAction) return;

        setProcessingAction(true);
        const currentlyResonated = interactions.resonated;

        try {
            const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/${currentlyResonated ? 'un-resonate' : 'resonate'}`;
            const method = currentlyResonated ? 'DELETE' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                credentials: 'include',
            });

            if (!res.ok) throw new Error();

            const updatedSuggestion = await res.json();
            const userUuid = user?.uuid;

            setInteractions({
                ...interactions,
                resonated: checkUserInteraction(updatedSuggestion.resonatedBy, userUuid),
                resonatesAmount: updatedSuggestion.resonatesAmount
            });

            if (onActionComplete) {
                onActionComplete({
                    ...updatedSuggestion,
                    saved: checkUserInteraction(updatedSuggestion.savedBy, userUuid)
                });
            }

        } catch (err) {
            console.error('Error toggling resonate:', err);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleReply = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/suggestion/${suggestion.uuid}/reply`);
    };

    const handleShare = async () => {
        try {
            let urlToShare = `${window.location.origin}/?suggestion=${suggestion.uuid}`;

            if (user) {
                const endpoint = `${baseApiUrl}/api/auth/me/suggestion/${suggestion.uuid}/share`;
                const res = await fetch(endpoint, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (res.ok) {
                    urlToShare = await res.text();
                }
            }

            await copyToClipboard(urlToShare);
            setShowCopiedMessage(true);
            setTimeout(() => setShowCopiedMessage(false), 2000);
        } catch (err) {
            console.error('Error sharing:', err);
            const shareUrl = `${window.location.origin}/?suggestion=${suggestion.uuid}`;
            await copyToClipboard(shareUrl);
            setShowCopiedMessage(true);
            setTimeout(() => setShowCopiedMessage(false), 2000);
        }
    };

    const copyToClipboard = async (url) => {
        try {
            if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                await navigator.share({
                });
            } else {
                await navigator.clipboard.writeText(url);
            }
        } catch (err) {
            console.error('Error copying to clipboard:', err);
            const tempInput = document.createElement('input');
            tempInput.value = url;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        }
    };

    return (
        <div className="suggestion-interactions" style={{display: 'flex', gap: '10px'}}>
            {allowResonates && (
                <button
                    className={`interaction-button ${interactions.resonated ? 'active resonated' : ''}`}
                    onClick={handleResonateToggle}
                    disabled={processingAction}
                    title={user ? (interactions.resonated ? 'Remove resonate' : 'Resonate') : 'Log in to resonate'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: interactions.resonated ? '#e0245e' : '#333',
                    }}
                >
                    {interactions.resonated ? <FaHeart/> : <FaRegHeart/>}
                    <span>{interactions.resonatesAmount}</span>
                </button>
            )}

            {allowSaves && (
                <button
                    className={`interaction-button ${interactions.saved ? 'active' : ''}`}
                    onClick={handleSaveToggle}
                    disabled={processingAction}
                    title={user ? (interactions.saved ? 'Unsave' : 'Save') : 'Log in to save'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: interactions.saved ? '#0d6efd' : '#333',
                    }}
                >
                    {interactions.saved ? <FaBookmark/> : <FaRegBookmark/>}
                    <span>{interactions.saveAmount}</span>
                </button>
            )}

            <button
                className="interaction-button"
                onClick={handleReply}
                title={user ? 'Reply to suggestion' : 'Log in to reply'}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                }}
            >
                <FaReply/>
                <span>{interactions.replyAmount}</span>
            </button>

            <button
                className="interaction-button"
                onClick={handleShare}
                title="Share"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    position: 'relative'
                }}
            >
                <FaShare/>
                {showCopiedMessage && (
                    <span style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#333',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                    }}>
                        Copied!
                    </span>
                )}
            </button>
        </div>
    );
};

export default SuggestionInteractions;