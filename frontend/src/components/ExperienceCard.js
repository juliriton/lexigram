import React, { useState } from 'react';
import { FaQuoteLeft, FaEllipsisH, FaUser, FaTag, FaUserTag, FaEdit, FaTrash } from 'react-icons/fa';
import EditExperienceModal from './EditExperienceModal';
import '../styles/ExperienceCard.css';

const ExperienceCard = ({
                            user,
                            post,
                            baseApiUrl,
                            username,
                            hiddenQuotes,
                            toggleQuote,
                            showMentions,
                            setShowMentions,
                            renderMentions,
                            renderTags,
                            formatDate,
                            onDelete,
                            isOwner
                        }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updatedPost, setUpdatedPost] = useState(post);

    const toggleMentions = (id) => {
        setShowMentions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleOptions = (e) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowOptions(false);
        setShowEditModal(true);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowOptions(false);
        onDelete();
    };

    const handlePostUpdate = (updatedExperience) => {
        setUpdatedPost(updatedExperience);
    };

    return (
        <div className="post-card">
            {showEditModal && (
                <EditExperienceModal
                    experience={updatedPost}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handlePostUpdate}
                    baseApiUrl={baseApiUrl}
                />
            )}

            <div className="post-header">
                <div className="post-type">Experience</div>
                <div className="post-date">{formatDate(updatedPost.creationDate)}</div>

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
                                <button onClick={handleEdit} className="option-item">
                                    <FaEdit /> Edit
                                </button>
                                <button onClick={handleDelete} className="option-item delete">
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="post-content">
                <div className="quote-container">
                    <div className="quote-header" onClick={() => toggleQuote(updatedPost.uuid)}>
                        <FaQuoteLeft className="quote-icon" />
                        <h4 className="section-title">Quote</h4>
                    </div>

                    <div className={`quote-text ${hiddenQuotes[updatedPost.uuid] ? 'truncated' : ''}`}>
                        {updatedPost.quote}
                    </div>
                </div>

                <div className="reflection-container">
                    <h4 className="section-title">Reflection</h4>
                    <div className="reflection-text">
                        {updatedPost.reflection}
                    </div>
                </div>

                {updatedPost.tags && updatedPost.tags.length > 0 && (
                    <div className="post-tags">
                        <div className="tags-header">
                            <FaTag className="tag-icon" />
                            <h4 className="section-title">Tags</h4>
                        </div>
                        <div className="tags-content">
                            {renderTags(updatedPost.tags)}
                        </div>
                    </div>
                )}

                {updatedPost.mentions && updatedPost.mentions.length > 0 && (
                    <div className="post-mentions-container">
                        <div
                            className="mentions-header"
                            onClick={() => toggleMentions(updatedPost.uuid)}
                        >
                            <FaUserTag className="mention-icon" />
                            <h4 className="section-title">Mentions</h4>
                        </div>
                        {renderMentions(updatedPost.mentions, updatedPost.uuid)}
                    </div>
                )}
            </div>

            <div className="post-stats">
                <div className="stat-item">
                    <span className="stat-label">Resonates:</span>
                    <span className="stat-value">{updatedPost.resonatesAmount}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Comments:</span>
                    <span className="stat-value">{updatedPost.commentAmount}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Saved:</span>
                    <span className="stat-value">{updatedPost.saveAmount}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Branches:</span>
                    <span className="stat-value">{updatedPost.branchAmount}</span>
                </div>
            </div>
        </div>
    );
};

export default ExperienceCard;