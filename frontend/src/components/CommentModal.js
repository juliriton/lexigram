import React, { useState, useEffect } from 'react';
import { FaComment, FaTimes } from 'react-icons/fa';
import '../styles/CommentModal.css';

const CommentModal = ({ isOpen, onClose, experience, user, baseApiUrl, formatDate, onActionComplete }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && experience) {
            console.log("Modal opened for experience:", experience.uuid);
            resetModal();
            fetchComments(true);
        }
    }, [isOpen, experience]);

    const resetModal = () => {
        setComments([]);
        setPage(0);
        setHasMore(true);
        setError(null);
        setNewComment('');
    };

    const fetchComments = async (reset = false) => {
        if (!experience?.uuid) {
            console.log("No experience UUID available");
            return;
        }

        const pageToFetch = reset ? 0 : page;
        console.log(`Fetching comments for page ${pageToFetch}`);

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${baseApiUrl}/api/experience/${experience.uuid}/comments/paginated?page=${pageToFetch}&size=10`,
                {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched comments:", data);
                console.log("Number of comments received:", data.length);

                setComments(prev => {
                    const newComments = reset ? data : [...prev, ...data];
                    console.log("Updated comments state:", newComments);
                    return newComments;
                });

                setHasMore(data.length === 10);
                setPage(prev => reset ? 1 : prev + 1);
            } else {
                console.error("Failed to fetch comments:", response.status);
                const errorText = await response.text();
                console.error("Error response:", errorText);
                setError(`Failed to load comments: ${response.status}`);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
            setError("Error loading comments. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user || submitting) return;

        console.log("Submitting comment for user:", user);
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${baseApiUrl}/api/auth/me/experience/${experience.uuid}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: newComment.trim(),
                    experienceUuid: experience.uuid
                }),
            });

            console.log("Comment submission response status:", response.status);

            if (response.ok) {
                const updatedExperience = await response.json();
                console.log("Comment posted successfully, updated experience:", updatedExperience);
                setNewComment('');

                // Reset and refresh comments
                resetModal();
                await fetchComments(true);

                if (onActionComplete) {
                    onActionComplete(updatedExperience);
                }
            } else if (response.status === 401) {
                setError("You need to be logged in to comment. Please refresh the page and log in again.");
            } else {
                console.error('Failed to post comment:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setError(`Failed to post comment: ${response.status}`);
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            setError("Error posting comment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderComment = (comment, isReply = false) => {
        if (!comment) return null;

        return (
            <div key={comment.uuid} className={`comment ${isReply ? 'comment-reply' : ''}`}>
                <div className="comment-header">
                    <div className="comment-user">
                        <strong>@{comment.user?.username || 'Anonymous'}</strong>
                        <span className="comment-date">
                            {comment.creationDate ? formatDate(comment.creationDate) : 'Unknown date'}
                        </span>
                    </div>
                </div>

                <div className="comment-content">
                    {comment.content}
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies">
                        {comment.replies.map(reply => renderComment(reply, true))}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="comments-modal" onClick={e => e.stopPropagation()}>
                <div className="comments-modal-header">
                    <h3>
                        <FaComment /> Comments ({experience?.commentAmount || 0})
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="comments-modal-body">
                    {error && (
                        <div className="error-message">
                            {error}
                            <button
                                className="retry-btn"
                                onClick={() => {
                                    setError(null);
                                    fetchComments(true);
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {loading && comments.length === 0 ? (
                        <div className="loading">Loading comments...</div>
                    ) : comments.length === 0 && !loading && !error ? (
                        <div className="no-comments">
                            <FaComment size={48} />
                            <p>No comments yet. Be the first to comment!</p>
                        </div>
                    ) : (
                        <>
                            <div className="comments-list">
                                {comments.map(comment => renderComment(comment))}
                            </div>
                            {hasMore && !loading && (
                                <div className="load-more-container" style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => fetchComments()}
                                        disabled={loading}
                                    >
                                        Load more comments
                                    </button>
                                </div>
                            )}
                            {loading && comments.length > 0 && (
                                <div className="loading" style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    Loading more comments...
                                </div>
                            )}
                        </>
                    )}
                </div>

                {user && (
                    <div className="comments-modal-footer">
                        <form onSubmit={handleSubmitComment} className="comment-form">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="comment-textarea"
                                rows="3"
                                maxLength={500}
                            />
                            <div className="comment-form-actions">
                                <span className="char-count">
                                    {newComment.length}/500
                                </span>
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submitting}
                                    className="btn btn-primary"
                                >
                                    {submitting ? 'Posting...' : 'Comment'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {!user && (
                    <div className="comments-modal-footer">
                        <div className="login-prompt">
                            <p>
                                <a href="/login">Log in</a> to comment on this experience.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentModal;