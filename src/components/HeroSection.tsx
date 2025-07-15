import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroSection: React.FC = () => {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(logoRef.current, { opacity: 0, y: -20, duration: 0.6 })
      .from(headlineRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
      .from(subtextRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');
  }, []);

  return (
    <section className="bg-[var(--bg-card)] rounded-2xl p-12 flex flex-col md:flex-row items-center gap-8 mx-6">
      {/* Text Content */}
      <div className="flex-1 text-white">
        <h1
          ref={headlineRef}
          className="slogan-txt mb-4 leading-tight"
        >
          Built for Real Budgets, Not Spreadsheets.
        </h1>
        <p
          ref={subtextRef}
          className="sub-slogan-txt mb-6 text-[var(--text-sub)] max-w-md"
        >
          Allocate your earnings into Needs, Wants, Savings, and Investments—all based on what matters to you.
        </p>
        <button className="px-6 py-3 bg-[var(--primary-color)] text-[var(--background-color)] rounded-md hover:opacity-90 transition">
          Continue
        </button>
      </div>

      {/* Logo / Decorative */}
      <div ref={logoRef} className="flex-center flex-1">
        <div className="w-64 h-64 bg-[var(--primary-color)] rounded-full flex-center">
          <span className="text-[var(--background-color)] text-6xl font-bold">W'</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
