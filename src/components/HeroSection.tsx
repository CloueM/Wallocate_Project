import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="glass-container">
        {/* Left Container - Text Content */}
        <div className="hero-left">
          <h1 className="hero-slogan">Built for Real Budgets, Not Spreadsheets.</h1>
          <p className="hero-sub-slogan">
            Allocate your earnings into Needs, Wants, Savings, and Investments—all based on what matters to you.
          </p>
          <button className="hero-button">Continue</button>
        </div>

        {/* Right Container - Logo Circle */}
        <div className="hero-right">
          <div className="logo-circle">
            <img src="/images/Wallocate-logo.png" alt="Wallocate" className="hero-logo" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
