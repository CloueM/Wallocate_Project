import React, { useState, useEffect } from 'react';

const navItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Plan', href: '#plan' },
  { label: 'Report', href: '/report' },
];

const Navbar: React.FC = () => {
  const [active, setActive] = useState<string>('Dashboard');

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.label === 'Plan') {
      document.getElementById('plan')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
      setActive(item.label);
    } else if (item.label === 'Dashboard') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setActive(item.label);
    } else {
      setActive(item.label);
      // Handle other navigation items as needed
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const planSection = document.getElementById('plan');
      
      if (planSection) {
        const planTop = planSection.offsetTop;
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Check if we've scrolled to the plan section
        // Activate Plan when plan section is about halfway up the screen
        if (scrollPosition >= planTop - windowHeight * 0.5) {
          setActive('Plan');
        } else {
          setActive('Dashboard');
        }
      }
    };

    // Throttle scroll events for better performance
    let timeoutId: number;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', throttledScroll);
    // Check initial state
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img src="/images/Wallocate-logo.png" alt="Wallocate" className="logo-img" />
      </div>

      {/* Navigation Items - Center */}
      <ul className="nav-items">
        {navItems.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              onClick={(e) => {
                if (item.label === 'Plan' || item.label === 'Dashboard') {
                  e.preventDefault();
                  handleNavClick(item);
                } else {
                  setActive(item.label);
                }
              }}
              className={`nav-link ${active === item.label ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Contact Button */}
      <button className="contact-btn">
        Contact
      </button>
    </nav>
  );
};

export default Navbar;
