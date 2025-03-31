import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css'

const HomePage = () => {
    return (
        <div className="home-container">
            <h1 className="title">Lexigram</h1>
            <div className="buttons-container">
                <Link to="/login">
                    <button className="home-button">Login</button>
                </Link>
                <Link to="/signup">
                    <button className="home-button">Sign Up</button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
