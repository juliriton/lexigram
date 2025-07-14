import React, { useEffect } from 'react';
import { FaQuestion, FaTrash, FaEdit, FaEllipsisH, FaComment } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import SuggestionInteractions from './SuggestionInteractions';
import SuggestionReplies from './SuggestionReplies';
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

    // Get privacy settings from suggestion
    const privacySettings = post.privacySettings || {};
    const allowResonates = privacySettings.allowResonates !== false;
    const allowSaves = privacySettings.allowSaves !== false;

    const [isExpanded, setIsExpanded] = React.useState(false);
    const [showAllTags, setShowAllTags] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const [updatedPost, setUpdatedPost] = React.useState(post);
    const [showReplies, setShowReplies] = React.useState(false);

    // New state to track if tag feed status has been verified
    const [tagFeedStatusVerified, setTagFeedStatusVerified] = React.useState(false);

    // Effect to verify tag feed status on mount
    useEffect(() => {
        const verifyTagFeedStatus = async () => {
            if (!user || !updatedPost.tags || updatedPost.tags.length === 0 || tagFeedStatusVerified) {
                return;
            }

            try {
                // Get user's current feed tags
                const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const feedTags = await response.json();
                    const feedTagUuids = new Set(feedTags.map(tag => tag.uuid));

                    // Update post tags with correct inFeed status
                    setUpdatedPost(prevPost => ({
                        ...prevPost,
                        tags: prevPost.tags.map(tag => ({
                            ...tag,
                            inFeed: feedTagUuids.has(tag.uuid)
                        }))
                    }));

                    setTagFeedStatusVerified(true);
                }
            } catch (err) {
                console.error('Error verifying tag feed status:', err);
            }
        };

        verifyTagFeedStatus();
    }, [user, baseApiUrl, updatedPost.tags, tagFeedStatusVerified]);

    const toggleExpanded = () => setIsExpanded(!isExpanded);
    const toggleTags = () => setShowAllTags(!showAllTags);
    const toggleOptions = (e) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const handleViewReplies = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setShowReplies(true);
    };

    const handleCloseReplies = () => {
        setShowReplies(false);
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
        if (onActionComplete) {
            onActionComplete(updatedSuggestion);
        }
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

    const handleAddTagToFeed = async (tagUuid, isInFeed, e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const endpoint = isInFeed ? "remove" : "add";
            const response = await fetch(`${baseApiUrl}/api/auth/me/tags/feed/${endpoint}/${tagUuid}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Update the local state to reflect the change
                setUpdatedPost(prevPost => ({
                    ...prevPost,
                    tags: prevPost.tags.map(tag =>
                        tag.uuid === tagUuid ? { ...tag, inFeed: !isInFeed } : tag
                    )
                }));

                // Also update the parent component if callback exists
                if (onActionComplete) {
                    const updatedPostWithTag = {
                        ...updatedPost,
                        tags: updatedPost.tags.map(tag =>
                            tag.uuid === tagUuid ? { ...tag, inFeed: !isInFeed } : tag
                        )
                    };
                    onActionComplete(updatedPostWithTag);
                }

                alert(`Tag ${isInFeed ? 'removed from' : 'added to'} your feed!`);
            } else {
                alert('Failed to update tag feed');
            }
        } catch (err) {
            console.error('Error updating tag feed:', err);
            alert('Error updating tag feed');
        }
    };

    return (
        <>
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
                                {updatedPost.tags.slice(0, 5).map((tag, index) => (
                                    <span key={index} className="tag">
                                        #{tag.name}
                                        {user && (
                                            <button
                                                className="tag-add-btn"
                                                onClick={(e) => handleAddTagToFeed(tag.uuid, tag.inFeed, e)}
                                                title={tag.inFeed ? "Remove from feed" : "Add to feed"}
                                            >
                                                {tag.inFeed ? '-' : '+'}
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {showAllTags && updatedPost.tags.slice(5).map((tag, index) => (
                                    <span key={index + 5} className="tag">
                                        #{tag.name}
                                        {user && (
                                            <button
                                                className="tag-add-btn"
                                                onClick={(e) => handleAddTagToFeed(tag.uuid, tag.inFeed, e)}
                                                title={tag.inFeed ? "Remove from feed" : "Add to feed"}
                                            >
                                                {tag.inFeed ? '-' : '+'}
                                            </button>
                                        )}
                                    </span>
                                ))}
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

                    {/* Replies section */}
                    <div className="replies-section">
                        <button
                            className="view-replies-btn"
                            onClick={handleViewReplies}
                            disabled={!user}
                        >
                            <FaComment className="replies-btn-icon" />
                            <span>View Replies</span>
                        </button>
                    </div>
                </div>
            </div>

            {showReplies && (
                <SuggestionReplies
                    suggestion={updatedPost}
                    baseApiUrl={baseApiUrl}
                    user={user}
                    formatDate={formatDate}
                    onClose={handleCloseReplies}
                />
            )}
        </>
    );
};

export default SuggestionCard;