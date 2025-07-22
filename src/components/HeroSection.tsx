import React from 'react';
import { useHeroSectionLogic } from '../scripts/heroSectionLogic';
import '../styles/HeroSection.css';
import QuoteBanner from './QuoteBanner';

const HeroSection: React.FC = () => {
  const {
    heroLeftRef,
    heroRightRef,
    heroLogoRef,
    glassContainerRef,
    handleContinueClick
  } = useHeroSectionLogic();

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="glass-container" ref={glassContainerRef}>
          {/* Left Container - Text Content */}
          <div className="hero-left" ref={heroLeftRef}>
            <h1 className="hero-slogan">Built for Real Budgets, Not Spreadsheets.</h1>
            <p className="hero-sub-slogan">
              Allocate your earnings into Needs, Wants, Savings, and Investments—all based on what matters to you.
            </p>
            <button 
              className="hero-button"
              onClick={handleContinueClick}
            >
              Continue
            </button>
          </div>

          {/* Right Container - Logo Circle */}
          <div className="hero-right" ref={heroRightRef}>
            <div className="logo-circle">
              <img 
                src="/images/Wallocate-logo.png" 
                alt="Wallocate" 
                className="hero-logo"
                ref={heroLogoRef}
              />
            </div>
          </div>
        </div>

        {/* Quote Banner Outside and Below Glass Container */}
        <QuoteBanner />
      </div>
    </section>
  );
};

export default HeroSection;
