import React from 'react';
import { FaQuestion, FaTrash } from 'react-icons/fa';
import '../styles/SuggestionCard.css';

const SuggestionCard = ({
                            post,
                            username,
                            baseApiUrl,
                            renderTags,
                            formatDate,
                            onDelete,
                            isOwner,
                        }) => {
    const mediaUrl = post.style?.backgroundMediaUrl || post.imageUrl;
    const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;
    const headerParts = post.header ? post.header.split('...') : ['', ''];
    const promptText = headerParts[0] || "Tell me about";

    return (
        <div className="suggestion-card">
            {fullMediaUrl && (
                <div className="suggestion-media-wrapper">
                    <div
                        className="suggestion-media"
                        style={{
                            backgroundImage: `url(${fullMediaUrl})`
                        }}
                    />
                </div>
            )}

            <div className="suggestion-card-content">
                <div className="badges-container">
                    <div className="badge suggestion-badge">
                        <FaQuestion className="badge-icon"/>
                        <span>{post.type || "Suggestion"}</span>
                    </div>
                </div>

                <div className="suggestion-text-container">
                    <span className="suggestion-prompt">{promptText}</span>
                    <h3 className="suggestion-card-title">{post.body}</h3>
                </div>

                <div className="suggestion-card-header">
                    <span className="username">{username}</span>
                </div>

                <div className="suggestion-card-footer">
                    {post.creationDate && (
                        <small className="post-date">{formatDate(post.creationDate)}</small>
                    )}

                    {post.tags?.length > 0 && (
                        <div className="post-tags">{renderTags(post.tags)}</div>
                    )}
                </div>

                {isOwner && (
                    <button
                        className="btn-delete"
                        onClick={onDelete}
                        aria-label="Delete Suggestion"
                    >
                        <FaTrash className="delete-icon"/> Delete
                    </button>
                )}
            </div>
        </div>
    );
};

export default SuggestionCard;