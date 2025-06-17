import React, {useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaReply, FaTimes, FaUpload, FaPalette } from 'react-icons/fa';
import '../styles/PostCreationPage.css';

const ReplySuggestionPage = ({ user }) => {
    const navigate = useNavigate();
    const { uuid } = useParams();
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
    const [fontSizeError, setFontSizeError] = useState('');
    const [quoteError, setQuoteError] = useState('');
    const [reflectionError, setReflectionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState('');
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
        // Navigate back to the suggestion or home page
        const container = document.querySelector('.post-creation-container');
        if (container) {
            container.style.transform = 'scale(0.95)';
            container.style.opacity = '0.5';
            setTimeout(() => navigate(-1), 200); // Go back to previous page
        } else {
            navigate(-1);
        }
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

    const handleFileChange = e => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : '');
    };

    const handleReplySubmit = async e => {
        e.preventDefault();
        console.log('Submit button clicked'); // Debug log

        if (!user) {
            console.log('No user, redirecting to login');
            navigate('/login');
            return;
        }

        if (!uuid) {
            console.error('No suggestion UUID provided');
            alert('Error: No suggestion ID found');
            return;
        }

        console.log('Suggestion UUID:', uuid); // Debug log

        if (fontSize < 8 || fontSize > 30) {
            console.log('Font size validation failed');
            return;
        }

        if (!validateTextContent(quote, QUOTE_MIN_CHARS, setQuoteError)) {
            console.log('Quote validation failed');
            return;
        }

        if (REFLECTION_MIN_CHARS > 0 && !validateTextContent(reflection, REFLECTION_MIN_CHARS, setReflectionError)) {
            console.log('Reflection validation failed');
            return;
        }

        setIsSubmitting(true);

        const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
        const mentionArray = mentions.split(',').map(m => m.trim().replace('@','')).filter(m => m);

        const trimmedQuote = quote.trim();
        const trimmedReflection = reflection.trim();

        const replyObj = {
            quote: trimmedQuote,
            reflection: trimmedReflection,
            isReply: true,
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

        console.log('Reply object:', replyObj); // Debug log

        const formData = new FormData();
        formData.append('post', new Blob([JSON.stringify(replyObj)], { type: 'application/json' }));
        if (file) {
            console.log('File attached:', file.name);
            formData.append('file', file);
        }

        const url = `${baseApiUrl}/api/auth/me/suggestion/${uuid}/reply`;
        console.log('Request URL:', url); // Debug log

        try {
            console.log('Making request...');
            const resp = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            console.log('Response status:', resp.status);
            console.log('Response ok:', resp.ok);

            if (resp.ok) {
                const responseData = await resp.json();
                console.log('Success response:', responseData);

                // Show success feedback before navigating
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    submitBtn.textContent = 'Reply Posted Successfully!';
                    setTimeout(() => navigate(-1), 1000);
                } else {
                    navigate(-1);
                }
            } else {
                const errorText = await resp.text();
                console.error('Server error:', errorText);
                console.error('Response headers:', resp.headers);
                alert(`Server error (${resp.status}): ${errorText}`);
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error('Network error:', err);
            alert(`Network error: ${err.message}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="post-creation-container">
            <div className="container-content">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <FaReply size={20} style={{color: 'var(--primary-color)'}} />
                    <span style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                    }}>
                        Reply to Suggestion with Experience
                    </span>
                </div>

                <h2>Share Your Experience</h2>
                <form onSubmit={handleReplySubmit} className="form-section">
                    <div className="input-group">
                        <textarea
                            placeholder={`Share your quote (min ${QUOTE_MIN_CHARS} characters)`}
                            value={quote}
                            onChange={handleQuoteChange}
                            required
                        />
                        {quoteError && <div className="error-text">{quoteError}</div>}
                    </div>

                    <div className="input-group">
                        <textarea
                            placeholder={REFLECTION_MIN_CHARS > 0 ? `Your reflection (min ${REFLECTION_MIN_CHARS} characters)` : "Your reflection"}
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
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <FaPalette />
                            <span style={{fontWeight: '600', color: 'var(--text-primary)'}}>Style Options</span>
                        </div>
                        <select
                            value={fontFamily}
                            onChange={e=>setFontFamily(e.target.value)}
                        >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Helvetica">Helvetica</option>
                        </select>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <input
                                type="number"
                                value={fontSize}
                                min={8}
                                max={30}
                                onChange={handleFontSizeChange}
                            />
                            {fontSizeError && (
                                <div className="error-text" style={{marginTop: '0.25rem'}}>{fontSizeError}</div>
                            )}
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center'}}>
                            <label style={{fontSize: '0.875rem', fontWeight: '500'}}>Text Color</label>
                            <input
                                type="color"
                                value={fontColor}
                                onChange={e=>setFontColor(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{position: 'relative'}}>
                        <input
                            type="file"
                            accept="image/jpeg,video/mp4,video/webm,image/gif"
                            onChange={handleFileChange}
                            style={{
                                position: 'absolute',
                                opacity: 0,
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{
                            padding: '2rem',
                            border: '2px dashed var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, var(--secondary-color), #e2e8f0)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FaUpload size={24} style={{color: 'var(--primary-color)'}} />
                            <span style={{fontWeight: '500', color: 'var(--text-primary)'}}>
                                {fileName || 'Click to upload media'}
                            </span>
                            <span style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                                JPEG, MP4, WebM, GIF supported
                            </span>
                        </div>
                    </div>

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
                                onChange={() => setAllowSaves(s => !s)}
                            /> Saves
                        </label>
                    </div>

                    <div className="form-buttons">
                        <button
                            type="submit"
                            className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Posting Reply...' : 'Post Reply'}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <FaTimes /> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReplySuggestionPage;