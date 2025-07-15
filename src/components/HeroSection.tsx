import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import QuoteBanner from './QuoteBanner';

const HeroSection: React.FC = () => {
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const heroLogoRef = useRef<HTMLImageElement>(null);
  const glassContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Set initial states
    gsap.set([heroLeftRef.current, heroRightRef.current], {
      y: '100vh',
      opacity: 0
    });

    gsap.set(heroLogoRef.current, {
      rotation: 0
    });

    // Animate hero-left and hero-right rising from bottom
    tl.to([heroLeftRef.current, heroRightRef.current], {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.2
    })
    // Animate logo spinning (fast to slow)
    .to(heroLogoRef.current, {
      rotation: 360,
      duration: 2,
      ease: "power3.out"
    }, "-=1"); // Start 1 second before the previous animation ends

  }, []);

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
              onClick={() => {
                document.getElementById('plan')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
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
