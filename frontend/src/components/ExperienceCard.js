import React, { useState, useMemo, useEffect } from 'react';
import { FaPhotoVideo, FaTrash, FaEdit, FaEllipsisH, FaUserTag, FaCodeBranch, FaReply } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import { useLocation, useNavigate } from 'react-router-dom';
import EditExperienceModal from './EditExperienceModal';
import CommentModal from './CommentModal';
import ExperienceInteractions from './ExperienceInteractions';
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
                            onEdit,
                            isOwner,
                            showEditOption = false,
                            disablePopup = false,
                            onActionComplete
                        }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const postId = post.uuid;
    const isQuoteHidden = hiddenQuotes[postId];
    const mediaUrl = post.style?.backgroundMediaUrl || post.imageUrl;
    const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;
    const isVideo = url => url && /\.(mp4|webm|ogg)$/i.test(url);

    const privacySettings = post.privacySettings || {};
    const allowComments = privacySettings.allowComments !== false;

    const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updatedPost, setUpdatedPost] = useState(post);
    const [showFullRefl, setShowFullRefl] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [feedTags, setFeedTags] = useState(new Set());
    const [forksCount, setForksCount] = useState(0);

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

    const fetchForksCount = async () => {
        if (!user) return;

        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/experience/${postId}/branches`, {
                credentials: 'include'
            });

            if (response.ok) {
                const forksData = await response.json();
                // Filter out the original experience from the count
                const actualForks = Array.isArray(forksData)
                    ? forksData.filter(fork => fork.uuid !== postId)
                    : [];
                setForksCount(actualForks.length);
            }
        } catch (err) {
            console.error('Error fetching forks count:', err);
        }
    };

    useEffect(() => {
        setUpdatedPost(post);
    }, [post]);

    useEffect(() => {
        fetchFeedTags();
        fetchForksCount();
    }, [user, baseApiUrl, postId]);

    const quoteFontSize = useMemo(() => {
        const f = updatedPost.style?.fontSize || 20;
        return Math.min(Math.max(f, 8), 30);
    }, [updatedPost.style]);

    const rawQuote = updatedPost.quote || updatedPost.title || '';
    const quotePreviewLen = 30;
    const needsQuoteTruncate = rawQuote.length > quotePreviewLen;
    const quotePreview = rawQuote.slice(0, quotePreviewLen) + (needsQuoteTruncate ? '…' : '');

    const reflectionText = updatedPost.reflection || updatedPost.content || '';
    const reflPreviewLen = 20;
    const needsReflTruncate = reflectionText.length > reflPreviewLen;
    const reflPreview = reflectionText.slice(0, reflPreviewLen) + (needsReflTruncate ? '…' : '');

    const allTags = (updatedPost.tags || []).slice(0, 20);
    const inlineTags = allTags.slice(0, 5);
    const extraTags = allTags.slice(5);

    const toggleMentions = () => {
        setShowMentions(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const toggleOptions = (e) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowOptions(false);
        if (onEdit && typeof onEdit === 'function') {
            onEdit(updatedPost);
        } else {
            setShowEditModal(true);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowOptions(false);
        if (onDelete && typeof onDelete === 'function') {
            onDelete();
        }
    };

    const handleShowForks = (e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/experience/${postId}/forks`);
    };

    const handlePostUpdate = (updatedExperience, message) => {
        setUpdatedPost(updatedExperience);
        if (onActionComplete) {
            onActionComplete(updatedExperience, message);
        }
        setShowEditModal(false);
    };

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

    const handleMentionClick = (mentionUuid) => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/profile/${mentionUuid}`);
    };

    const handleExperienceInteractionComplete = (updatedExperience) => {
        setUpdatedPost(updatedExperience);
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
                setFeedTags(prev => {
                    const newSet = new Set(prev);
                    if (isInFeed) {
                        newSet.delete(tagUuid);
                    } else {
                        newSet.add(tagUuid);
                    }
                    return newSet;
                });

                if (onActionComplete) {
                    onActionComplete(updatedPost);
                }
            } else {
                alert('Failed to update tag feed');
            }
        } catch (err) {
            console.error('Error updating tag feed:', err);
            alert('Error updating tag feed');
        }
    };

    const getMentionsCount = (mentions) => {
        if (!mentions) return 0;
        return Array.isArray(mentions) ? mentions.length : mentions.size || 0;
    };

    const renderMentions = (mentions) => {
        if (!mentions) return null;
        const mentionsArray = Array.isArray(mentions) ? mentions : Array.from(mentions);

        if (mentionsArray.length === 0) {
            return null;
        }

        return (
            <div className="post-mentions">
                <div className="mentions-list">
                    {mentionsArray.map((mention, i) => (
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
            <div className="experience-card"
                 style={{ cursor: disablePopup ? 'default' : 'pointer' }}>
                {showEditModal && !onEdit && (
                    <EditExperienceModal
                        experience={updatedPost}
                        onClose={() => setShowEditModal(false)}
                        onUpdate={handlePostUpdate}
                        baseApiUrl={baseApiUrl}
                    />
                )}

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
                                alt={updatedPost.title}
                                className={`media-element ${!isQuoteHidden ? 'blur-media' : ''}`}
                            />
                        }

                        {!isQuoteHidden && (
                            <div
                                className="quote-overlay"
                                style={{
                                    left: `${updatedPost.style?.textPositionX || 50}%`,
                                    top: `${updatedPost.style?.textPositionY || 50}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div
                                    className="quote-text"
                                    style={{
                                        fontSize: `${quoteFontSize}px`,
                                        fontFamily: updatedPost.style?.fontFamily || 'inherit',
                                        color: updatedPost.style?.fontColor || '#fff'
                                    }}
                                >
                                    "{quotePreview}"
                                </div>
                                {needsQuoteTruncate && (
                                    <button
                                        className="view-full-quote-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setQuoteModalOpen(true);
                                        }}
                                    >
                                        View Full Quote
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="content">
                    <div className="header-row">
                        <div className="badges">
                            <span className="badge exp-badge">
                                <FaPhotoVideo/> Experience
                            </span>
                            {updatedPost.origin && (
                                <span className="badge orig-badge">
                                    <FaStar/> Origin
                                </span>
                            )}
                            {updatedPost.reply && (
                                <span className="badge reply-badge">
                                    <FaReply/> Reply
                                </span>
                            )}
                            {!updatedPost.origin && (
                                <span className="badge fork-badge">
                                    <FaCodeBranch/> Fork
                                </span>
                            )}
                        </div>

                        {isOwner && (
                            <div className="post-options">
                                <button
                                    className="options-btn"
                                    onClick={toggleOptions}
                                    aria-label="Post options"
                                >
                                    <FaEllipsisH/>
                                </button>

                                {showOptions && (
                                    <div className="options-dropdown">
                                        {(showEditOption || onEdit) && (
                                            <button onClick={handleEdit} className="option-item edit">
                                                <FaEdit size={14}/> <span>Edit</span>
                                            </button>
                                        )}
                                        <button onClick={handleDelete} className="option-item delete">
                                            <FaTrash size={14}/> <span>Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <h3 className="title">{updatedPost.title}</h3>

                    <div className="reflection-section">
                        <div className="reflection-text">
                            {showFullRefl ? reflectionText : reflPreview}
                        </div>
                        {needsReflTruncate && (
                            <button
                                className="show-more-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFullRefl(r => !r);
                                }}
                            >
                                {showFullRefl ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>

                    <div className="meta">
                        <button
                            className="username-link-btn clickable"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateToUserProfile();
                            }}
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

                    {allTags.length > 0 && (
                        <div className="tags-section">
                            <div className="tags-inline">
                                {inlineTags.map((t, i) => (
                                    <span key={i} className="tag">
                                        #{t.name}
                                        {user && (
                                            <button
                                                className="tag-add-btn"
                                                onClick={(e) => handleAddTagToFeed(t.uuid, feedTags.has(t.uuid), e)}
                                                title={feedTags.has(t.uuid) ? "Remove from feed" : "Add to feed"}
                                            >
                                                {feedTags.has(t.uuid) ? '-' : '+'}
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {showAllTags && extraTags.map((t, i) => (
                                    <span key={i + 5} className="tag">
                                        #{t.name}
                                        {user && (
                                            <button
                                                className="tag-add-btn"
                                                onClick={(e) => handleAddTagToFeed(t.uuid, feedTags.has(t.uuid), e)}
                                                title={feedTags.has(t.uuid) ? "Remove from feed" : "Add to feed"}
                                            >
                                                {feedTags.has(t.uuid) ? '-' : '+'}
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {extraTags.length > 0 && (
                                <button
                                    className="show-more-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAllTags(x => !x);
                                    }}
                                >
                                    {showAllTags ? 'Show less' : `+${extraTags.length} more`}
                                </button>
                            )}
                        </div>
                    )}

                    <ExperienceInteractions
                        user={user}
                        experience={updatedPost}
                        baseApiUrl={baseApiUrl}
                        onActionComplete={handleExperienceInteractionComplete}
                        onCommentClick={() => setShowCommentsModal(true)}
                    />

                    <div className="actions">
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleQuote(postId);
                            }}
                        >
                            {isQuoteHidden ? 'Show Quote' : 'Hide Quote'}
                        </button>
                        {updatedPost.mentions && getMentionsCount(updatedPost.mentions) > 0 && (
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMentions();
                                }}
                            >
                                {showMentions[postId] ? 'Hide Mentions' : 'Show Mentions'}
                            </button>
                        )}
                        {user && updatedPost.branchAmount > 0 && (
                            <button
                                className="btn btn-sm btn-outline-info"
                                onClick={handleShowForks}
                                title="View all forks of this experience"
                            >
                                <FaCodeBranch /> Show Forks
                                {forksCount > 0 && (
                                    <span className="forks-count-badge">{forksCount}</span>
                                )}
                            </button>
                        )}
                    </div>

                    {updatedPost.mentions && getMentionsCount(updatedPost.mentions) > 0 && showMentions[postId] && (
                        <div className="mentions">
                            <div className="mentions-header">
                                <FaUserTag className="mention-icon" />
                                <h6>Mentions:</h6>
                            </div>
                            {renderMentions(updatedPost.mentions)}
                        </div>
                    )}

                    {allowComments && (
                        <CommentModal
                            isOpen={showCommentsModal}
                            onClose={() => setShowCommentsModal(false)}
                            experience={updatedPost}
                            user={user}
                            baseApiUrl={baseApiUrl}
                            formatDate={formatDate}
                            onActionComplete={handleExperienceInteractionComplete}
                        />
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
                                fontFamily: updatedPost.style?.fontFamily || 'inherit',
                                color: updatedPost.style?.fontColor || '#000'
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