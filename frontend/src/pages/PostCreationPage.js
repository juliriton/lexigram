import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostCreationPage.css';

const PostCreationPage = ({ user }) => {
    const navigate = useNavigate();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        const formData = new FormData();
        formData.append('isOrigin', true);
        formData.append('quote', quote);
        formData.append('reflection', reflection);
        formData.append('fontFamily', fontFamily);
        formData.append('fontSize', fontSize);
        formData.append('fontColor', fontColor);
        formData.append('textPositionX', 0);
        formData.append('textPositionY', 0);
        formData.append('allowComments', allowComments);
        formData.append('allowResonates', allowResonates);
        formData.append('allowForks', allowForks);
        const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        tagArray.forEach(tag => formData.append('tags', tag));
        const mentionArray = mentions.split(',').map(m => m.trim().replace('@', '')).filter(m => m !== '');
        mentionArray.forEach(m => formData.append('mentions', m));
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
                alert('Error creating post');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="post-creation-container">
            <h2>Create a New Post</h2>
            <form onSubmit={handleSubmit}>
                <textarea placeholder="Quote" value={quote}
                          onChange={(e) => setQuote(e.target.value)} required/>
                <textarea placeholder="Reflection" value={reflection}
                          onChange={(e) => setReflection(e.target.value)}/>
                <input type="text" placeholder="Tags (comma separated)" value={tags}
                       onChange={(e) => setTags(e.target.value)}/>
                <input type="text" placeholder="Mentions (comma separated, e.g. @user1, @user2)"
                       value={mentions} onChange={(e) => setMentions(e.target.value)}/>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                </select>
                <input type="number" placeholder="Font Size" value={fontSize}
                       onChange={(e) => setFontSize(parseInt(e.target.value))}/>
                <input type="color" value={fontColor}
                       onChange={(e) => setFontColor(e.target.value)}/>
                <input type="file" accept="image/jpeg,video/mp4,video/webm,image/gif"
                       onChange={(e) => setFile(e.target.files[0])}/>
                <label><input type="checkbox" checked={allowComments}
                              onChange={() => setAllowComments(!allowComments)}/> Allow
                    Comments</label>
                <label><input type="checkbox" checked={allowResonates}
                              onChange={() => setAllowResonates(!allowResonates)}/> Allow Resonates</label>
                <label><input type="checkbox" checked={allowForks}
                              onChange={() => setAllowForks(!allowForks)}/> Allow Forks</label>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default PostCreationPage;
