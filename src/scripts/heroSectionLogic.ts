import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

// Custom hook for HeroSection animations and logic
export const useHeroSectionLogic = () => {
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const heroLogoRef = useRef<HTMLImageElement>(null);
  const glassContainerRef = useRef<HTMLDivElement>(null);

  // GSAP Animation Logic
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

  // Click handler for Continue button
  const handleContinueClick = () => {
    document.getElementById('plan')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return {
    heroLeftRef,
    heroRightRef,
    heroLogoRef,
    glassContainerRef,
    handleContinueClick
  };
}; 