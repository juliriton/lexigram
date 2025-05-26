import React, { useState, useEffect } from 'react';
import { FaTimes, FaTag } from 'react-icons/fa';
import '../styles/EditPostModal.css';

const EditSuggestionModal = ({ suggestion, onClose, onUpdate, baseApiUrl }) => {
    const [activeTab, setActiveTab] = useState('tags');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({
        tags: null,
    });
    const [success, setSuccess] = useState(null);
    const [changes, setChanges] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Initialize tags from suggestion
        if (suggestion.tags && Array.isArray(suggestion.tags)) {
            setTags(suggestion.tags.map(tag =>
                typeof tag === 'string' ? tag : tag.name
            ));
        }
    }, [suggestion]);

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

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSuccess(null);
        setChanges([]);

        try {
            let hasUpdated = false;
            let updateErrors = {};
            let changesList = [];

            // Update tags if changed
            const currentTags = suggestion.tags?.map(tag =>
                typeof tag === 'string' ? tag : tag.name
            ) || [];

            if (JSON.stringify(tags.sort()) !== JSON.stringify(currentTags.sort())) {
                try {
                    const tagsRes = await fetch(`${baseApiUrl}/api/auth/me/profile/edit/suggestion/${suggestion.uuid}/tags`, {
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
                        changesList.push({
                            field: 'Tags',
                            previous: currentTags.join(', ') || '(none)',
                            new: tags.join(', ') || '(none)'
                        });
                    }
                } catch (err) {
                    updateErrors.tags = 'Error updating tags';
                }
            }

            // Set any errors that occurred
            if (Object.keys(updateErrors).length > 0) {
                setErrors({...errors, ...updateErrors});
            }

            if (hasUpdated) {
                setChanges(changesList);
                setSuccess("Suggestion updated successfully!");

                onUpdate({
                    ...suggestion,
                    tags: tags.map(tag => typeof tag === 'string' ? { name: tag } : tag),
                });

                // Close modal after short delay to show success message
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else if (Object.keys(updateErrors).length === 0) {
                setSuccess("No changes detected.");
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
        } catch (err) {
            console.error("Error updating suggestion:", err);
            setErrors({...errors, general: err.message || "Failed to update suggestion. Please try again."});
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="edit-modal-backdrop">
            <div className="edit-experience-modal">
                <div className="edit-modal-header">
                    <h2>Edit Suggestion</h2>
                    <button className="close-modal-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="form-toggle-buttons">
                    <div
                        className={`toggle-button ${activeTab === 'tags' ? 'active' : ''}`}
                        onClick={() => handleTabChange('tags')}
                    >
                        <FaTag />
                        <span>Tags</span>
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

                {changes.length > 0 && (
                    <div className="changes-summary">
                        <h3>Changes Made:</h3>
                        {changes.map((change, index) => (
                            <div key={index} className="change-item">
                                <strong>{change.field}:</strong>
                                <div className="change-details">
                                    <div className="previous-value">
                                        <span className="label">Previous:</span>
                                        <span className="value">{change.previous}</span>
                                    </div>
                                    <div className="new-value">
                                        <span className="label">New:</span>
                                        <span className="value">{change.new}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="form-section">
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

export default EditSuggestionModal;