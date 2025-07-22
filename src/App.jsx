// src/App.jsx
import React, { useState } from 'react';
import BudgetItemsSection from './components/BudgetItemsSection';
import HeroSection from './components/HeroSection';
import Layout from './components/Layout';
import PlanSection from './components/PlanSection';
import './styles/global.css'; // if not already imported somewhere

const App = () => {
  const [selectedPlan, setSelectedPlan] = useState({
    name: "Custom Plan",
    description: "Users with unique priorities who want full control.",
    needs: 50,
    savings: 20,
    wants: 30
  });
  const [customPercentages, setCustomPercentages] = useState({
    needs: 50,
    savings: 20,
    wants: 30
  });
  const [income, setIncome] = useState('3489');

  return (
    <Layout>
      <HeroSection />
      <PlanSection 
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        customPercentages={customPercentages}
        setCustomPercentages={setCustomPercentages}
        income={income}
        setIncome={setIncome}
      />
      <BudgetItemsSection 
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        customPercentages={customPercentages}
        setCustomPercentages={setCustomPercentages}
        income={income}
      />
    </Layout>
  );
};

export default App;
