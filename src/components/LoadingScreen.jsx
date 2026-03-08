import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-logo">🤫</div>
                <h1 className="loading-title">Trust No One</h1>
                <p className="loading-text">
                    Betöltés<span className="loading-dots"></span>
                </p>
            </div>
        </div>
    );
}
