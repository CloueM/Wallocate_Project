import React, { useEffect, useState } from 'react';

interface BudgetItem {
  id: number;
  name: string;
  amount: number;
  percentage: number;
  category: 'needs' | 'savings' | 'wants';
}

interface BudgetPlan {
  name: string;
  description: string;
  needs: number;
  savings: number;
  wants: number;
}

interface BudgetItemsSectionProps {
  selectedPlan: BudgetPlan;
  setSelectedPlan: (plan: BudgetPlan) => void;
  customPercentages: {
    needs: number;
    savings: number;
    wants: number;
  };
  setCustomPercentages: (percentages: { needs: number; savings: number; wants: number }) => void;
  income: string;
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

const BudgetItemsSection: React.FC<BudgetItemsSectionProps> = ({
  selectedPlan,
  setSelectedPlan,
  customPercentages,
  setCustomPercentages,
  income
}) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: 1, name: "Rent/Mortgage", amount: 1200, percentage: 35, category: 'needs' },
    { id: 2, name: "Utilities", amount: 300, percentage: 9, category: 'needs' },
    { id: 3, name: "Groceries", amount: 400, percentage: 11, category: 'needs' },
    { id: 4, name: "Emergency Fund", amount: 500, percentage: 14, category: 'savings' },
    { id: 5, name: "Retirement", amount: 300, percentage: 9, category: 'savings' },
    { id: 6, name: "Entertainment", amount: 200, percentage: 6, category: 'wants' },
    { id: 7, name: "Dining Out", amount: 150, percentage: 4, category: 'wants' },
    { id: 8, name: "Shopping", amount: 100, percentage: 3, category: 'wants' },
  ]);

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);

  useEffect(() => {
    const amount = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const percentage = budgetItems.reduce((sum, item) => sum + item.percentage, 0);
    setTotalAmount(amount);
    setTotalPercentage(percentage);
  }, [budgetItems]);

  const handleAutoFix = () => {
    // Auto-fix logic to adjust percentages to match the selected plan
    const newItems = budgetItems.map(item => {
      const targetPercentage = item.category === 'needs' ? customPercentages.needs :
                              item.category === 'savings' ? customPercentages.savings :
                              customPercentages.wants;
      
      // Calculate new percentage based on category target
      const categoryItems = budgetItems.filter(i => i.category === item.category);
      const categoryTotal = categoryItems.reduce((sum, i) => sum + i.amount, 0);
      const newPercentage = (item.amount / categoryTotal) * targetPercentage;
      
      return { ...item, percentage: Math.round(newPercentage * 10) / 10 };
    });
    
    setBudgetItems(newItems);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'needs': return 'var(--needs-color)';
      case 'savings': return 'var(--savings-color)';
      case 'wants': return 'var(--wants-color)';
      default: return 'var(--secondary-color)';
    }
  };

  return (
    <section className="budget-items-section" id="budget-items">
      <div className="budget-items-container">
        {/* Left Column - Copied from plan-right */}
        <div className="budget-items-left">
          {/* Income Section */}
          <div className="income-section">
            <label className="income-label">Your Total Income:</label>
            <div className="income-input-container">
              <span className="currency-symbol">$</span>
              <input 
                type="number" 
                value={income}
                readOnly
                className="income-input"
              />
            </div>
          </div>

          {/* Plan Details Section */}
          <div className="plan-details-container">
            <div className="budget-header-container">
              <div className="budget-header-left">
                <h3 className="current-budget-title">Current Budget Style:</h3>
                <div className="plan-info-header">
                  <h4 className="plan-name">{selectedPlan.name}</h4>
                  <p className="plan-description">{selectedPlan.description}</p>
                </div>
              </div>
              <div className="budget-header-right">
                <button 
                  className="back-btn"
                  onClick={() => {
                    // Enable scrolling temporarily
                    document.body.style.overflow = 'auto';
                    document.documentElement.style.overflow = 'auto';
                    
                    // Scroll back to plan section
                    const planSection = document.getElementById('plan');
                    if (planSection) {
                      planSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    
                    // Re-disable scrolling after animation
                    setTimeout(() => {
                      document.body.style.overflow = 'hidden';
                      document.documentElement.style.overflow = 'hidden';
                    }, 1000);
                  }}
                >
                  <span className="back-btn-text">Back</span>
                </button>
              </div>
            </div>
            <div className="current-budget-content">
              <div className="current-budget-left">
                <div className="budget-style-icon">
                  {selectedPlan.name === "Custom Plan" && (
                    <img src="/images/icons/custom-plan.png" alt="Custom Plan" className="icon" />
                  )}
                  {selectedPlan.name === "Saver's Plan" && (
                    <img src="/images/icons/savers-plan.png" alt="Saver's Plan" className="icon" />
                  )}
                  {selectedPlan.name === "Minimalist Plan" && (
                    <img src="/images/icons/minimalist-plan.png" alt="Minimalist Plan" className="icon" />
                  )}
                  {selectedPlan.name === "Survival Plan" && (
                    <img src="/images/icons/survival-plan.png" alt="Survival Plan" className="icon" />
                  )}
                  {selectedPlan.name === "Standard Plan" && (
                    <img src="/images/icons/standard-plan.png" alt="Standard Plan" className="icon" />
                  )}
                </div>
              </div>
              <div className="current-budget-right">
                <div className="budget-breakdown">
                  <div className="budget-item">
                    <div className="budget-slider-container">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customPercentages.needs}
                        disabled
                        className="budget-slider"
                        data-type="needs"
                      />
                      <div className="slider-percentage" data-type="needs">
                        <span>{customPercentages.needs}%</span>
                      </div>
                    </div>
                    <span className="budget-label">Needs</span>
                  </div>
                  <div className="budget-item">
                    <div className="budget-slider-container">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customPercentages.savings}
                        disabled
                        className="budget-slider"
                        data-type="savings"
                      />
                      <div className="slider-percentage" data-type="savings">
                        <span>{customPercentages.savings}%</span>
                      </div>
                    </div>
                    <span className="budget-label">Savings</span>
                  </div>
                  <div className="budget-item">
                    <div className="budget-slider-container">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customPercentages.wants}
                        disabled
                        className="budget-slider"
                        data-type="wants"
                      />
                      <div className="slider-percentage" data-type="wants">
                        <span>{customPercentages.wants}%</span>
                      </div>
                    </div>
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
                    style={{ pointerEvents: 'none', opacity: 0.6 }}
                  >
                    <h4 className="option-name">{plan.name}</h4>
                    <p className="option-description">{plan.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Budget Items */}
        <div className="budget-items-right">
          {/* Row 1: Slogan and Sub-slogan */}
          <div className="budget-items-header">
            <h2 className="budget-items-slogan">Add Your Budget Items</h2>
            <p className="budget-items-sub-slogan">Organize your expenses into categories and see how they align with your budget plan</p>
          </div>

          {/* Row 2: Information and Percentage Circles */}
          <div className="budget-summary-row">
            <div className="budget-summary-info">
              <h3>Budget Summary</h3>
              <p>Total Income: ${income}</p>
              <p>Total Allocated: ${totalAmount}</p>
              <p>Remaining: ${parseInt(income) - totalAmount}</p>
            </div>
            <div className="percentage-circles">
              <div className="percentage-circle needs-circle">
                <span className="circle-percentage">{customPercentages.needs}%</span>
                <span className="circle-label">Needs</span>
              </div>
              <div className="percentage-circle savings-circle">
                <span className="circle-percentage">{customPercentages.savings}%</span>
                <span className="circle-label">Savings</span>
              </div>
              <div className="percentage-circle wants-circle">
                <span className="circle-percentage">{customPercentages.wants}%</span>
                <span className="circle-label">Wants</span>
              </div>
            </div>
          </div>

          {/* Row 3: Budget Items Table */}
          <div className="budget-items-table">
            <div className="table-header">
              <div className="header-item">Items</div>
              <div className="header-item">Amount</div>
              <div className="header-item">Percent</div>
            </div>
            <div className="table-content">
              {budgetItems.map((item) => (
                <div key={item.id} className="table-row">
                  <div className="table-cell item-name" style={{ color: getCategoryColor(item.category) }}>
                    {item.name}
                  </div>
                  <div className="table-cell item-amount">${item.amount}</div>
                  <div className="table-cell item-percentage">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Action Buttons and Message */}
          <div className="budget-actions">
            <button className="view-report-btn">View Report</button>
            <button className="auto-fix-btn" onClick={handleAutoFix}>Auto Fix</button>
            <div className="allocation-message">
              <p>Your budget allocation shows {totalPercentage}% of your income is allocated. 
              {totalPercentage > 100 ? ` You are ${totalPercentage - 100}% over budget.` : 
               totalPercentage < 100 ? ` You have ${100 - totalPercentage}% remaining to allocate.` : 
               ' Your budget is perfectly balanced!'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetItemsSection; 