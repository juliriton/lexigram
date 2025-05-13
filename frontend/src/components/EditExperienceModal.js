import React, { useState, useEffect } from 'react';
import { FaTimes, FaTag, FaEdit, FaUserTag } from 'react-icons/fa';
import '../styles/EditPostModal.css';

const EditExperienceModal = ({ experience, onClose, onUpdate, baseApiUrl }) => {
    const [activeTab, setActiveTab] = useState('quote');
    const [quote, setQuote] = useState(experience.quote || '');
    const [reflection, setReflection] = useState(experience.reflection || '');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [mentions, setMentions] = useState([]);
    const [mentionInput, setMentionInput] = useState('');
    const [ setMentionResults] = useState([]);
    const [errors, setErrors] = useState({
        quote: null,
        reflection: null,
        tags: null,
        mentions: null
    });
    const [success, setSuccess] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Initialize tags from experience
        if (experience.tags && Array.isArray(experience.tags)) {
            setTags(experience.tags.map(tag =>
                typeof tag === 'string' ? tag : tag.name
            ));
        }

        // Initialize mentions from experience
        if (experience.mentions && Array.isArray(experience.mentions)) {
            setMentions(experience.mentions);
        }
    }, [experience]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Clear success message when changing tabs
        setSuccess(null);
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
            setErrors({...errors, tags: null}); // Clear any tag errors
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag =>
            (typeof tag === 'string' ? tag : tag.name) !==
            (typeof tagToRemove === 'string' ? tagToRemove : tagToRemove.name)
        ));
    };

    // Add direct mention from input (similar to post creation page)
    const handleAddDirectMention = () => {
        if (mentionInput.trim() === '') return;

        // Clear any previous errors
        setErrors({...errors, mentions: null});

        // Clean up the username (remove @ if present)
        const username = mentionInput.trim().replace(/^@/, '');

        // Check if already mentioned by username
        if (mentions.some(m => m.username === username)) {
            setMentionInput('');
            return;
        }

        // Fetch the user by username
        fetch(`${baseApiUrl}/api/auth/me/users/${encodeURIComponent(username)}`, {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('User not found');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const user = data[0];
                    if (!mentions.some(m => m.uuid === user.uuid)) {
                        setMentions([...mentions, user]);
                    }
                } else if (data && data.username) {
                    if (!mentions.some(m => m.uuid === data.uuid)) {
                        setMentions([...mentions, data]);
                    }
                } else {
                    setErrors({...errors, mentions: "User not found"});
                }
                setMentionInput('');

                setMentionResults([]);
            })
            .catch(err => {
                console.error("Error adding mention:", err);
                setMentionInput('');
            });
    };

    const handleRemoveMention = (userUuid) => {
        setMentions(mentions.filter(m => m.uuid !== userUuid));
    };

    const validateField = (field, value) => {
        switch (field) {
            case 'quote':
                return value.trim() === '' ? "Quote cannot be empty. Please enter a quote." : null;
            default:
                return null;
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSuccess(null);

        const quoteError = validateField('quote', quote);
        if (quoteError) {
            setErrors({...errors, quote: quoteError});
            setIsSaving(false);
            return;
        }

        try {
            let hasUpdated = false;
            let updateErrors = {};

            // Update quote if changed
            if (quote !== experience.quote) {
                try {
                    const quoteRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/experience/${experience.uuid}/quote`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            uuid: experience.uuid,
                            quote: quote
                        })
                    });

                    if (!quoteRes.ok) {
                        updateErrors.quote = 'Failed to update quote';
                    } else {
                        hasUpdated = true;
                    }
                } catch (err) {
                    updateErrors.quote = 'Error updating quote';
                }
            }

            // Update reflection if changed
            if (reflection !== experience.reflection) {
                try {
                    const reflectionRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/experience/${experience.uuid}/reflection`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            uuid: experience.uuid,
                            reflection: reflection
                        })
                    });

                    if (!reflectionRes.ok) {
                        updateErrors.reflection = 'Failed to update reflection';
                    } else {
                        hasUpdated = true;
                    }
                } catch (err) {
                    updateErrors.reflection = 'Error updating reflection';
                }
            }

            // Update tags if changed
            const currentTags = experience.tags.map(tag =>
                typeof tag === 'string' ? tag : tag.name
            );
            if (JSON.stringify(tags.sort()) !== JSON.stringify(currentTags.sort())) {
                try {
                    const tagsRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/experience/${experience.uuid}/tags`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            tags: tags
                        })
                    });

                    if (!tagsRes.ok) {
                        updateErrors.tags = 'Failed to update tags';
                    } else {
                        hasUpdated = true;
                    }
                } catch (err) {
                    updateErrors.tags = 'Error updating tags';
                }
            }

            // Update mentions if changed
            const currentMentionUuids = experience.mentions?.map(m => m.uuid) || [];
            const newMentionUuids = mentions.map(m => m.uuid);
            if (JSON.stringify(newMentionUuids.sort()) !== JSON.stringify(currentMentionUuids.sort())) {
                try {
                    const mentionsRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/experience/${experience.uuid}/mentions`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            mentions: mentions.map(m => m.username)
                        })
                    });

                    if (!mentionsRes.ok) {
                        updateErrors.mentions = 'Failed to update mentions';
                    } else {
                        hasUpdated = true;
                    }
                } catch (err) {
                    updateErrors.mentions = 'Error updating mentions';
                }
            }

            // Set any errors that occurred
            if (Object.keys(updateErrors).length > 0) {
                setErrors({...errors, ...updateErrors});
            }

            if (hasUpdated) {
                setSuccess("Experience updated successfully!");
                // Update the experience in the parent component
                onUpdate({
                    ...experience,
                    quote: quote,
                    reflection: reflection,
                    tags: tags.map(tag => typeof tag === 'string' ? { name: tag } : tag),
                    mentions: mentions
                });

                // Close modal after short delay to show success message
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else if (Object.keys(updateErrors).length === 0) {
                setSuccess("No changes detected.");
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
        } catch (err) {
            console.error("Error updating experience:", err);
            setErrors({...errors, general: err.message || "Failed to update experience. Please try again."});
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="edit-modal-backdrop">
            <div className="edit-experience-modal">
                <div className="edit-modal-header">
                    <h2>Edit Experience</h2>
                    <button className="close-modal-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="form-toggle-buttons">
                    <div
                        className={`toggle-button ${activeTab === 'quote' ? 'active' : ''}`}
                        onClick={() => handleTabChange('quote')}
                    >
                        <FaEdit />
                        <span>Quote</span>
                    </div>
                    <div
                        className={`toggle-button ${activeTab === 'reflection' ? 'active' : ''}`}
                        onClick={() => handleTabChange('reflection')}
                    >
                        <FaEdit />
                        <span>Reflection</span>
                    </div>
                    <div
                        className={`toggle-button ${activeTab === 'tags' ? 'active' : ''}`}
                        onClick={() => handleTabChange('tags')}
                    >
                        <FaTag />
                        <span>Tags</span>
                    </div>
                    <div
                        className={`toggle-button ${activeTab === 'mentions' ? 'active' : ''}`}
                        onClick={() => handleTabChange('mentions')}
                    >
                        <FaUserTag />
                        <span>Mentions</span>
                    </div>
                </div>

                {errors.general && (
                    <div className="alert alert-error">
                        {errors.general}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <div className="form-section">
                    {activeTab === 'quote' && (
                        <div className="quote-section">
                            <label htmlFor="quote">Quote</label>
                            <textarea
                                id="quote"
                                value={quote}
                                onChange={(e) => {
                                    setQuote(e.target.value);
                                    const error = validateField('quote', e.target.value);
                                    setErrors({...errors, quote: error});
                                }}
                                placeholder="Enter a quote..."
                                rows={4}
                                required
                            />
                            <small>This field is required</small>
                            {errors.quote && <div className="field-error">{errors.quote}</div>}
                        </div>
                    )}

                    {activeTab === 'reflection' && (
                        <div className="reflection-section">
                            <label htmlFor="reflection">Reflection</label>
                            <textarea
                                id="reflection"
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="Share your thoughts..."
                                rows={4}
                            />
                            <small>Between 10-300 characters</small>
                            {errors.reflection && <div className="field-error">{errors.reflection}</div>}
                        </div>
                    )}

                    {activeTab === 'tags' && (
                        <div className="tags-section">
                            <div className="tag-input-container">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add a tag..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                />
                                <button onClick={handleAddTag}>Add</button>
                            </div>
                            {errors.tags && <div className="field-error">{errors.tags}</div>}

                            <div className="tags-list">
                                {tags.map((tag, index) => (
                                    <div key={index} className="tag-item">
                                        <span>
                                          {typeof tag === 'string' ? tag : tag.name}
                                        </span>
                                        <button onClick={() => handleRemoveTag(tag)}>
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'mentions' && (
                        <div className="mentions-section">
                            <div className="mention-input-container">
                                <input
                                    type="text"
                                    value={mentionInput}
                                    onChange={(e) => setMentionInput(e.target.value)}
                                    placeholder="@username"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddDirectMention();
                                        }
                                    }}
                                />
                                <button onClick={handleAddDirectMention}>Add</button>
                            </div>
                            {errors.mentions && <div className="field-error">{errors.mentions}</div>}



                            <div className="mentions-list">
                                <h4>Current Mentions:</h4>
                                {mentions.length === 0 ? (
                                    <p>No mentions yet</p>
                                ) : (
                                    mentions.map((user) => (
                                        <div key={user.uuid} className="mention-item">
                                            <span>@{user.username}</span>
                                            <button onClick={() => handleRemoveMention(user.uuid)}>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-buttons">
                    <button
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        className="submit-btn"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditExperienceModal;