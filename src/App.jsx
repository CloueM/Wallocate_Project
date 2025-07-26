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
    // Default Needs items
    { id: 1, name: 'Groceries', amount: 209, percentage: 0, category: 'needs' }, // 6%
    { id: 2, name: 'Car payments & fuel', amount: 262, percentage: 0, category: 'needs' }, // 7.5%
    { id: 3, name: 'Minimum debt payments', amount: 140, percentage: 0, category: 'needs' }, // 4%
    
    // Default Savings items
    { id: 4, name: 'Emergency fund (3–6 months of expenses)', amount: 140, percentage: 0, category: 'savings' }, // 4%
    { id: 5, name: 'Retirement savings (RRSP, TFSA)', amount: 140, percentage: 0, category: 'savings' }, // 4%
    { id: 6, name: 'Investing (stocks, ETFs, mutual funds)', amount: 140, percentage: 0, category: 'savings' }, // 4%
    
    // Default Wants items
    { id: 7, name: 'Dining out / takeout', amount: 209, percentage: 0, category: 'wants' }, // 6%
    { id: 8, name: 'Entertainment', amount: 209, percentage: 0, category: 'wants' }, // 6%
    { id: 9, name: 'Shopping for non-essentials', amount: 209, percentage: 0, category: 'wants' }, // 6%
    { id: 10, name: 'Subscriptions', amount: 209, percentage: 0, category: 'wants' } // 6%
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
