import React, {useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTimes, FaUpload, FaPalette, FaCodeBranch } from 'react-icons/fa';
import '../styles/PostCreationPage.css';

const ForkExperiencePage = ({ user }) => {
    const navigate = useNavigate();
    const { uuid } = useParams();

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
    const [reflectionError, setReflectionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState('');

    // Fork-specific state
    const [originalExperience, setOriginalExperience] = useState(null);
    const [loadingOriginal, setLoadingOriginal] = useState(false);

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

        const loadOriginalExperience = async () => {
            if (uuid) {
                setLoadingOriginal(true);
                try {
                    const res = await fetch(`${baseApiUrl}/api/auth/me/experience/${uuid}`, {
                        credentials: 'include',
                    });
                    if (res.ok) {
                        const experience = await res.json();
                        setOriginalExperience(experience);
                        // Pre-fill some style fields from original but allow user to modify them
                        setFontFamily(experience.style?.fontFamily || 'Arial');
                        setFontSize(experience.style?.fontSize || 14);
                        setFontColor(experience.style?.fontColor || '#000000');
                    } else {
                        console.error('Failed to load original experience');
                        navigate('/'); // Redirect to home if can't load
                    }
                } catch (err) {
                    console.error('Error loading original experience:', err);
                    navigate('/'); // Redirect to home on error
                } finally {
                    setLoadingOriginal(false);
                }
            }
        };

        checkAuth();
        loadOriginalExperience();
    }, [navigate, uuid]);

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

    const handleForkSubmit = async e => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        if (fontSize < 8 || fontSize > 30) return;
        if (REFLECTION_MIN_CHARS > 0 && !validateTextContent(reflection, REFLECTION_MIN_CHARS, setReflectionError)) return;

        setIsSubmitting(true);

        const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
        const mentionArray = mentions.split(',').map(m => m.trim().replace('@','')).filter(m => m);
        const trimmedReflection = reflection.trim();

        const forkObj = {
            reflection: trimmedReflection,
            tags: tagArray,
            mentions: mentionArray,
            postExperiencePrivacySettingsDTO: {
                allowComments,
                allowForks,
                allowResonates,
                allowSaves
            },
            postExperienceStyleDTO: {
                fontFamily,
                fontSize,
                fontColor,
                textPositionX: 0,
                textPositionY: 0
            }
        };

        const formData = new FormData();
        formData.append('fork', new Blob([JSON.stringify(forkObj)], { type: 'application/json' }));
        if (file) formData.append('file', file);

        try {
            const resp = await fetch(`${baseApiUrl}/api/auth/me/experience/${uuid}/fork`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (resp.ok) {
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    submitBtn.textContent = 'Fork Created Successfully!';
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

    if (loadingOriginal) {
        return (
            <div className="post-creation-container">
                <div className="container-content">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>Loading original experience...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!originalExperience) {
        return (
            <div className="post-creation-container">
                <div className="container-content">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>Experience not found.</p>
                        <button onClick={() => navigate('/')} className="submit-btn">
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="post-creation-container">
            <div className="container-content">
                <h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaCodeBranch />
                        <span>Fork Experience</span>
                    </div>
                </h2>

                <div style={{
                    background: 'var(--secondary-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1rem'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                        Original Quote:
                    </h4>
                    <p style={{
                        margin: 0,
                        fontStyle: 'italic',
                        color: 'var(--text-primary)',
                        fontSize: '1.1rem'
                    }}>
                        "{originalExperience.quote}"
                    </p>
                    <p style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}>
                        by @{originalExperience.user?.username}
                    </p>
                </div>

                <form onSubmit={handleForkSubmit} className="form-section">
                    <div className="input-group">
            <textarea
                placeholder={REFLECTION_MIN_CHARS > 0 ?
                    `Your reflection on this experience (min ${REFLECTION_MIN_CHARS} characters)` :
                    "Your reflection on this experience"
                }
                value={reflection}
                onChange={handleReflectionChange}
                required
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
                            />
                            Comments
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={allowResonates}
                                onChange={() => setAllowResonates(r => !r)}
                            />
                            Resonates
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={allowForks}
                                onChange={() => setAllowForks(f => !f)}
                            />
                            Forks
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={allowSaves}
                                onChange={() => setAllowSaves(f => !f)}
                            />
                            Saves
                        </label>
                    </div>

                    <div className="form-buttons">
                        <button
                            type="submit"
                            className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                            disabled={!!reflectionError || isSubmitting}
                        >
                            {isSubmitting ? 'Creating Fork...' : 'Create Fork'}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <FaTimes />
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForkExperiencePage;