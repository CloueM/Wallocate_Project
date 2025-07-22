import React from 'react';
import { useNavbarLogic } from '../scripts/navbarLogic';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const { navItems, active, setActive, handleNavClick } = useNavbarLogic();

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
