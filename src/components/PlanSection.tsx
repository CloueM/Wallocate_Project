import React from 'react';
import { budgetPlans, usePlanSectionLogic } from '../scripts/planSectionLogic';
import '../styles/PlanSection.css';

interface BudgetPlan {
  name: string;
  description: string;
  needs: number;
  savings: number;
  wants: number;
}

interface PlanSectionProps {
  selectedPlan: BudgetPlan;
  setSelectedPlan: (plan: BudgetPlan) => void;
  customPercentages: {
    needs: number;
    savings: number;
    wants: number;
  };
  setCustomPercentages: (percentages: { needs: number; savings: number; wants: number }) => void;
  income: string;
  setIncome: (income: string) => void;
}

const PlanSection: React.FC<PlanSectionProps> = (props) => {
  const {
    selectedPlan,
    setSelectedPlan,
    customPercentages,
    setCustomPercentages,
    income,
    setIncome
  } = props;

  const {
    needsSliderRef,
    savingsSliderRef,
    wantsSliderRef,
    needsPercentageRef,
    savingsPercentageRef,
    wantsPercentageRef,
    handlePlanSelect,
    handleSliderChange,
    totalPercentage,
    indicatorColor,
    handleContinueClick
  } = usePlanSectionLogic(props);

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
                  className={`continue-btn ${totalPercentage !== 100 ? 'error' : ''}`}
                  disabled={totalPercentage !== 100}
                  onClick={handleContinueClick}
                >
                  <span className={`budget-status-text ${totalPercentage === 100 ? 'success' : 'error'}`}>
                    {totalPercentage === 100 
                      ? 'Continue' 
                      : totalPercentage < 100 
                        ? `Need ${100 - totalPercentage}% more` 
                        : `${totalPercentage - 100}% over budget`
                    }
                  </span>
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
                        ref={needsSliderRef}
                        type="range"
                        min="0"
                        max="100"
                        value={customPercentages.needs}
                        onChange={(e) => handleSliderChange('needs', parseInt(e.target.value))}
                        className="budget-slider"
                        data-type="needs"
                      />
                      <div ref={needsPercentageRef} className="slider-percentage" data-type="needs">
                        <span>{customPercentages.needs}%</span>
                      </div>
                    </div>
                    <span className="budget-label">Needs</span>
                  </div>
                  <div className="budget-item">
                    <div className="budget-slider-container">
                      <input
                        ref={savingsSliderRef}
                        type="range"
                        min="0"
                        max="100"
                        value={customPercentages.savings}
                        onChange={(e) => handleSliderChange('savings', parseInt(e.target.value))}
                        className="budget-slider"
                        data-type="savings"
                      />
                      <div ref={savingsPercentageRef} className="slider-percentage" data-type="savings">
                        <span>{customPercentages.savings}%</span>
                      </div>
                    </div>
                    <span className="budget-label">Savings</span>
                  </div>
                  <div className="budget-item">
                    <div className="budget-slider-container">
                      <input
                        ref={wantsSliderRef}
                        type="range"
                        min="0"
                        max="100"
                        value={customPercentages.wants}
                        onChange={(e) => handleSliderChange('wants', parseInt(e.target.value))}
                        className="budget-slider"
                        data-type="wants"
                      />
                      <div ref={wantsPercentageRef} className="slider-percentage" data-type="wants">
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
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <h4 className="option-name">{plan.name}</h4>
                    <p className="option-description">{plan.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanSection;
