import React, { useState, useEffect } from 'react';
import { FaBookmark, FaRegBookmark, FaCommentAlt, FaShare, FaHeart, FaRegHeart } from 'react-icons/fa';
import '../styles/ExperienceInteractions.css';
import { FaCodeFork } from "react-icons/fa6";

const ExperienceInteractions = ({ user, experience, baseApiUrl, onActionComplete, onCommentClick }) => {

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

    // Get privacy settings from experience
    const privacySettings = experience.privacySettings || {};
    const allowResonates = privacySettings.allowResonates !== false; // Default to true if not specified
    const allowSaves = privacySettings.allowSaves !== false; // Default to true if not specified
    const allowComments = privacySettings.allowComments !== false; // Default to true if not specified
    const allowForks = privacySettings.allowForks !== false; // Default to true if not specified

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
            window.location.href = '/login';
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

            // Get updated experience from response
            const updatedExperience = await res.json();
            const userStatus = getUserInteractionStatus(updatedExperience, user);

            const updatedInteractions = {
                ...interactions,
                saved: userStatus.saved,
                saveAmount: updatedExperience.saveAmount || 0
            };

            setInteractions(updatedInteractions);

            if (onActionComplete) {
                onActionComplete(updatedExperience);
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

            // Get updated experience from response
            const updatedExperience = await res.json();
            const userStatus = getUserInteractionStatus(updatedExperience, user);

            const updatedInteractions = {
                ...interactions,
                resonated: userStatus.resonated,
                resonatesAmount: updatedExperience.resonatesAmount || 0
            };

            setInteractions(updatedInteractions);

            if (onActionComplete) {
                onActionComplete(updatedExperience);
            }
        } catch (err) {
            console.error('Error toggling resonate:', err);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleComment = () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        if (typeof onCommentClick === 'function') {
            onCommentClick();
        }
    };


    const handleShare = async () => {
        try {
            const endpoint = `${baseApiUrl}/api/auth/me/experience/${experience.uuid}/share`;
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

    const handleFork = () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        console.log('Fork experience:', experience.uuid);
    };

    const handleBranches = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        try {
            const endpoint = `${baseApiUrl}/api/auth/me/experience/${experience.uuid}/branches`;
            const res = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include',
            });

            if (res.ok) {
                const branches = await res.json();
                console.log('Experience branches:', branches);
            }
        } catch (err) {
            console.error('Error getting branches:', err);
        }
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
                    {interactions.resonated ? <FaHeart /> : <FaRegHeart />}
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
                    {interactions.saved ? <FaBookmark /> : <FaRegBookmark />}
                    <span className="interaction-count">{interactions.saveAmount}</span>
                </button>
            )}

            {allowComments && (
                <button
                    className="interaction-button"
                    onClick={handleComment}
                    title={user ? 'Comment' : 'Log in to comment'}
                >
                    <FaCommentAlt />
                    <span className="interaction-count">{interactions.commentAmount}</span>
                </button>
            )}

            {/* Share button is always visible */}
            <button
                className="interaction-button"
                onClick={handleShare}
                title="Share"
            >
                <FaShare />
            </button>

            {allowForks && (
                <button
                    className="interaction-button"
                    onClick={handleFork}
                    title={user ? 'Fork' : 'Log in to fork'}
                >
                    <FaCodeFork />
                </button>
            )}
        </div>
    );
};

export default ExperienceInteractions;