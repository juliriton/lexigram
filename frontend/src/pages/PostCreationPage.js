import React, {useEffect, useState} from 'react';
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
    const [allowSaves, setAllowSaves] = useState(true);
    const [suggestionText, setSuggestionText] = useState('');
    const [suggestionTags, setSuggestionTags] = useState('');
    const [suggestionAllowResonates, setSuggestionAllowResonates] = useState(true);
    const [suggestionAllowSaves, setSuggestionAllowSaves] = useState(true);
    const [fontSizeError, setFontSizeError] = useState('');
    const [quoteError, setQuoteError] = useState('');
    const [reflectionError, setReflectionError] = useState('');
    const [suggestionTextError, setSuggestionTextError] = useState('');
    const baseApiUrl = 'http://localhost:8080';

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${baseApiUrl}/api/auth/me`, {
                    credentials: 'include',
                });
                if (!res.ok) navigate('/login');
            } catch {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);

    const handleCancel = () => {
        navigate('/');
    };

    const handleFontSizeChange = e => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 8;
        if (val < 8) {
            val = 8;
            setFontSizeError('Minimum font size is 8');
        } else if (val > 30) {
            val = 30;
            setFontSizeError('Maximum font size is 30');
        } else {
            setFontSizeError('');
        }
        setFontSize(val);
    };

    const QUOTE_MIN_CHARS = 10;
    const REFLECTION_MIN_CHARS = 100;
    const SUGGESTION_MIN_CHARS = 1;

    const validateTextContent = (value, minChars, errorSetter) => {
        const trimmedValue = value.trim();
        if (trimmedValue.length < minChars) {
            errorSetter(`Must contain at least ${minChars} characters (excluding spaces at beginning and end)`);
            return false;
        }
        errorSetter('');
        return true;
    };

    const handleQuoteChange = e => {
        const value = e.target.value;
        setQuote(value);
        validateTextContent(value, QUOTE_MIN_CHARS, setQuoteError);
    };

    const handleReflectionChange = e => {
        const value = e.target.value;
        setReflection(value);
        if (REFLECTION_MIN_CHARS > 0) {
            validateTextContent(value, REFLECTION_MIN_CHARS, setReflectionError);
        }
    };

    const handleSuggestionTextChange = e => {
        const value = e.target.value;
        setSuggestionText(value);
        validateTextContent(value, SUGGESTION_MIN_CHARS, setSuggestionTextError);
    };

    const handlePostSubmit = async e => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        if (fontSize < 8 || fontSize > 30) return;

        if (!validateTextContent(quote, QUOTE_MIN_CHARS, setQuoteError)) return;
        if (REFLECTION_MIN_CHARS > 0 && !validateTextContent(reflection, REFLECTION_MIN_CHARS, setReflectionError)) return;

        const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
        const mentionArray = mentions.split(',').map(m => m.trim().replace('@','')).filter(m => m);

        const trimmedQuote = quote.trim();
        const trimmedReflection = reflection.trim();

        const postObj = {
            quote: trimmedQuote,
            reflection: trimmedReflection,
            isReply: false,
            isOrigin: true,
            tags: tagArray,
            mentions: mentionArray,
            privacySettings: { allowComments, allowForks, allowResonates, allowSaves },
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

        // Validate suggestion text
        if (!validateTextContent(suggestionText, SUGGESTION_MIN_CHARS, setSuggestionTextError)) return;

        // Trim spaces from suggestion text for submission
        const trimmedSuggestionText = suggestionText.trim();

        // Process tags
        const tagArray = suggestionTags
            .split(',')
            .map(t => t.trim())
            .filter(t => t);

        // Create suggestion object with privacy settings
        const suggestionObj = {
            body: trimmedSuggestionText,
            tags: tagArray,
            privacySettings: {
                allowResonates: suggestionAllowResonates,
                allowSaves: suggestionAllowSaves
            }
        };

        try {
            const resp = await fetch('http://localhost:8080/api/auth/me/post/suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestionObj),
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
                        <div className="input-group">
                            <textarea
                                placeholder={`Quote (min ${QUOTE_MIN_CHARS} characters)`}
                                value={quote}
                                onChange={handleQuoteChange}
                                required
                            />
                            {quoteError && <div className="error-text">{quoteError}</div>}
                        </div>

                        <div className="input-group">
                            <textarea
                                placeholder={REFLECTION_MIN_CHARS > 0 ? `Reflection (min ${REFLECTION_MIN_CHARS} characters)` : "Reflection"}
                                value={reflection}
                                onChange={handleReflectionChange}
                            />
                            {reflectionError && <div className="error-text">{reflectionError}</div>}
                        </div>

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
                                    onChange={() => setAllowComments(c => !c)}
                                /> Comments
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={allowResonates}
                                    onChange={() => setAllowResonates(r => !r)}
                                /> Resonates
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={allowForks}
                                    onChange={() => setAllowForks(f => !f)}
                                /> Forks
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={allowSaves}
                                    onChange={() => setAllowSaves(f => !f)}
                                /> Saves
                            </label>
                        </div>

                        <div className="form-buttons">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!quote.trim() || !!quoteError || !!reflectionError}
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
                        <div className="input-group">
                            <textarea
                                placeholder={`Write your suggestion (min ${SUGGESTION_MIN_CHARS} characters)`}
                                value={suggestionText}
                                onChange={handleSuggestionTextChange}
                                required
                            />
                            {suggestionTextError && <div className="error-text">{suggestionTextError}</div>}
                        </div>
                        <input
                            type="text"
                            placeholder="Tags (comma separated)"
                            value={suggestionTags}
                            onChange={e=>setSuggestionTags(e.target.value)}
                        />

                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={suggestionAllowResonates}
                                    onChange={() => setSuggestionAllowResonates(r => !r)}
                                /> Resonates
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={suggestionAllowSaves}
                                    onChange={() => setSuggestionAllowSaves(s => !s)}
                                /> Saves
                            </label>
                        </div>

                        <div className="form-buttons">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!suggestionText.trim() || !!suggestionTextError}
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