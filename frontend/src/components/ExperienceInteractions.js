import React, { useState, useEffect } from 'react';
import { FaBookmark, FaRegBookmark, FaCommentAlt, FaShare, FaHeart, FaRegHeart } from 'react-icons/fa';
import '../styles/ExperienceInteractions.css';
import { FaCodeFork } from "react-icons/fa6";

const ExperienceInteractions = ({ user, experience, baseApiUrl, onActionComplete }) => {
    const [interactions, setInteractions] = useState({
        saved: experience.saved || false,
        saveAmount: experience.saveAmount || 0,
        resonated: experience.resonated || false,
        resonatesAmount: experience.resonatesAmount || 0,
        commentAmount: experience.commentAmount || 0
    });

    const [processingAction, setProcessingAction] = useState(false);

    // 🔁 Sync con nuevas props (como después de un refresh)
    useEffect(() => {
        setInteractions({
            saved: experience.saved || false,
            saveAmount: experience.saveAmount || 0,
            resonated: experience.resonated || false,
            resonatesAmount: experience.resonatesAmount || 0,
            commentAmount: experience.commentAmount || 0
        });
    }, [experience]);

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

            if (!res.ok) throw new Error(`Failed to ${interactions.saved ? 'un-save' : 'save'} experience`);

            const updatedInteractions = {
                ...interactions,
                saved: !interactions.saved,
                saveAmount: interactions.saved
                    ? Math.max(0, interactions.saveAmount - 1)
                    : interactions.saveAmount + 1
            };

            setInteractions(updatedInteractions);

            if (onActionComplete) {
                onActionComplete({
                    ...experience,
                    saved: updatedInteractions.saved,
                    saveAmount: updatedInteractions.saveAmount
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

            if (!res.ok) throw new Error(`Failed to ${interactions.resonated ? 'un-resonate' : 'resonate'} experience`);

            const updatedInteractions = {
                ...interactions,
                resonated: !interactions.resonated,
                resonatesAmount: interactions.resonated
                    ? Math.max(0, interactions.resonatesAmount - 1)
                    : interactions.resonatesAmount + 1
            };

            setInteractions(updatedInteractions);

            if (onActionComplete) {
                onActionComplete({
                    ...experience,
                    resonated: updatedInteractions.resonated,
                    resonatesAmount: updatedInteractions.resonatesAmount
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
            window.location.href = '/login';
            return;
        }
        console.log('Comment on experience:', experience.uuid);
    };

    const handleShare = () => {
        console.log('Share experience:', experience.uuid);
    };

    const handleFork = () => {
        console.log('Fork experience:', experience.uuid);
    };

    return (
        <div className="experience-interactions">
            <button
                className={`interaction-button ${interactions.resonated ? 'active resonated' : ''}`}
                onClick={handleResonateToggle}
                title={user ? (interactions.resonated ? 'Remove resonate' : 'Resonate') : 'Log in to resonate'}
            >
                {interactions.resonated ? <FaHeart /> : <FaRegHeart />}
                <span className="interaction-count">{interactions.resonatesAmount}</span>
            </button>

            <button
                className={`interaction-button ${interactions.saved ? 'active' : ''}`}
                onClick={handleSaveToggle}
                title={user ? (interactions.saved ? 'Unsave' : 'Save') : 'Log in to save'}
            >
                {interactions.saved ? <FaBookmark /> : <FaRegBookmark />}
                <span className="interaction-count">{interactions.saveAmount}</span>
            </button>

            <button
                className="interaction-button"
                onClick={handleComment}
                title={user ? 'Comment' : 'Log in to comment'}
            >
                <FaCommentAlt />
                <span className="interaction-count">{interactions.commentAmount}</span>
            </button>

            <button
                className="interaction-button"
                onClick={handleShare}
                title="Share"
            >
                <FaShare />
            </button>

            <button
                className="interaction-button report"
                onClick={handleFork}
                title="Report"
            >
                <FaCodeFork />
            </button>
        </div>
    );
};

export default ExperienceInteractions;
