import { gsap } from 'gsap';
import React, { useEffect, useRef } from 'react';

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

const PlanSection: React.FC<PlanSectionProps> = ({
  selectedPlan,
  setSelectedPlan,
  customPercentages,
  setCustomPercentages,
  income,
  setIncome
}) => {

  // Refs for sliders and percentage labels
  const needsSliderRef = useRef<HTMLInputElement>(null);
  const savingsSliderRef = useRef<HTMLInputElement>(null);
  const wantsSliderRef = useRef<HTMLInputElement>(null);
  const needsPercentageRef = useRef<HTMLDivElement>(null);
  const savingsPercentageRef = useRef<HTMLDivElement>(null);
  const wantsPercentageRef = useRef<HTMLDivElement>(null);

  // Initialize percentage positions on mount
  useEffect(() => {
    updatePercentagePosition('needs', customPercentages.needs);
    updatePercentagePosition('savings', customPercentages.savings);
    updatePercentagePosition('wants', customPercentages.wants);
  }, []);

  const handlePlanSelect = (plan: BudgetPlan) => {
    setSelectedPlan(plan);
    const newPercentages = {
      needs: plan.needs,
      savings: plan.savings,
      wants: plan.wants
    };
    
    // Animate sliders with GSAP
    animateSliders(newPercentages);
    
    setCustomPercentages(newPercentages);
  };

  const animateSliders = (newPercentages: { needs: number; savings: number; wants: number }) => {
    // Animate needs slider
    if (needsSliderRef.current) {
      gsap.to(needsSliderRef.current, {
        value: newPercentages.needs,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (needsSliderRef.current) {
            updatePercentagePosition('needs', needsSliderRef.current.valueAsNumber);
          }
        }
      });
    }

    // Animate savings slider
    if (savingsSliderRef.current) {
      gsap.to(savingsSliderRef.current, {
        value: newPercentages.savings,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (savingsSliderRef.current) {
            updatePercentagePosition('savings', savingsSliderRef.current.valueAsNumber);
          }
        }
      });
    }

    // Animate wants slider
    if (wantsSliderRef.current) {
      gsap.to(wantsSliderRef.current, {
        value: newPercentages.wants,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (wantsSliderRef.current) {
            updatePercentagePosition('wants', wantsSliderRef.current.valueAsNumber);
          }
        }
      });
    }
  };

  const handleSliderChange = (type: 'needs' | 'savings' | 'wants', value: number) => {
    const newPercentages = { ...customPercentages, [type]: value };
    setCustomPercentages(newPercentages);
    // Update to custom plan when user adjusts
    setSelectedPlan({ 
      name: "Custom Plan",
      description: "Users with unique priorities who want full control.",
      ...newPercentages 
    });
    
    // Update percentage position
    updatePercentagePosition(type, value);
  };

  const updatePercentagePosition = (type: 'needs' | 'savings' | 'wants', value: number) => {
    const slider = document.querySelector(`input[data-type="${type}"]`) as HTMLInputElement;
    const percentageLabel = document.querySelector(`.slider-percentage[data-type="${type}"]`) as HTMLElement;
    
    if (slider && percentageLabel) {
      const sliderRect = slider.getBoundingClientRect();
      const percentage = (value / 100) * (sliderRect.width - 40); // 40px is thumb width
      percentageLabel.style.left = `${percentage + 20}px`; // 20px is half thumb width
    }
  };

  // Calculate total percentage
  const totalPercentage = customPercentages.needs + customPercentages.savings + customPercentages.wants;
  
  // Determine indicator color based on total percentage
  const getIndicatorColor = (total: number) => {
    if (total > 100) return 'red';
    if (total >= 75 && total <= 99) return 'orange';
    if (total >= 0 && total <= 74) return 'blue';
    if (total === 100) return 'green';
    return 'blue'; // default
  };

  const indicatorColor = getIndicatorColor(totalPercentage);

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
                  onClick={() => {
                    if (totalPercentage === 100) {
                      console.log('Proceeding with budget plan:', selectedPlan.name);
                      // Enable scrolling temporarily
                      document.body.style.overflow = 'auto';
                      document.documentElement.style.overflow = 'auto';
                      
                      // Scroll to budget items section
                      const budgetItemsSection = document.getElementById('budget-items');
                      if (budgetItemsSection) {
                        budgetItemsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                      
                      // Re-disable scrolling after animation
                      setTimeout(() => {
                        document.body.style.overflow = 'hidden';
                        document.documentElement.style.overflow = 'hidden';
                      }, 1000);
                    }
                  }}
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
