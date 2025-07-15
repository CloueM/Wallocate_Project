import React, { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Plan', href: '/plan' },
  { label: 'Report', href: '/report' },
];

const Navbar: React.FC = () => {
  const [active, setActive] = useState<string>('Dashboard');

  return (
    <nav className="bg-[var(--background-color)] px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <div className="text-[var(--primary-color)] text-2xl font-bold">W'</div>
        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={() => setActive(item.label)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors \$
                  active === item.label
                  ? 'bg-[var(--primary-color)] text-[var(--background-color)]'
                  : 'text-[var(--text-main)] hover:text-[var(--primary-color)]'
                `}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Button */}
      <button className="hidden md:block px-4 py-2 border border-[var(--text-main)] rounded-md text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--background-color)] transition">
        Contact
      </button>

      {/* Mobile Menu Placeholder */}
      <div className="md:hidden">
        {/* TODO: Add mobile menu icon and drawer */}
      </div>
    </nav>
  );
};

export default Navbar;
