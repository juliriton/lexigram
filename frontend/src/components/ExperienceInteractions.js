import React, { useState, useEffect } from 'react';
import { FaBookmark, FaRegBookmark, FaCommentAlt, FaShare, FaHeart, FaRegHeart } from 'react-icons/fa';
import '../styles/ExperienceInteractions.css';
import { FaCodeFork } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const ExperienceInteractions = ({ user, experience, baseApiUrl, onActionComplete, onCommentClick }) => {
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const navigate = useNavigate();

    const getUserInteractionStatus = (experience, user) => {
        if (!user || !user.uuid) {
            return {
                saved: false,
                resonated: false
            };
        }

        return {
            saved: experience.savedBy?.includes(user.uuid) || false,
            resonated: experience.resonatedBy?.includes(user.uuid) || false
        };
    };

    const [interactions, setInteractions] = useState(() => {
        const userStatus = getUserInteractionStatus(experience, user);
        return {
            saved: userStatus.saved,
            saveAmount: experience.saveAmount || 0,
            resonated: userStatus.resonated,
            resonatesAmount: experience.resonatesAmount || 0,
            commentAmount: experience.commentAmount || 0
        };
    });

    const [processingAction, setProcessingAction] = useState(false);

    const privacySettings = experience.privacySettings || {};
    const allowResonates = privacySettings.allowResonates !== false;
    const allowSaves = privacySettings.allowSaves !== false;
    const allowComments = privacySettings.allowComments !== false;
    const allowForks = privacySettings.allowForks !== false;

    useEffect(() => {
        const userStatus = getUserInteractionStatus(experience, user);
        setInteractions({
            saved: userStatus.saved,
            saveAmount: experience.saveAmount || 0,
            resonated: userStatus.resonated,
            resonatesAmount: experience.resonatesAmount || 0,
            commentAmount: experience.commentAmount || 0
        });
    }, [experience, user]);

    const handleSaveToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (processingAction) return;

        setProcessingAction(true);
        try {
            const endpoint = `${baseApiUrl}/api/auth/me/experience/${experience.uuid}/${interactions.saved ? 'un-save' : 'save'}`;
            const method = interactions.saved ? 'DELETE' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                credentials: 'include',
            });

            if (!res.ok) {
                console.error(`Failed to ${interactions.saved ? 'un-save' : 'save'} experience:`, res.status, res.statusText);
                throw new Error(`Failed to ${interactions.saved ? 'un-save' : 'save'} experience`);
            }

            const updatedExperience = await res.json();
            const userStatus = getUserInteractionStatus(updatedExperience, user);

            const updatedInteractions = {
                ...interactions,
                saved: userStatus.saved,
                saveAmount: updatedExperience.saveAmount || 0
            };

            setInteractions(updatedInteractions);

            if (onActionComplete) {
                onActionComplete({
                    ...updatedExperience,
                    saved: userStatus.saved  // Make sure this is included
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
        try {
            const endpoint = `${baseApiUrl}/api/auth/me/experience/${experience.uuid}/${interactions.resonated ? 'un-resonate' : 'resonate'}`;
            const method = interactions.resonated ? 'DELETE' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                credentials: 'include',
            });

            if (!res.ok) {
                console.error(`Failed to ${interactions.resonated ? 'un-resonate' : 'resonate'} experience:`, res.status, res.statusText);
                throw new Error(`Failed to ${interactions.resonated ? 'un-resonate' : 'resonate'} experience`);
            }

            const updatedExperience = await res.json();
            const userStatus = getUserInteractionStatus(updatedExperience, user);

            const updatedInteractions = {
                ...interactions,
                resonated: userStatus.resonated,
                resonatesAmount: updatedExperience.resonatesAmount || 0
            };

            setInteractions(updatedInteractions);

            if (onActionComplete) {
                onActionComplete({
                    ...updatedExperience,
                    saved: userStatus.saved
                });
            }
        } catch (err) {
            console.error('Error toggling resonate:', err);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleComment = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (typeof onCommentClick === 'function') {
            onCommentClick();
        }
    };

    const handleShare = async () => {
        try {
            let urlToShare = `${window.location.origin}/?experience=${experience.uuid}`;

            if (user) {
                const endpoint = `${baseApiUrl}/api/auth/me/experience/${experience.uuid}/share`;
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
            const shareUrl = `${window.location.origin}/?experience=${experience.uuid}`;
            await copyToClipboard(shareUrl);
            setShowCopiedMessage(true);
            setTimeout(() => setShowCopiedMessage(false), 2000);
        }
    };

    const copyToClipboard = async (url) => {
        try {
            if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                await navigator.share({
                    title: experience.title || 'Check out this experience',
                    text: experience.reflection || experience.content || '',
                    url: url
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

    const handleFork = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/fork/${experience.uuid}`);
    };

    return (
        <div className="experience-interactions">
            {allowResonates && (
                <button
                    className={`interaction-button ${interactions.resonated ? 'active resonated' : ''}`}
                    onClick={handleResonateToggle}
                    disabled={processingAction}
                    title={user ? (interactions.resonated ? 'Remove resonate' : 'Resonate') : 'Log in to resonate'}
                >
                    {interactions.resonated ? <FaHeart/> : <FaRegHeart/>}
                    <span className="interaction-count">{interactions.resonatesAmount}</span>
                </button>
            )}

            {allowSaves && (
                <button
                    className={`interaction-button ${interactions.saved ? 'active' : ''}`}
                    onClick={handleSaveToggle}
                    disabled={processingAction}
                    title={user ? (interactions.saved ? 'Unsave' : 'Save') : 'Log in to save'}
                >
                    {interactions.saved ? <FaBookmark/> : <FaRegBookmark/>}
                    <span className="interaction-count">{interactions.saveAmount}</span>
                </button>
            )}

            {allowComments && (
                <button
                    className="interaction-button"
                    onClick={handleComment}
                    title={user ? 'Comment' : 'Log in to comment'}
                >
                    <FaCommentAlt/>
                    <span className="interaction-count">{interactions.commentAmount}</span>
                </button>
            )}

            <button
                className="interaction-button"
                onClick={handleShare}
                title="Share"
            >
                <FaShare/>
                {showCopiedMessage && <span className="copied-message">Copied!</span>}
            </button>

            {allowForks && (
                <button
                    className="interaction-button"
                    onClick={handleFork}
                    title={user ? 'Fork' : 'Log in to fork'}
                >
                    <FaCodeFork/>
                </button>
            )}
        </div>
    );
};

export default ExperienceInteractions;