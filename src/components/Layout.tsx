import React from 'react';
import '../styles/Layout.css';
import Navbar from './Navbar';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout-container">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
