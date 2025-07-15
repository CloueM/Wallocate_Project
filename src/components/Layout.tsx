import React from 'react';
import Navbar from './navbar';
import HeroSection from './HeroSection';
import QuoteBanner from './QuoteBanner';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-color)] text-[var(--prime-text-color)]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        {children}
        <QuoteBanner />
      </main>
    </div>
  );
};

export default Layout;
