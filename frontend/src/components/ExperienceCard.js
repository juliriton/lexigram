import React, { useState, useMemo } from 'react';
import { FaPhotoVideo, FaTrash, FaEdit, FaEllipsisH, FaUserTag } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import {useLocation, useNavigate} from 'react-router-dom';
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

    // Get privacy settings from experience
    const privacySettings = post.privacySettings || {};
    const allowComments = privacySettings.allowComments !== false;

    // Estados para la UI
    const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updatedPost, setUpdatedPost] = useState(post);
    const [showFullRefl, setShowFullRefl] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);

    // Cálculos para el texto
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

    // Manejo de tags
    const allTags = (updatedPost.tags || []).slice(0, 20);
    const inlineTags = allTags.slice(0, 5);
    const extraTags = allTags.slice(5);

    // Manejadores de eventos
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

        // Si hay una función onEdit del padre, usarla; si no, usar la lógica interna
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

    const handlePostUpdate = (updatedExperience) => {
        setUpdatedPost(updatedExperience);
        // Si hay callback del padre, llamarlo también
        if (onActionComplete) {
            onActionComplete(updatedExperience);
        }
    };

    const navigateToUserProfile = () => {
        const targetUuid = post.user.uuid;
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
        if (onActionComplete) {
            onActionComplete(updatedExperience);
        }
        setUpdatedPost(updatedExperience);
    };

    const renderMentions = (mentions) => {
        if (!Array.isArray(mentions) || mentions.length === 0) {
            return null;
        }

        return (
            <div className="post-mentions">
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
            <div className="experience-card"
                 style={{ cursor: disablePopup ? 'default' : 'pointer' }}>
                {/* Modal de edición interno - solo se muestra si no hay onEdit del padre */}
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
                                <FaPhotoVideo /> Experience
                            </span>
                            {updatedPost.origin && (
                                <span className="badge orig-badge">
                                    <FaStar /> Origin
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
                                    <FaEllipsisH />
                                </button>

                                {showOptions && (
                                    <div className="options-dropdown">
                                        {/* Solo mostrar botón de editar si showEditOption es true O si hay onEdit */}
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
                                {inlineTags.map((t, i) => <span key={i} className="tag">#{t.name}</span>)}
                                {showAllTags && extraTags.map((t, i) =>
                                    <span key={i + 5} className="tag">#{t.name}</span>
                                )}
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
                        {updatedPost.mentions?.length > 0 && (
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
                    </div>

                    {updatedPost.mentions?.length > 0 && showMentions[postId] && (
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

            {/* Original Quote Modal */}
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