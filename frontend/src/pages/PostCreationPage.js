import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhotoVideo, FaQuestion } from 'react-icons/fa';
import '../styles/PostCreationPage.css';

const PostCreationPage = ({ user }) => {
    const navigate = useNavigate();
    const [activeForm, setActiveForm] = useState('experience');

    const [quote, setQuote] = useState('');
    const [reflection, setReflection] = useState('');
    const [mentions, setMentions] = useState('');
    const [tags, setTags] = useState('');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState(14);
    const [fontColor, setFontColor] = useState('#000000');
    const [file, setFile] = useState(null);
    const [allowComments, setAllowComments] = useState(true);
    const [allowResonates, setAllowResonates] = useState(true);
    const [allowForks, setAllowForks] = useState(true);

    // Suggestion states
    const [suggestionText, setSuggestionText] = useState('');
    const [suggestionTags, setSuggestionTags] = useState('');

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const mentionArray = mentions.split(',').map(m => m.trim().replace('@', '')).filter(m => m !== '');

        const post = {
            quote,
            reflection,
            isOrigin: true,
            tags: tagArray,
            mentions: mentionArray,
            privacySettings: {
                allowComments,
                allowForks,
                allowResonates
            },
            style: {
                fontFamily,
                fontSize,
                fontColor,
                textPositionX: 0,
                textPositionY: 0
            }
        };

        const formData = new FormData();
        formData.append('post', new Blob([JSON.stringify(post)], { type: 'application/json' }));
        if (file) formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/auth/me/post/experience', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                alert('Post created!');
                navigate('/');
            } else {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                alert('Error creating post');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        if (!suggestionText.trim()) {
            alert('Please provide a suggestion!');
            return;
        }

        const tagArray = suggestionTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        const suggestionPayload = {
            body: suggestionText,
            tags: tagArray,
        };

        try {
            const response = await fetch('http://localhost:8080/api/auth/me/post/suggestion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(suggestionPayload),
                credentials: 'include',
            });

            if (response.ok) {
                alert('Suggestion submitted!');
                navigate('/'); // ✅ Go to HomePage
            } else {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                alert('Error submitting suggestion');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="post-creation-container">
            <div className="form-toggle-buttons">
                <div
                    className={`toggle-button ${activeForm === 'experience' ? 'active' : ''}`}
                    onClick={() => setActiveForm('experience')}
                >
                    <FaPhotoVideo size={18} />
                    <span>Experience</span>
                </div>
                <div
                    className={`toggle-button ${activeForm === 'suggestion' ? 'active' : ''}`}
                    onClick={() => setActiveForm('suggestion')}
                >
                    <FaQuestion size={18} />
                    <span>Suggestion</span>
                </div>
            </div>

            {activeForm === 'experience' && (
                <>
                    <h2>Create a New Experience</h2>
                    <form onSubmit={handlePostSubmit} className="form-section">
                        <textarea placeholder="Quote" value={quote} onChange={(e) => setQuote(e.target.value)} required />
                        <textarea placeholder="Reflection" value={reflection} onChange={(e) => setReflection(e.target.value)} />
                        <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                        <input type="text" placeholder="Mentions (e.g. @user1, @user2)" value={mentions} onChange={(e) => setMentions(e.target.value)} />

                        <div className="style-controls">
                            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                            </select>
                            <input type="number" value={fontSize} min={8} onChange={(e) => setFontSize(parseInt(e.target.value))} />
                            <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
                        </div>

                        <input type="file" accept="image/jpeg,video/mp4,video/webm,image/gif" onChange={(e) => setFile(e.target.files[0])} />

                        <div className="checkbox-group">
                            <label><input type="checkbox" checked={allowComments} onChange={() => setAllowComments(!allowComments)} /> Comments</label>
                            <label><input type="checkbox" checked={allowResonates} onChange={() => setAllowResonates(!allowResonates)} /> Resonates</label>
                            <label><input type="checkbox" checked={allowForks} onChange={() => setAllowForks(!allowForks)} /> Forks</label>
                        </div>
                        <button type="submit" className="submit-btn" disabled={!quote.trim()}>Share Experience</button>
                    </form>
                </>
            )}

            {activeForm === 'suggestion' && (
                <>
                    <h2>Submit a Suggestion</h2>
                    <form onSubmit={handleSuggestionSubmit} className="form-section">
                        <textarea placeholder="Write your suggestion..." value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} required />
                        <input type="text" placeholder="Tags (comma separated)" value={suggestionTags} onChange={(e) => setSuggestionTags(e.target.value)} />
                        <button type="submit" className="submit-btn" disabled={!suggestionText.trim()}>Share Suggestion</button>
                    </form>
                </>
            )}
        </div>
    );
};

export default PostCreationPage;
