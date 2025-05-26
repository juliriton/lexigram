import React from 'react';
import { FaQuestion, FaTrash, FaEdit } from 'react-icons/fa';
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
                            onActionComplete
                        }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const mediaUrl = post.style?.backgroundMediaUrl || post.imageUrl;
    const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;
    const headerParts = post.header ? post.header.split('...') : ['', ''];
    const promptText = headerParts[0] || "Tell me about";

    const [isExpanded, setIsExpanded] = React.useState(false);
    const [showAllTags, setShowAllTags] = React.useState(false);

    const toggleExpanded = () => setIsExpanded(!isExpanded);
    const toggleTags = () => setShowAllTags(!showAllTags);

    const suggestionText = post.body || '';
    const suggestionPreviewLen = 30;
    const needsSuggestionTruncate = suggestionText.length > suggestionPreviewLen;
    const suggestionPreview = suggestionText.slice(0, suggestionPreviewLen) + (needsSuggestionTruncate ? '…' : '');

    const navigateToUserProfile = (profileUuid) => {
        const targetUuid = profileUuid || post.user.uuid;
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
                return;
            } else {
                navigate(targetPath);
            }
        }
    };

    const handleActionComplete = (updatedSuggestion) => {
        if (onActionComplete) {
            onActionComplete(updatedSuggestion);
        }
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
                        <span>{post.type || "Suggestion"}</span>
                    </div>
                </div>

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
                    {post.creationDate && (
                        <span className="date">{formatDate(post.creationDate)}</span>
                    )}
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="tags-section">
                        <div className="tags-inline">
                            {post.tags.slice(0, 5).map((tag, index) => (
                                <span key={index} className="tag">#{tag.name || tag}</span>
                            ))}
                            {showAllTags && post.tags.slice(5).map((tag, index) => (
                                <span key={index + 5} className="tag">#{tag.name || tag}</span>
                            ))}
                        </div>
                        {post.tags.length > 5 && (
                            <button className="show-more-btn" onClick={toggleTags}>
                                {showAllTags ? 'Show less' : `+${post.tags.length - 5} more`}
                            </button>
                        )}
                    </div>
                )}

                {/* Add suggestion interactions component */}
                <SuggestionInteractions
                    user={user}
                    suggestion={post}
                    baseApiUrl={baseApiUrl}
                    onActionComplete={handleActionComplete}
                />

                {isOwner && (
                    <div className="actions">
                        <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={onEdit}
                            aria-label="Edit Suggestion"
                        >
                            <FaEdit /> Edit
                        </button>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={onDelete}
                            aria-label="Delete Suggestion"
                        >
                            <FaTrash /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestionCard;