import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import ExperienceCard from './ExperienceCard';
import SuggestionCard from './SuggestionCard';

const PostPopupModal = ({
                            isOpen,
                            onClose,
                            postUuid,
                            type,
                            user,
                            baseApiUrl,
                            formatDate
                        }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hiddenQuotes, setHiddenQuotes] = useState({});
    const [showMentions, setShowMentions] = useState({});

    useEffect(() => {
        if (isOpen && postUuid) {
            fetchPost();
        }
    }, [isOpen, postUuid, type]);

    const fetchPost = async () => {
        setLoading(true);
        setError(null);

        try {
            // Determine endpoint based on post type
            let endpoint;
            if (type === 'Suggestion') {
                endpoint = `${baseApiUrl}/api/auth/me/suggestion/${postUuid}`;
            } else {
                endpoint = `${baseApiUrl}/api/auth/me/experience/${postUuid}`;
            }

            let options = {};
            options.credentials = 'include';

            const response = await fetch(endpoint, options);

            if (response.ok) {
                const postData = await response.json();
                setPost(postData);
            } else if (response.status === 404) {
                setError('Post not found');
            } else if (response.status === 401) {
                setError('Unauthorized - please log in');
            } else {
                setError('Failed to load post');
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleMentionClick = (mentionUuid) => {
        // Close modal and navigate
        onClose();
        if (!user) {
            window.location.href = '/login';
            return;
        }
        window.location.href = `/profile/${mentionUuid}`;
    };

    const renderTags = (tags) => (
        Array.isArray(tags) && tags.map((tag, i) => (
            <span key={i} className="tag-badge">
                {typeof tag === 'object' ? tag.name : tag}
            </span>
        ))
    );

    const handleActionComplete = (updatedPost) => {
        setPost(updatedPost);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div
                className="post-popup-content"
                onClick={e => e.stopPropagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                }}
            >
                <button
                    className="modal-close-btn"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 1001,
                        color: '#666',
                        padding: '5px'
                    }}
                >
                    <FaTimes />
                </button>

                {loading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 20px',
                        color: '#666'
                    }}>
                        <FaSpinner className="fa-spin" size={30} />
                        <p style={{ marginTop: '15px' }}>Loading post...</p>
                    </div>
                )}

                {error && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 20px',
                        color: '#dc3545'
                    }}>
                        <p>{error}</p>
                        <button
                            onClick={fetchPost}
                            style={{
                                marginTop: '15px',
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {post && !loading && !error && (
                    <div style={{ padding: '20px' }}>
                        {(post.type === 'Experience' || type === 'Experience') ? (
                            <ExperienceCard
                                user={user}
                                post={post}
                                baseApiUrl={baseApiUrl}
                                username={post.user?.username || 'User'}
                                hiddenQuotes={hiddenQuotes}
                                toggleQuote={id => setHiddenQuotes(prev => ({ ...prev, [id]: !prev[id] }))}
                                showMentions={showMentions}
                                setShowMentions={setShowMentions}
                                renderMentions={(mentions, id) => (
                                    showMentions[id] && (
                                        <div className="post-mentions">
                                            <h6>Mentions:</h6>
                                            <div className="mentions-list">
                                                {mentions.map((mention, i) => (
                                                    <span
                                                        key={i}
                                                        className="mention clickable"
                                                        onClick={() => handleMentionClick(mention.uuid)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: '#0d6efd',
                                                            textDecoration: 'underline'
                                                        }}
                                                    >
                                                        @{mention.username}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}
                                renderTags={renderTags}
                                formatDate={formatDate}
                                disablePopup={true}
                                isOwner={user && post.user && user.uuid === post.user.uuid}
                                onActionComplete={handleActionComplete}
                            />
                        ) : (
                            <SuggestionCard
                                user={user}
                                post={post}
                                baseApiUrl={baseApiUrl}
                                username={post.user?.username || 'User'}
                                renderTags={renderTags}
                                formatDate={formatDate}
                                isOwner={user && post.user && user.uuid === post.user.uuid}
                                onActionComplete={handleActionComplete}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostPopupModal;