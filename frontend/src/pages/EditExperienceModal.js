import React, { useState, useEffect } from 'react';
import { FaTimes, FaTag, FaEdit, FaUserTag } from 'react-icons/fa';
import '../styles/EditExperienceModal.css';

const EditExperienceModal = ({ experience, onClose, onUpdate, baseApiUrl }) => {
    const [activeTab, setActiveTab] = useState('quote');
    const [quote, setQuote] = useState(experience.quote || '');
    const [reflection, setReflection] = useState(experience.reflection || '');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [mentions, setMentions] = useState([]);
    const [mentionSearchTerm, setMentionSearchTerm] = useState('');
    const [mentionResults, setMentionResults] = useState([]);
    const [error, setError] = useState(null);
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
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag =>
            (typeof tag === 'string' ? tag : tag.name) !==
            (typeof tagToRemove === 'string' ? tagToRemove : tagToRemove.name)
        ));
    };

    const handleSearchMentions = async () => {
        if (mentionSearchTerm.trim() === '') return;

        try {
            const res = await fetch(`${baseApiUrl}/api/users/search?term=${encodeURIComponent(mentionSearchTerm)}`, {
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Failed to search users');

            const data = await res.json();
            setMentionResults(data);
        } catch (err) {
            console.error("Error searching for users:", err);
            setError("Failed to search for users. Please try again.");
        }
    };

    const handleAddMention = (user) => {
        // Check if user is already mentioned
        if (!mentions.some(m => m.uuid === user.uuid)) {
            setMentions([...mentions, user]);
        }
        setMentionResults([]);
        setMentionSearchTerm('');
    };

    const handleRemoveMention = (userUuid) => {
        setMentions(mentions.filter(m => m.uuid !== userUuid));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            let hasUpdated = false;

            // Update quote if changed
            if (quote !== experience.quote) {
                const quoteRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/experience/${experience.uuid}/quote`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        uuid: experience.uuid,
                        quote: quote
                    })
                });

                if (!quoteRes.ok) throw new Error('Failed to update quote');
                hasUpdated = true;
            }

            // Update reflection if changed
            if (reflection !== experience.reflection) {
                const reflectionRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/experience/${experience.uuid}/reflection`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        uuid: experience.uuid,
                        reflection: reflection
                    })
                });

                if (!reflectionRes.ok) throw new Error('Failed to update reflection');
                hasUpdated = true;
            }

            // Update tags if changed
            const currentTags = experience.tags.map(tag =>
                typeof tag === 'string' ? tag : tag.name
            );
            if (JSON.stringify(tags.sort()) !== JSON.stringify(currentTags.sort())) {
                const tagsRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/experience/${experience.uuid}/tags`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        tags: tags
                    })
                });

                if (!tagsRes.ok) throw new Error('Failed to update tags');
                hasUpdated = true;
            }

            // Update mentions if changed
            const currentMentionUuids = experience.mentions?.map(m => m.uuid) || [];
            const newMentionUuids = mentions.map(m => m.uuid);
            if (JSON.stringify(newMentionUuids.sort()) !== JSON.stringify(currentMentionUuids.sort())) {
                const mentionsRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/experience/${experience.uuid}/mentions`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        mentions: newMentionUuids
                    })
                });

                if (!mentionsRes.ok) throw new Error('Failed to update mentions');
                hasUpdated = true;
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
            } else {
                setSuccess("No changes detected.");
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
        } catch (err) {
            console.error("Error updating experience:", err);
            setError(err.message || "Failed to update experience. Please try again.");
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

                {error && (
                    <div className="alert alert-error">
                        {error}
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
                                onChange={(e) => setQuote(e.target.value)}
                                placeholder="Enter a quote..."
                                rows={4}
                            />
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
                            <div className="mention-search-container">
                                <input
                                    type="text"
                                    value={mentionSearchTerm}
                                    onChange={(e) => setMentionSearchTerm(e.target.value)}
                                    placeholder="Search for users to mention..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearchMentions();
                                        }
                                    }}
                                />
                                <button onClick={handleSearchMentions}>Search</button>
                            </div>

                            {mentionResults.length > 0 && (
                                <div className="mention-results">
                                    {mentionResults.map((user) => (
                                        <div
                                            key={user.uuid}
                                            className="mention-result-item"
                                            onClick={() => handleAddMention(user)}
                                        >
                                            <span>@{user.username}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

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