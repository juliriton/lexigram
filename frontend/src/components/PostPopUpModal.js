import React, { useState, useEffect } from 'react';
import { FaTimes, FaShare, FaHeart, FaComment, FaBookmark, FaCodeBranch, FaPhotoVideo, FaQuestion } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import ExperienceInteractions from './ExperienceInteractions';
import SuggestionInteractions from './SuggestionInteractions';
import '../styles/PostPopUpModal.css';

const PostPopupModal = ({
                            isOpen,
                            onClose,
                            post,
                            postType, // experience o suggestion
                            user,
                            baseApiUrl,
                            formatDate,
                            onActionComplete
                        }) => {
    const [showFullContent, setShowFullContent] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [updatedPost, setUpdatedPost] = useState(post);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        setUpdatedPost(post);
    }, [post]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleActionComplete = (updatedData) => {
        setUpdatedPost(updatedData);
        if (onActionComplete) {
            onActionComplete(updatedData);
        }
    };

    const handleShare = async () => {
        const shareUrl = postType === 'experience'
            ? `${window.location.origin}/experience/${post.uuid}`
            : `${window.location.origin}/suggestion/${post.uuid}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    if (!isOpen || !post) return null;

    const mediaUrl = post.style?.backgroundMediaUrl || post.imageUrl;
    const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;
    const isVideo = (url) => url && /\.(mp4|webm|ogg)$/i.test(url);

    const mainContent = postType === 'experience'
        ? (post.reflection || post.content || '')
        : (post.body || '');

    const title = postType === 'experience'
        ? (post.title || post.quote || '')
        : (post.header || '');

    const contentPreviewLen = 200;
    const needsContentTruncate = mainContent.length > contentPreviewLen;
    const contentPreview = mainContent.slice(0, contentPreviewLen) + (needsContentTruncate ? '…' : '');

    const allTags = (updatedPost.tags || []).slice(0, 20);
    const visibleTags = showAllTags ? allTags : allTags.slice(0, 10);

    return (
        <div
            className="post-popup-overlay"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className="post-popup-modal">
                <div className="popup-header">
                    <div className="popup-badges">
                        {postType === 'experience' ? (
                            <>
                                <span className="badge exp-badge">
                                    <FaPhotoVideo /> Experience
                                </span>
                                {updatedPost.origin && (
                                    <span className="badge orig-badge">
                                        <FaStar /> Origin
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="badge suggestion-badge">
                                <FaQuestion /> Suggestion
                            </span>
                        )}
                    </div>

                    <div className="popup-actions">
                        <button
                            className="share-btn"
                            onClick={handleShare}
                            title="Share post"
                        >
                            <FaShare />
                        </button>
                        <button
                            className="close-btn"
                            onClick={onClose}
                            title="Close"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {copySuccess && (
                    <div className="copy-success-message">
                        ✓ Link copied to clipboard!
                    </div>
                )}

                <div className="popup-content">
                    {fullMediaUrl && (
                        <div className="popup-media-container">
                            {isVideo(mediaUrl) ? (
                                <video
                                    src={fullMediaUrl}
                                    className="popup-media"
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                />
                            ) : (
                                <img
                                    src={fullMediaUrl}
                                    alt={title}
                                    className="popup-media"
                                />
                            )}

                            {postType === 'experience' && title && (
                                <div
                                    className="popup-quote-overlay"
                                    style={{
                                        left: `${updatedPost.style?.textPositionX || 50}%`,
                                        top: `${updatedPost.style?.textPositionY || 50}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    <div
                                        className="popup-quote-text"
                                        style={{
                                            fontSize: `${Math.min(Math.max(updatedPost.style?.fontSize || 24, 16), 32)}px`,
                                            fontFamily: updatedPost.style?.fontFamily || 'inherit',
                                            color: updatedPost.style?.fontColor || '#fff'
                                        }}
                                    >
                                        "{title}"
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="popup-text-content">
                        {title && (
                            <h2 className="popup-title">
                                {postType === 'suggestion' && title.includes('...')
                                    ? title.split('...')[0] + '...'
                                    : title
                                }
                            </h2>
                        )}

                        {mainContent && (
                            <div className="popup-main-content">
                                <p>{showFullContent ? mainContent : contentPreview}</p>
                                {needsContentTruncate && (
                                    <button
                                        className="show-more-btn"
                                        onClick={() => setShowFullContent(!showFullContent)}
                                    >
                                        {showFullContent ? 'Show Less' : 'Show More'}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="popup-meta">
                            <span className="popup-username">
                                @{post.user?.username || 'Usuario'}
                            </span>
                            {post.creationDate && (
                                <span className="popup-date">
                                    {formatDate(post.creationDate)}
                                </span>
                            )}
                        </div>

                        {allTags.length > 0 && (
                            <div className="popup-tags">
                                <div className="tags-container">
                                    {visibleTags.map((tag, index) => (
                                        <span key={index} className="popup-tag">
                                            #{tag.name || tag}
                                        </span>
                                    ))}
                                </div>
                                {allTags.length > 10 && (
                                    <button
                                        className="show-more-tags-btn"
                                        onClick={() => setShowAllTags(!showAllTags)}
                                    >
                                        {showAllTags ? 'Show Less' : `+${allTags.length - 10} more tags`}
                                    </button>
                                )}
                            </div>
                        )}

                        {updatedPost.mentions && updatedPost.mentions.length > 0 && (
                            <div className="popup-mentions">
                                <h6>Mentions:</h6>
                                <div className="mentions-list">
                                    {updatedPost.mentions.map((mention, index) => (
                                        <span key={index} className="popup-mention">
                                            @{mention.username}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="popup-stats">
                            <div className="stat-item">
                                <FaHeart className="stat-icon" />
                                <span>{updatedPost.resonatesAmount || 0}</span>
                            </div>
                            <div className="stat-item">
                                <FaComment className="stat-icon" />
                                <span>{updatedPost.commentAmount || 0}</span>
                            </div>
                            <div className="stat-item">
                                <FaBookmark className="stat-icon" />
                                <span>{updatedPost.saveAmount || 0}</span>
                            </div>
                            {postType === 'experience' && (
                                <div className="stat-item">
                                    <FaCodeBranch className="stat-icon" />
                                    <span>{updatedPost.branchAmount || 0}</span>
                                </div>
                            )}
                        </div>

                        <div className="popup-interactions">
                            {postType === 'experience' ? (
                                <ExperienceInteractions
                                    user={user}
                                    experience={updatedPost}
                                    baseApiUrl={baseApiUrl}
                                    onActionComplete={handleActionComplete}
                                />
                            ) : (
                                <SuggestionInteractions
                                    user={user}
                                    suggestion={updatedPost}
                                    baseApiUrl={baseApiUrl}
                                    onActionComplete={handleActionComplete}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPopupModal;