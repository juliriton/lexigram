import React from 'react';
import { FaPhotoVideo } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import '../styles/ExperienceCard.css';

const ExperienceCard = ({
                            post,
                            baseApiUrl,
                            hiddenQuotes,
                            toggleQuote,
                            showMentions,
                            setShowMentions,
                            renderMentions,
                            renderTags,
                            formatDate,
                        }) => {
    const postId = post.uuid || post.id;
    const isQuoteHidden = hiddenQuotes[postId];
    const mediaUrl = post.style?.backgroundMediaUrl || post.imageUrl;
    const fullMediaUrl = mediaUrl ? `${baseApiUrl}${mediaUrl}` : null;
    const isVideo = url => url?.match(/\.(mp4|webm|ogg)$/i);

    return (
        <div className="experience-card">
            <div className="experience-media-wrapper">
                {fullMediaUrl && (
                    isVideo(mediaUrl)
                        ? <video src={fullMediaUrl} autoPlay muted loop className="experience-media" />
                        : <div
                            className={`experience-media ${isQuoteHidden ? '' : 'blurred'}`}
                            style={{ backgroundImage: `url(${fullMediaUrl})` }}
                        />
                )}

                {!isQuoteHidden && (
                    <div
                        className="experience-quote-overlay"
                        style={{
                            position: 'absolute',
                            left: `${post.style?.textPositionX || 50}%`,
                            top: `${post.style?.textPositionY || 50}%`,
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            width: '80%',
                        }}
                    >
                        <div
                            className="experience-quote"
                            style={{
                                fontFamily: post.style?.fontFamily || 'inherit',
                                fontSize: post.style?.fontSize ? `${post.style.fontSize}px` : '1.5rem',
                                color: post.style?.fontColor || '#fff',
                            }}
                        >
                            "{post.quote || post.title}"
                        </div>
                    </div>
                )}
            </div>

            <div className="experience-card-content">
                <div className="badges-container">
                    <div className="badge experience-badge">
                        <FaPhotoVideo className="badge-icon" />
                        <span> Experience</span>
                    </div>

                    {post.origin && (
                        <div className="badge origin-badge">
                            <FaStar className="badge-icon" />
                            <span> Origin</span>
                        </div>
                    )}
                </div>

                <h3 className="experience-card-title">{post.title}</h3>
                <p className="experience-card-reflection">{post.reflection || post.content}</p>

                <div className="experience-card-footer">
                    {post.creationDate && (
                        <small className="post-date">{formatDate(post.creationDate)}</small>
                    )}
                    {post.tags?.length > 0 && (
                        <div className="post-tags">{renderTags(post.tags)}</div>
                    )}
                </div>

                <div className="experience-card-actions">
                    <button
                        className="btn-toggle-quote"
                        onClick={() => toggleQuote(postId)}
                    >
                        {isQuoteHidden ? 'Show Quote' : 'Hide Quote'}
                    </button>

                    {post.mentions?.length > 0 && (
                        <button
                            className="btn-mentions"
                            onClick={() => setShowMentions(prev => ({
                                ...prev,
                                [postId]: !prev[postId]
                            }))}
                        >
                            {showMentions[postId] ? 'Hide Mentions' : 'Show Mentions'}
                        </button>
                    )}
                </div>

                {post.mentions?.length > 0 && showMentions[postId] && (
                    <div className="mentions-container">
                        {renderMentions(post.mentions, postId)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExperienceCard;
