// src/App.jsx
import React from 'react';
import Layout from './components/Layout';
import HeroSection from './components/HeroSection';
import './index.css';              // if not already imported somewhere

const App = () => {
  return (
    <Layout>
      <HeroSection />
    </Layout>
  );
};

export default App;
