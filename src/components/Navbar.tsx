import React, { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Plan', href: '/plan' },
  { label: 'Report', href: '/report' },
];

const Navbar: React.FC = () => {
  const [active, setActive] = useState<string>('Dashboard');

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
              onClick={() => setActive(item.label)}
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
