import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhotoVideo, FaQuestion, FaTimes } from 'react-icons/fa';
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
    const [suggestionText, setSuggestionText] = useState('');
    const [suggestionTags, setSuggestionTags] = useState('');

    // Para mostrar error si fontSize queda fuera de rango
    const [fontSizeError, setFontSizeError] = useState('');

    const handleCancel = () => {
        navigate('/');
    };

    // Clampa el valor entre min y max, y actualiza el error
    const handleFontSizeChange = e => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 8;
        if (val < 8) {
            val = 8;
            setFontSizeError('Font size mínimo es 8');
        } else if (val > 30) {
            val = 30;
            setFontSizeError('Font size máximo es 30');
        } else {
            setFontSizeError('');
        }
        setFontSize(val);
    };

    const handlePostSubmit = async e => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        // Validación final por si acaso
        if (fontSize < 8 || fontSize > 30) return;

        const tagArray     = tags.split(',').map(t => t.trim()).filter(t => t);
        const mentionArray = mentions.split(',').map(m => m.trim().replace('@','')).filter(m => m);

        const postObj = {
            quote,
            reflection,
            isOrigin: true,
            tags: tagArray,
            mentions: mentionArray,
            privacySettings: { allowComments, allowForks, allowResonates },
            style: {
                fontFamily,
                fontSize,
                fontColor,
                textPositionX: 0,
                textPositionY: 0
            }
        };

        const formData = new FormData();
        formData.append('post', new Blob([JSON.stringify(postObj)], { type: 'application/json' }));
        if (file) formData.append('file', file);

        try {
            const resp = await fetch('http://localhost:8080/api/auth/me/post/experience', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            if (resp.ok) navigate('/');
            else console.error('Server error:', await resp.text());
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleSuggestionSubmit = async e => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (!suggestionText.trim()) return;

        const tagArray = suggestionTags
            .split(',')
            .map(t => t.trim())
            .filter(t => t);

        try {
            const resp = await fetch('http://localhost:8080/api/auth/me/post/suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: suggestionText, tags: tagArray }),
                credentials: 'include'
            });
            if (resp.ok) navigate('/');
            else console.error('Server error:', await resp.text());
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <div className="post-creation-container">
            <div className="form-toggle-buttons">
                <div
                    className={`toggle-button ${activeForm==='experience'?'active':''}`}
                    onClick={()=>setActiveForm('experience')}
                >
                    <FaPhotoVideo size={18}/> <span>Experience</span>
                </div>
                <div
                    className={`toggle-button ${activeForm==='suggestion'?'active':''}`}
                    onClick={()=>setActiveForm('suggestion')}
                >
                    <FaQuestion size={18}/> <span>Suggestion</span>
                </div>
            </div>

            {activeForm==='experience' && (
                <>
                    <h2>Create a New Experience</h2>
                    <form onSubmit={handlePostSubmit} className="form-section">

            <textarea
                placeholder="Quote"
                value={quote}
                onChange={e=>setQuote(e.target.value)}
                required
            />

                        <textarea
                            placeholder="Reflection"
                            value={reflection}
                            onChange={e=>setReflection(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Tags (comma separated)"
                            value={tags}
                            onChange={e=>setTags(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Mentions (e.g. @user1, @user2)"
                            value={mentions}
                            onChange={e=>setMentions(e.target.value)}
                        />

                        <div className="style-controls">
                            <select
                                value={fontFamily}
                                onChange={e=>setFontFamily(e.target.value)}
                            >
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                {/* añade más si quieres */}
                            </select>

                            <input
                                type="number"
                                value={fontSize}
                                min={8}
                                max={30}
                                onChange={handleFontSizeChange}
                            />
                            {fontSizeError && (
                                <div className="error-text">{fontSizeError}</div>
                            )}

                            <input
                                type="color"
                                value={fontColor}
                                onChange={e=>setFontColor(e.target.value)}
                            />
                        </div>

                        <input
                            type="file"
                            accept="image/jpeg,video/mp4,video/webm,image/gif"
                            onChange={e=>setFile(e.target.files[0])}
                        />

                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={allowComments}
                                    onChange={()=>setAllowComments(c=>!c)}
                                /> Comments
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={allowResonates}
                                    onChange={()=>setAllowResonates(r=>!r)}
                                /> Resonates
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={allowForks}
                                    onChange={()=>setAllowForks(f=>!f)}
                                /> Forks
                            </label>
                        </div>

                        <div className="form-buttons">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!quote.trim()}
                            >
                                Share Experience
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={handleCancel}
                            >
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </form>
                </>
            )}

            {activeForm==='suggestion' && (
                <>
                    <h2>Submit a Suggestion</h2>
                    <form onSubmit={handleSuggestionSubmit} className="form-section">
            <textarea
                placeholder="Write your suggestion"
                value={suggestionText}
                onChange={e=>setSuggestionText(e.target.value)}
                required
            />
                        <input
                            type="text"
                            placeholder="Tags (comma separated)"
                            value={suggestionTags}
                            onChange={e=>setSuggestionTags(e.target.value)}
                        />
                        <div className="form-buttons">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!suggestionText.trim()}
                            >
                                Share Suggestion
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={handleCancel}
                            >
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default PostCreationPage;
