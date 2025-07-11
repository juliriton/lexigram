import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhotoVideo, FaQuestion, FaTimes, FaUpload, FaPalette } from 'react-icons/fa';
import Sidebar from '../components/SideBar';
import '../styles/PostCreationPage.css';
import {API_URL} from '../Api'

const PostCreationPage = ({ user, setUser }) => {
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const defaultProfilePicture = `${API_URL}/images/default-profile-picture.jpg`;

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const handleImageError = () => setProfilePicture(defaultProfilePicture);

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const profileRes = await fetch(`${API_URL}/api/auth/me/profile`, {
                    credentials: 'include',
                });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfilePicture(
                        profileData.profilePictureUrl
                            ? `${API_URL}${profileData.profilePictureUrl}`
                            : defaultProfilePicture
                    );
                } else {
                    setProfilePicture(defaultProfilePicture);
                }
            } catch (err) {
                console.error('Error fetching profile picture:', err);
                setProfilePicture(defaultProfilePicture);
            }
        };

        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/me`, {
                    credentials: 'include',
                });
                if (!res.ok) navigate('/login');
                else fetchProfilePicture();
            } catch {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate, defaultProfilePicture]);

    const handleCancel = () => {
        const container = document.querySelector('.post-creation-container');
        if (container) {
            container.style.transform = 'scale(0.95)';
            container.style.opacity = '0.5';
            setTimeout(() => navigate('/'), 200);
        } else {
            navigate('/');
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

    const handleFileChange = e => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : '');
    };

    const handleFormToggle = (formType) => {
        if (formType !== activeForm) {
            const formSection = document.querySelector('.form-section');
            if (formSection) {
                formSection.style.opacity = '0';
                formSection.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    setActiveForm(formType);
                    formSection.style.opacity = '1';
                    formSection.style.transform = 'translateY(0)';
                }, 150);
            } else {
                setActiveForm(formType);
            }
        }
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

        setIsSubmitting(true);

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
            const resp = await fetch(`${API_URL}/api/auth/me/post/experience`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (resp.ok) {
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    submitBtn.textContent = 'Posted Successfully!';
                    setTimeout(() => navigate('/'), 1000);
                } else {
                    navigate('/');
                }
            } else {
                console.error('Server error:', await resp.text());
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error('Error:', err);
            setIsSubmitting(false);
        }
    };

    const handleSuggestionSubmit = async e => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        if (!validateTextContent(suggestionText, SUGGESTION_MIN_CHARS, setSuggestionTextError)) return;

        setIsSubmitting(true);

        const trimmedSuggestionText = suggestionText.trim();
        const tagArray = suggestionTags
            .split(',')
            .map(t => t.trim())
            .filter(t => t);

        const suggestionObj = {
            body: trimmedSuggestionText,
            tags: tagArray,
            privacySettings: {
                allowResonates: suggestionAllowResonates,
                allowSaves: suggestionAllowSaves
            }
        };

        try {
            const resp = await fetch(`${API_URL}/api/auth/me/post/suggestion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestionObj),
                credentials: 'include'
            });

            if (resp.ok) {
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    submitBtn.textContent = 'Suggestion Submitted!';
                    setTimeout(() => navigate('/'), 1000);
                } else {
                    navigate('/');
                }
            } else {
                console.error('Server error:', await resp.text());
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error('Error:', err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="post-creation-page">
            <label className="burger" htmlFor="burger">
                <input
                    type="checkbox"
                    id="burger"
                    checked={sidebarOpen}
                    onChange={toggleSidebar}
                />
                <span></span><span></span><span></span>
            </label>

            <Sidebar
                user={user}
                setUser={setUser}
                profilePicture={profilePicture}
                handleImageError={handleImageError}
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                baseApiUrl={API_URL}
                defaultProfilePicture={defaultProfilePicture}
            />

            <div className={`post-creation-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="container-content">
                    <div className="form-toggle-buttons">
                        <button
                            className={`toggle-button ${activeForm==='experience'?'active':''}`}
                            onClick={() => handleFormToggle('experience')}
                            type="button"
                        >
                            <FaPhotoVideo size={18}/> <span>Experience</span>
                        </button>
                        <button
                            className={`toggle-button ${activeForm==='suggestion'?'active':''}`}
                            onClick={() => handleFormToggle('suggestion')}
                            type="button"
                        >
                            <FaQuestion size={18}/> <span>Suggestion</span>
                        </button>
                    </div>

                    {activeForm==='experience' && (
                        <>
                            <h2>Create a New Experience</h2>
                            <form onSubmit={handlePostSubmit} className="form-section">
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
                                            onChange={() => setAllowSaves(f => !f)}
                                        /> Saves
                                    </label>
                                </div>

                                <div className="form-buttons">
                                    <button
                                        type="submit"
                                        className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                                        disabled={!quote.trim() || !!quoteError || !!reflectionError || isSubmitting}
                                    >
                                        {isSubmitting ? 'Sharing...' : 'Share Experience'}
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
                                        className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                                        disabled={!suggestionText.trim() || !!suggestionTextError || isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Share Suggestion'}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCreationPage;