import React, { useState } from 'react';

interface BudgetPlan {
  name: string;
  description: string;
  needs: number;
  savings: number;
  wants: number;
}

const budgetPlans: BudgetPlan[] = [
  {
    name: "Custom Plan",
    description: "Users with unique priorities who want full control.",
    needs: 50,
    savings: 20,
    wants: 30
  },
  {
    name: "Saver's Plan", 
    description: "Aggressive Savings for Goals or Early Retirement",
    needs: 50,
    savings: 35,
    wants: 15
  },
  {
    name: "Minimalist Plan",
    description: "Frugal lifestyle, freelancers, or anyone reducing expenses to hit goals quickly.",
    needs: 60,
    savings: 25,
    wants: 15
  },
  {
    name: "Survival Plan",
    description: "Students, Low-Income earners, or those in high cost-of-living areas prioritizing essentials.",
    needs: 70,
    savings: 20,
    wants: 10
  },
  {
    name: "Standard Plan",
    description: "Beginners, steady income earners, those wanting a simple, balanced approach.",
    needs: 50,
    savings: 30,
    wants: 20
  }
];

const PlanSection: React.FC = () => {
  const [income, setIncome] = useState<string>('3489');
  const [selectedPlan, setSelectedPlan] = useState<BudgetPlan>(budgetPlans[0]);
  const [customPercentages, setCustomPercentages] = useState({
    needs: 50,
    savings: 20,
    wants: 30
  });

  const handlePlanSelect = (plan: BudgetPlan) => {
    setSelectedPlan(plan);
    setCustomPercentages({
      needs: plan.needs,
      savings: plan.savings,
      wants: plan.wants
    });
  };

  const handlePercentageChange = (type: 'needs' | 'savings' | 'wants', value: number) => {
    const newPercentages = { ...customPercentages, [type]: value };
    
    // Ensure total doesn't exceed 100%
    const total = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);
    if (total <= 100) {
      setCustomPercentages(newPercentages);
      // Update to custom plan when user adjusts
      setSelectedPlan({ ...budgetPlans[0], ...newPercentages });
    }
  };

  return (
    <section className="plan-section" id="plan">
      <div className="plan-container">
        {/* Left Container */}
        <div className="plan-left">
          <h2 className="plan-title">Set Your Budget Plan</h2>
          <p className="plan-subtitle">
            Decide how much you want to put toward Needs, Wants, and Savings.
          </p>
          
          {/* Percentage Bars */}
          <div className="percentage-display">
            <div className="percentage-item">
              <span className="percentage-value">{customPercentages.needs}%</span>
              <div className="percentage-bar">
                <div 
                  className="percentage-fill needs-fill" 
                  style={{ height: `${customPercentages.needs}%` }}
                ></div>
              </div>
              <span className="category-label">Needs</span>
            </div>
            <div className="percentage-item">
              <span className="percentage-value">{customPercentages.savings}%</span>
              <div className="percentage-bar">
                <div 
                  className="percentage-fill savings-fill" 
                  style={{ height: `${customPercentages.savings}%` }}
                ></div>
              </div>
              <span className="category-label">Savings</span>
            </div>
            <div className="percentage-item">
              <span className="percentage-value">{customPercentages.wants}%</span>
              <div className="percentage-bar">
                <div 
                  className="percentage-fill wants-fill" 
                  style={{ height: `${customPercentages.wants}%` }}
                ></div>
              </div>
              <span className="category-label">Wants</span>
            </div>
          </div>
        </div>

        {/* Right Container */}
        <div className="plan-right">
          {/* Income Input */}
          <div className="income-section">
            <label className="income-label">Enter your total income:</label>
            <div className="income-input-container">
              <span className="currency-symbol">$</span>
              <input 
                type="number" 
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="income-input"
              />
            </div>
          </div>

          {/* Plan Details Section */}
          <div className="plan-details-container">
            <h3 className="current-budget-title">Current Budget Style:</h3>
            <div className="current-budget-content">
              <div className="current-budget-left">
                
                <div className="plan-info-container">
                  <h4 className="plan-name">{selectedPlan.name}</h4>
                  <p className="plan-description">{selectedPlan.description}</p>
                </div>
              </div>
              <div className="current-budget-right">
                <div className="budget-breakdown">
                  <div className="budget-item">
                    <button className="edit-btn">Edit...</button>
                    <div className="budget-percentage needs-bg">{customPercentages.needs}%</div>
                    <span className="budget-label">Needs</span>
                  </div>
                  <div className="budget-item">
                    <button className="edit-btn">Edit...</button>
                    <div className="budget-percentage savings-bg">{customPercentages.savings}%</div>
                    <span className="budget-label">Savings</span>
                  </div>
                  <div className="budget-item">
                    <button className="edit-btn">Edit...</button>
                    <div className="budget-percentage wants-bg">{customPercentages.wants}%</div>
                    <span className="budget-label">Wants</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="budget-options">
              <h3 className="options-title">Choose a Budgeting Style</h3>
              <div className="budget-grid">
                {budgetPlans.slice(1).map((plan, index) => (
                  <div 
                    key={plan.name}
                    className={`budget-option ${selectedPlan.name === plan.name ? 'selected' : ''}`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <h4 className="option-name">{plan.name}</h4>
                    <p className="option-description">{plan.description}</p>
                  </div>
                ))}
              </div>
              <button className="continue-btn">
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanSection;
