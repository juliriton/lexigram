import React from 'react';

function Button({ text, onClick, type = 'button' }) {
    return (
        <button type={type} className="btn btn-primary" onClick={onClick}>
            {text}
        </button>
    );
}

export default Button;
