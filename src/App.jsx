// src/App.jsx  
import React, { useState } from 'react';
import BudgetItemsSection from './components/BudgetItemsSection';

import HeroSection from './components/HeroSection';
import Layout from './components/Layout';
import PlanSection from './components/PlanSection';
import ReportSection from './components/ReportSection';
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
  const [budgetItems, setBudgetItems] = useState([
    // Example data to show connection is working
    { id: 1, name: 'Rent', amount: 1200, percentage: 0, category: 'needs' },
    { id: 2, name: 'Groceries', amount: 400, percentage: 0, category: 'needs' },
    { id: 3, name: 'Emergency Fund', amount: 500, percentage: 0, category: 'savings' },
    { id: 4, name: '401k', amount: 300, percentage: 0, category: 'savings' },
    { id: 5, name: 'Entertainment', amount: 200, percentage: 0, category: 'wants' },
    { id: 6, name: 'Dining Out', amount: 150, percentage: 0, category: 'wants' }
  ]);

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
        budgetItems={budgetItems}
        setBudgetItems={setBudgetItems}
      />

      <ReportSection 
        selectedPlan={selectedPlan}
        customPercentages={customPercentages}
        income={income}
        budgetItems={budgetItems}
      />
    </Layout>
  );
};

export default App;
