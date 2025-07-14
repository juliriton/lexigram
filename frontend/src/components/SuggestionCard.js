import React, { useState, useEffect } from 'react';
import { FaQuestion, FaTrash, FaEdit, FaEllipsisH } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import SuggestionInteractions from './SuggestionInteractions';
import '../styles/SuggestionCard.css';

const SuggestionCard = ({
                            user,
                            post,
                            username,
                            baseApiUrl,
                            formatDate,
                            onDelete,
                            onEdit,
                            isOwner,
                            onActionComplete,
                            showEditOption = false
                        }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const mediaUrl = post.style?.backgroundMediaUrl || post.imageUrl;
    const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;
    const headerParts = post.header ? post.header.split('...') : ['', ''];
    const promptText = headerParts[0] || "Tell me about";

    const privacySettings = post.privacySettings || {};
    const allowResonates = privacySettings.allowResonates !== false;
    const allowSaves = privacySettings.allowSaves !== false;

    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [updatedPost, setUpdatedPost] = useState(post);
    const [feedTags, setFeedTags] = useState(new Set());

    useEffect(() => {
        setUpdatedPost(post);
    }, [post]);

    // Fetch user's feed tags to check which tags are in feed
    const fetchFeedTags = async () => {
        if (!user) {
            setFeedTags(new Set());
            return;
        }

        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed`, {
                credentials: 'include'
            });

            if (response.ok) {
                const feedTagsData = await response.json();
                const feedTagUuids = new Set(feedTagsData.map(tag => tag.uuid));
                setFeedTags(feedTagUuids);
            } else {
                setFeedTags(new Set());
            }
        } catch (err) {
            console.error('Error fetching feed tags:', err);
            setFeedTags(new Set());
        }
    };

    useEffect(() => {
        fetchFeedTags();
    }, [user, baseApiUrl]);

    const toggleExpanded = () => setIsExpanded(!isExpanded);
    const toggleTags = () => setShowAllTags(!showAllTags);
    const toggleOptions = (e) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const suggestionText = updatedPost.body || '';
    const suggestionPreviewLen = 30;
    const needsSuggestionTruncate = suggestionText.length > suggestionPreviewLen;
    const suggestionPreview = suggestionText.slice(0, suggestionPreviewLen) + (needsSuggestionTruncate ? '…' : '');

    const navigateToUserProfile = () => {
        const targetUuid = updatedPost.user.uuid;
        if (!user) {
            if (location.pathname === `/profile/${targetUuid}`) {
                return;
            }
            navigate('/login');
            return;
        }

        if (targetUuid) {
            const targetPath = `/profile/${targetUuid}`;
            if (location.pathname === targetPath) {
            } else {
                navigate(targetPath);
            }
        }
    };

    const handleSuggestionInteractionComplete = (updatedSuggestion) => {
        setUpdatedPost(updatedSuggestion);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowOptions(false);
        if (onEdit && typeof onEdit === 'function') {
            onEdit(updatedPost);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowOptions(false);
        if (onDelete && typeof onDelete === 'function') {
            onDelete();
        }
    };

    const handleAddTagToFeed = async (tag, isInFeed, e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }

        // Enhanced validation - check both uuid and tag structure
        const tagUuid = tag?.uuid || tag?.id;
        if (!tagUuid || typeof tagUuid !== 'string') {
            console.error("Invalid tag or missing UUID:", tag);
            alert("Error: Invalid tag or missing UUID");
            return;
        }

        try {
            const endpoint = isInFeed ? "remove" : "add";
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed/${endpoint}/${tagUuid}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Update local state immediately for better UX
                setFeedTags(prev => {
                    const newSet = new Set(prev);
                    if (isInFeed) {
                        newSet.delete(tagUuid);
                    } else {
                        newSet.add(tagUuid);
                    }
                    return newSet;
                });

                // Also refresh feed tags to ensure consistency
                await fetchFeedTags();

                if (onActionComplete) {
                    onActionComplete(updatedPost);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update tag feed');
            }
        } catch (err) {
            console.error('Error updating tag feed:', err);
            alert(`Error updating tag feed: ${err.message}`);
        }
    };

    // Helper function to determine if a tag is in feed
    const isTagInFeed = (tag) => {
        const tagUuid = tag?.uuid || tag?.id;
        return tagUuid && feedTags.has(tagUuid);
    };

    const renderSuggestionStats = () => {
        const stats = [];

        if (allowResonates) {
            stats.push(
                <div key="resonates" className="stat-item">
                    <span className="stat-label">Resonates:</span>
                    <span className="stat-value">{updatedPost.resonatesAmount || 0}</span>
                </div>
            );
        }

        if (allowSaves) {
            stats.push(
                <div key="saves" className="stat-item">
                    <span className="stat-label">Saved:</span>
                    <span className="stat-value">{updatedPost.savesAmount || 0}</span>
                </div>
            );
        }

        stats.push(
            <div key="replies" className="stat-item">
                <span className="stat-label">Replies:</span>
                <span className="stat-value">{updatedPost.replyAmount || 0}</span>
            </div>
        );

        return stats;
    };

    return (
        <div className={`suggestion-card ${isExpanded ? 'expanded' : ''}`}>
            {fullMediaUrl && (
                <div className="suggestion-media-wrapper">
                    <div
                        className="suggestion-media"
                        style={{
                            backgroundImage: `url(${fullMediaUrl})`,
                            filter: isExpanded ? 'blur(3px)' : 'none',
                        }}
                    />
                </div>
            )}

            <div className="suggestion-card-content">
                <div className="badges-container">
                    <div className="badge suggestion-badge">
                        <FaQuestion className="badge-icon" />
                        <span>{updatedPost.type || "Suggestion"}</span>
                    </div>
                </div>

                {isOwner && (
                    <div className="post-options">
                        <button
                            className="options-btn"
                            onClick={toggleOptions}
                            aria-label="Post options"
                        >
                            <FaEllipsisH />
                        </button>

                        {showOptions && (
                            <div className="options-dropdown">
                                {(showEditOption || onEdit) && (
                                    <button onClick={handleEdit} className="option-item edit">
                                        <FaEdit size={14} /> <span>Edit</span>
                                    </button>
                                )}
                                <button onClick={handleDelete} className="option-item delete">
                                    <FaTrash size={14} /> <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="suggestion-text-container">
                    <span className="suggestion-prompt">{promptText}</span>
                    <h3 className="suggestion-card-title">
                        {isExpanded ? suggestionText : suggestionPreview}
                    </h3>
                    {needsSuggestionTruncate && (
                        <button className="show-more-btn" onClick={toggleExpanded}>
                            {isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                    )}
                </div>

                <div className="meta">
                    <button
                        className="username-link-btn"
                        onClick={() => navigateToUserProfile()}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: '#0d6efd',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: 'normal',
                            fontSize: 'inherit'
                        }}
                    >
                        @{username}
                    </button>
                    {updatedPost.creationDate && (
                        <span className="date">{formatDate(updatedPost.creationDate)}</span>
                    )}
                </div>

                {updatedPost.tags && updatedPost.tags.length > 0 && (
                    <div className="tags-section">
                        <div className="tags-inline">
                            {updatedPost.tags.slice(0, 5).map((tag, index) => {
                                const tagInFeed = isTagInFeed(tag);
                                return (
                                    <span key={index} className="tag">
                                        #{tag.name}
                                        {user && (
                                            <button
                                                className="tag-add-btn"
                                                onClick={(e) => handleAddTagToFeed(tag, tagInFeed, e)}
                                                title={tagInFeed ? "Remove from feed" : "Add to feed"}
                                            >
                                                {tagInFeed ? '-' : '+'}
                                            </button>
                                        )}
                                    </span>
                                );
                            })}
                            {showAllTags && updatedPost.tags.slice(5).map((tag, index) => {
                                const tagInFeed = isTagInFeed(tag);
                                return (
                                    <span key={index + 5} className="tag">
                                        #{tag.name}
                                        {user && (
                                            <button
                                                className="tag-add-btn"
                                                onClick={(e) => handleAddTagToFeed(tag, tagInFeed, e)}
                                                title={tagInFeed ? "Remove from feed" : "Add to feed"}
                                            >
                                                {tagInFeed ? '-' : '+'}
                                            </button>
                                        )}
                                    </span>
                                );
                            })}
                        </div>
                        {updatedPost.tags.length > 5 && (
                            <button className="show-more-btn" onClick={toggleTags}>
                                {showAllTags ? 'Show less' : `+${updatedPost.tags.length - 5} more`}
                            </button>
                        )}
                    </div>
                )}

                <SuggestionInteractions
                    user={user}
                    suggestion={updatedPost}
                    baseApiUrl={baseApiUrl}
                    onActionComplete={handleSuggestionInteractionComplete}
                />

                {renderSuggestionStats()}
            </div>
        </div>
    );
};

export default SuggestionCard;