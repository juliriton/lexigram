import React, { useState, useMemo } from 'react';
import { FaPhotoVideo, FaTrash } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ExperienceCard.css';

const ExperienceCard = ({
                            user,
                            post,
                            username,
                            baseApiUrl,
                            hiddenQuotes,
                            toggleQuote,
                            showMentions,
                            setShowMentions,
                            formatDate,
                            onDelete,
                            isOwner
                        }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const postId = post.uuid;
    const isQuoteHidden = hiddenQuotes[postId];
    const mediaUrl = post.style?.backgroundMediaUrl || post.imageUrl;
    const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;
    const isVideo = url => /\.(mp4|webm|ogg)$/i.test(url);

    const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);

    const quoteFontSize = useMemo(() => {
        const f = post.style?.fontSize || 20;
        return Math.min(Math.max(f, 8), 30);
    }, [post.style]);

    const rawQuote = post.quote || post.title || '';
    const quotePreviewLen = 30;
    const needsQuoteTruncate = rawQuote.length > quotePreviewLen;
    const quotePreview = rawQuote.slice(0, quotePreviewLen) + (needsQuoteTruncate ? '…' : '');

    const reflectionText = post.reflection || post.content || '';
    const reflPreviewLen = 20;
    const needsReflTruncate = reflectionText.length > reflPreviewLen;
    const reflPreview = reflectionText.slice(0, reflPreviewLen) + (needsReflTruncate ? '…' : '');
    const [showFullRefl, setShowFullRefl] = useState(false);

    const allTags = (post.tags || []).slice(0, 20);
    const inlineTags = allTags.slice(0, 5);
    const extraTags = allTags.slice(5);
    const [showAllTags, setShowAllTags] = useState(false);

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
                navigate(targetPath)
            }
        }
    };

    const handleMentionClick = (mentionUuid) => {
        if (!user) {
            navigate('/login');
            return;
        }

        navigate(`/profile/${mentionUuid}`);
    };

    // Custom renderMentions function for this component
    const renderMentionsInCard = (mentions) => {
        if (!Array.isArray(mentions) || mentions.length === 0) {
            return null;
        }

        return (
            <div className="post-mentions">
                <h6>Mentions:</h6>
                <div className="mentions-list">
                    {mentions.map((mention, i) => (
                        <span
                            key={i}
                            className="mention clickable"
                            onClick={() => handleMentionClick(mention.uuid)}
                        >
                            @{mention.username}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="experience-card">
                {fullMediaUrl && (
                    <div className="media-wrapper">
                        {isVideo(mediaUrl)
                            ? <video
                                src={fullMediaUrl}
                                className={`media-element ${!isQuoteHidden ? 'blur-media' : ''}`}
                                autoPlay muted loop
                            />
                            : <img
                                src={fullMediaUrl}
                                alt={post.title}
                                className={`media-element ${!isQuoteHidden ? 'blur-media' : ''}`}
                            />
                        }

                        {!isQuoteHidden && (
                            <div
                                className="quote-overlay"
                                style={{
                                    left: `${post.style?.textPositionX || 50}%`,
                                    top: `${post.style?.textPositionY || 50}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div
                                    className="quote-text"
                                    style={{
                                        fontSize: `${quoteFontSize}px`,
                                        fontFamily: post.style?.fontFamily || 'inherit',
                                        color: post.style?.fontColor || '#fff'
                                    }}
                                >
                                    "{quotePreview}"
                                </div>
                                {needsQuoteTruncate && (
                                    <button
                                        className="overlay-btn"
                                        onClick={() => setQuoteModalOpen(true)}
                                    >
                                        View Full
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="content">
                    <div className="badges">
                        <span className="badge exp-badge">
                            <FaPhotoVideo /> Experience
                        </span>
                        {post.origin && (
                            <span className="badge orig-badge">
                                <FaStar /> Origin
                            </span>
                        )}
                    </div>

                    <h3 className="title">{post.title}</h3>

                    <div className="reflection-section">
                        <div className="reflection-text">
                            {showFullRefl ? reflectionText : reflPreview}
                        </div>
                        {needsReflTruncate && (
                            <button
                                className="show-more-btn"
                                onClick={() => setShowFullRefl(r => !r)}
                            >
                                {showFullRefl ? 'Show less' : 'Show more'}
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

                    {allTags.length > 0 && (
                        <div className="tags-section">
                            <div className="tags-inline">
                                {inlineTags.map((t, i) => <span key={i} className="tag">#{t.name}</span>)}
                                {showAllTags && extraTags.map((t, i) =>
                                    <span key={i + 5} className="tag">#{t.name}</span>
                                )}
                            </div>
                            {extraTags.length > 0 && (
                                <button
                                    className="show-more-btn"
                                    onClick={() => setShowAllTags(x => !x)}
                                >
                                    {showAllTags ? 'Show less' : `+${extraTags.length} more`}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="actions">
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => toggleQuote(postId)}
                        >
                            {isQuoteHidden ? 'Show Quote' : 'Hide Quote'}
                        </button>
                        {post.mentions?.length > 0 && (
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                    setShowMentions(p => ({ ...p, [postId]: !p[postId] }))
                                }
                            >
                                {showMentions[postId] ? 'Hide Mentions' : 'Show Mentions'}
                            </button>
                        )}
                        {isOwner && (
                            <button
                                className="btn btn-sm btn-outline-danger ms-auto"
                                onClick={onDelete}
                            >
                                <FaTrash /> Delete
                            </button>
                        )}
                    </div>

                    {post.mentions?.length > 0 && showMentions[postId] && (
                        <div className="mentions">
                            {renderMentionsInCard(post.mentions)}
                        </div>
                    )}
                </div>
            </div>

            {isQuoteModalOpen && (
                <div className="modal-overlay" onClick={() => setQuoteModalOpen(false)}>
                    <div className="quote-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setQuoteModalOpen(false)}>
                            ×
                        </button>
                        <div
                            className="modal-quote-text"
                            style={{
                                fontSize: `${quoteFontSize}px`,
                                fontFamily: post.style?.fontFamily || 'inherit',
                                color: post.style?.fontColor || '#000'
                            }}
                        >
                            "{rawQuote}"
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExperienceCard;