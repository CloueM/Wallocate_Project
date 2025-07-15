// src/App.jsx
import React from 'react';
import Layout from './components/Layout';
import HeroSection from './components/HeroSection';
import PlanSection from './components/PlanSection';
import './index.css';              // if not already imported somewhere

const App = () => {
  return (
    <Layout>
      <HeroSection />
      <PlanSection />
    </Layout>
  );
};

export default App;
