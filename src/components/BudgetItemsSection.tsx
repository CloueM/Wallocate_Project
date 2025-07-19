import { gsap } from 'gsap';
import React, { useEffect, useRef, useState } from 'react';

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
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [lockedItems, setLockedItems] = useState<Set<number>>(new Set());

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [circleOrder, setCircleOrder] = useState(['needs', 'savings', 'wants']);
  const circleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const budgetSummaryInfoRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);

  useEffect(() => {
    const amount = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const percentage = budgetItems.reduce((sum, item) => sum + item.percentage, 0);
    setTotalAmount(amount);
    setTotalPercentage(percentage);
  }, [budgetItems]);

  // Set initial positions and animate circles when order changes
  useEffect(() => {
    const circles = circleOrder.map(category => circleRefs.current[category]).filter(Boolean);
    
    if (circles.length > 0) {
      // Calculate the target positions for each circle
      const circleWidth = 80; // Width of each circle (5rem = 80px)
      const gap = 24; // Gap between circles (1.5rem = 24px)
      
      circles.forEach((circle, index) => {
        if (!circle) return;
        
        const targetX = index * (circleWidth + gap);
        
        if (isInitialRender.current) {
          // Set initial position without animation
          gsap.set(circle, { x: targetX });
        } else {
          // Animate to new position
          gsap.to(circle, {
            x: targetX,
            duration: 0.1,
            ease: "power2.out"
          });
        }
      });
      
      // Mark initial render as complete
      if (isInitialRender.current) {
        isInitialRender.current = false;
      }
    }
  }, [circleOrder]);



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

  // Recursive function to calculate percentage to dollar amount
  const calculatePercentageToDollar = (percentage: number, totalIncome: number, precision: number = 2): number => {
    if (precision <= 0) {
      return Math.round((percentage / 100) * totalIncome);
    }
    return Math.round((percentage / 100) * totalIncome * Math.pow(10, precision)) / Math.pow(10, precision);
  };

  // Recursive function to calculate dollar amount to percentage
  const calculateDollarToPercentage = (dollarAmount: number, totalIncome: number, precision: number = 2): number => {
    if (precision <= 0) {
      return Math.round((dollarAmount / totalIncome) * 100);
    }
    return Math.round((dollarAmount / totalIncome) * 100 * Math.pow(10, precision)) / Math.pow(10, precision);
  };

  // Get the current category's dollar amount
  const getCurrentCategoryAmount = (): string => {
    const currentCategory = circleOrder[0];
    const percentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const totalIncome = parseInt(income);
    const dollarAmount = calculatePercentageToDollar(percentage, totalIncome);
    return dollarAmount.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handle item name update
  const handleItemNameChange = (id: number, name: string) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id ? { ...item, name } : item
    ));
  };

  // Handle item amount update
  const handleItemAmountChange = (id: number, amount: number) => {
    // Only allow non-negative amounts
    if (amount >= 0) {
      setBudgetItems(prev => prev.map(item => 
        item.id === id ? { ...item, amount } : item
      ));
    }
  };

  // Handle empty row input changes
  const [emptyRowData, setEmptyRowData] = useState({ name: '', amount: 0 });

  const handleEmptyRowNameChange = (name: string) => {
    setEmptyRowData(prev => ({ ...prev, name }));
  };

  const handleEmptyRowAmountChange = (amount: number) => {
    // Only allow amount input if item name is provided and amount is not negative
    if (emptyRowData.name.trim() && amount >= 0) {
      setEmptyRowData(prev => ({ ...prev, amount }));
    }
  };

  // Add item when check mark is clicked
  const handleAddItem = () => {
    if (emptyRowData.name.trim() || emptyRowData.amount > 0) {
      const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
      const newItem: BudgetItem = {
        id: Date.now(),
        name: emptyRowData.name.trim(),
        amount: emptyRowData.amount,
        percentage: 0,
        category: currentCategory
      };
      setBudgetItems(prev => [...prev, newItem]);
      setEmptyRowData({ name: '', amount: 0 }); // Clear the empty row
      // Lock the newly added item
      setLockedItems(prev => new Set([...prev, newItem.id]));
    }
  };

  // Clear empty row when X is clicked
  const handleClearEmptyRow = () => {
    setEmptyRowData({ name: '', amount: 0 });
  };

  // Handle check mark click (lock/unlock item)
  const handleCheckMarkClick = (id: number) => {
    setLockedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Unlock
      } else {
        newSet.add(id); // Lock
      }
      return newSet;
    });
  };

  // Handle X mark click (clear item)
  const handleXMarkClick = (id: number) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
    setLockedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Calculate percentage for an item based on current category total
  const calculateItemPercentage = (item: BudgetItem): number => {
    const currentCategory = circleOrder[0];
    if (item.category !== currentCategory || item.amount === 0) {
      return 0;
    }
    
    // Get the category's total allocated amount from income
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryTotalAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    if (categoryTotalAmount === 0) return 0;
    
    return Math.round((item.amount / categoryTotalAmount) * 100 * 100) / 100; // Round to 2 decimal places
  };

  // Get items for current category
  const getCurrentCategoryItems = (): BudgetItem[] => {
    const currentCategory = circleOrder[0];
    return budgetItems.filter(item => item.category === currentCategory);
  };

  // Add new item when user starts typing
  const addNewItem = () => {
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const newItem: BudgetItem = {
      id: Date.now(),
      name: "",
      amount: 0,
      percentage: 0,
      category: currentCategory
    };
    setBudgetItems(prev => [...prev, newItem]);
  };

  const handleCircleClick = (category: string) => {
    const newOrder = [...circleOrder];
    const clickedIndex = newOrder.indexOf(category);
    const firstIndex = 0;
    
    // Start both animations immediately
    const clickedCircle = circleRefs.current[category];
    const budgetSummaryInfo = budgetSummaryInfoRef.current;
    
    if (clickedCircle) {
      gsap.to(clickedCircle, {
        scale: 1.15,
        duration: 0.1,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(clickedCircle, {
            scale: 1,
            duration: 0.01,
            ease: "power2.out"
          });
        }
      });
    }
    
    if (budgetSummaryInfo) {
      // Fade out and slide to the right
      gsap.to(budgetSummaryInfo, {
        opacity: 0,
        x: 30,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Swap the clicked circle with the first position
          [newOrder[firstIndex], newOrder[clickedIndex]] = [newOrder[clickedIndex], newOrder[firstIndex]];
          setCircleOrder(newOrder);
          
          // Fade in and slide from the left
          gsap.fromTo(budgetSummaryInfo, 
            {
              opacity: 0,
              x: -30
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: "power2.out"
            }
          );
        }
      });
    } else {
      // Fallback if element not found
      [newOrder[firstIndex], newOrder[clickedIndex]] = [newOrder[clickedIndex], newOrder[firstIndex]];
      setCircleOrder(newOrder);
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
            <div 
              ref={budgetSummaryInfoRef}
              className={`budget-summary-info ${circleOrder[0]}-active`}
            >
              <div className="budget-summary-header">
                <h3 className="budget-summary-title">{circleOrder[0].charAt(0).toUpperCase() + circleOrder[0].slice(1)}</h3>
                <div 
                  className="budget-amount-box"
                  style={{ 
                    backgroundColor: `${getCategoryColor(circleOrder[0])}20`,
                    borderColor: getCategoryColor(circleOrder[0])
                  }}
                >
                  <span className="budget-amount">{getCurrentCategoryAmount()}</span>
                </div>
              </div>
              <p className="budget-summary-description">
                {circleOrder[0] === 'needs' && "List your essential costs—housing, groceries, utilities, insurance, and other must‑pay bills."}
                {circleOrder[0] === 'savings' && "Allocate funds for future security and goals, from an emergency cushion to long‑term investments."}
                {circleOrder[0] === 'wants' && "Set aside an amount for lifestyle extras like dining, entertainment, shopping, and hobbies."}
              </p>
            </div>
            <div className="percentage-circles">
              {circleOrder.map((category, index) => (
                <div 
                  key={category}
                  ref={(el) => { circleRefs.current[category] = el; }}
                  className={`percentage-circle ${category}-circle`}
                  onClick={index === 0 ? undefined : () => handleCircleClick(category)}
                  style={{ 
                    cursor: index === 0 ? 'default' : 'pointer',
                    
                  }}
                >
                  <span className="circle-percentage">{customPercentages[category as keyof typeof customPercentages]}%</span>
                  <span className="circle-label">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Budget Items Table */}
          <div className="budget-items-table">
            <div className="table-header">
              <div className="header-item">Actions</div>
              <div className="header-item">Items</div>
              <div className="header-item">Amount</div>
              <div className="header-item">Percent</div>
            </div>
            <div className="table-content">
              {/* Show existing items */}
              {getCurrentCategoryItems().map((item) => (
                <div key={item.id} className="table-row">
                  <div className="table-cell table-actions-cell">
                    {lockedItems.has(item.id) ? (
                      <button
                        className="action-icon edit-icon"
                        onClick={() => handleCheckMarkClick(item.id)}
                        title="Edit item"
                      >
                        ✏️
                      </button>
                    ) : (
                      <>
                        <button
                          className="action-icon check-icon"
                          onClick={() => handleCheckMarkClick(item.id)}
                          title="Lock item"
                        >
                          ✓
                        </button>
                        <button
                          className="action-icon x-icon"
                          onClick={() => handleXMarkClick(item.id)}
                          title="Delete item"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                  <div className="table-cell item-name">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                      placeholder="Enter item name..."
                      className={`item-name-input ${lockedItems.has(item.id) ? 'locked-input' : ''}`}
                      style={{ color: getCategoryColor(item.category) }}
                      disabled={lockedItems.has(item.id)}
                    />
                  </div>
                  <div className="table-cell item-amount">
                    <div className="amount-input-container">
                      <span className="dollar-sign">$</span>
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => handleItemAmountChange(item.id, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className={`item-amount-input ${lockedItems.has(item.id) ? 'locked-input' : ''}`}
                        disabled={lockedItems.has(item.id)}
                      />
                    </div>
                  </div>
                  <div className="table-cell item-percentage">
                    {calculateItemPercentage(item).toFixed(2)}%
                  </div>
                </div>
              ))}
              {/* Always show an empty input row */}
              <div className="table-row input-row">
                <div className="table-cell table-actions-cell">
                  <button
                    className="action-icon check-icon"
                    onClick={handleAddItem}
                    title="Add item"
                    disabled={!emptyRowData.name.trim() && emptyRowData.amount <= 0}
                  >
                    ✓
                  </button>
                  <button
                    className="action-icon x-icon"
                    onClick={handleClearEmptyRow}
                    title="Clear inputs"
                  >
                    ✕
                  </button>
                </div>
                <div className="table-cell item-name">
                  <input
                    type="text"
                    value={emptyRowData.name}
                    onChange={(e) => handleEmptyRowNameChange(e.target.value)}
                    placeholder="Enter item name..."
                    className="item-name-input"
                    style={{ color: getCategoryColor(circleOrder[0] as 'needs' | 'savings' | 'wants') }}
                  />
                </div>
                <div className="table-cell item-amount">
                  <div className="amount-input-container">
                    <span className="dollar-sign">$</span>
                    <input
                      type="number"
                      value={emptyRowData.amount || ''}
                      onChange={(e) => handleEmptyRowAmountChange(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className={`item-amount-input ${!emptyRowData.name.trim() ? 'disabled-input' : ''}`}
                      disabled={!emptyRowData.name.trim()}
                    />
                  </div>
                </div>
                <div className="table-cell item-percentage">
                  0%
                </div>
              </div>
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