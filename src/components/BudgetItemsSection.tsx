import React from 'react';
import { useBudgetItemsSectionLogic } from '../scripts/budgetItemsSectionLogic';
import '../styles/BudgetItemsSection.css';

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
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
}

const BudgetItemsSection: React.FC<BudgetItemsSectionProps> = (props) => {
  const { selectedPlan, setSelectedPlan, customPercentages, setCustomPercentages, income, budgetItems, setBudgetItems } = props;

  const {
    lockedItems,
    setLockedItems,
    totalAmount,
    totalPercentage,
    circleOrder,
    setCircleOrder,
    circleRefs,
    budgetSummaryInfoRef,
    emptyRowData,
    setEmptyRowData,
    userInput,
    setUserInput,
    handleAutoFix,
    getCategoryColor,
    getCurrentCategoryAmount,
    getRemainingAmount,
    getAllocatedPercentage,
    getRemainingAmountColor,
    getAllocatedPercentageColor,
    getCategoryStatus,
    hasOverBudgetCategory,
    hasEmptyCategory,
    canViewReport,
    getOverBudgetCategories,
    getEmptyCategories,
    getCategoryItemsCount,
    getLargestItem,
    getAverageItemCost,
    getSmartTip,
    handleItemNameChange,
    handleItemAmountChange,
    handleEmptyRowNameChange,
    handleEmptyRowAmountChange,
    handleAddItem,
    handleClearEmptyRow,
    handleLockToggle,
    canLockItem,
    getLockButtonTitle,
    clearCurrentInputValue,
    handleXMarkClick,
    calculateItemPercentage,
    getCurrentCategoryItems,
    handleCircleClick,
    handleBackClick,
    getInteractiveGuide,
    getLockedItemsTotal,
    getLockedItemsCount,
    isCurrentCategoryOverBudget,
    getCurrentCategoryBudget
  } = useBudgetItemsSectionLogic(props);

  return (
    <section className="budget-items-section" id="budget-items">
      <div className="budget-items-container">
        {/* Left Column - Copied from plan-right */}
        <div className="budget-items-left">
          {/* Income Input */}
          <div className="income-section">
            <label className="income-label">Enter your total income:</label>
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
                <button className="back-btn" onClick={handleBackClick}>
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
                        className="budget-slider disabled"
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
                        className="budget-slider disabled"
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
                        className="budget-slider disabled"
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
            <div className="allocation-tip-container">
              <div className="allocation-tip">
                <h4 className="tip-title">💡 Budget Setup Guide</h4>
                <div className="tip-content">
                  <div className="tip-step">
                    <span className="step-number">1</span>
                    <span className="step-text">Add items to all three categories (Needs, Savings, Wants)</span>
                  </div>
                  <div className="tip-step">
                    <span className="step-number">2</span>
                    <span className="step-text">Enter amounts for your items to allocate your income</span>
                  </div>
                  <div className="tip-step">
                    <span className="step-number">3</span>
                    <span className="step-text">Lock important items you don't want changed during optimization</span>
                  </div>
                  <div className="tip-step">
                    <span className="step-number">4</span>
                    <span className="step-text">Click "Optimize Budget" to automatically balance remaining funds</span>
                  </div>
                  <div className="tip-step">
                    <span className="step-number">5</span>
                    <span className="step-text">Once 100% allocated, click "View Report" for detailed analysis</span>
                  </div>
                </div>
              </div>
              <div className="allocation-tip-note">
                <strong>💡 Tip:</strong> Items with amounts are automatically locked. Use 🔓 to unlock and edit.
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
                        className="action-icon unlock-icon"
                        onClick={() => handleLockToggle(item.id)}
                        title="Unlock item"
                      >
                        🔓
                      </button>
                    ) : (
                      <>
                        <button
                          className={`action-icon lock-icon ${!canLockItem(item) ? 'disabled' : ''}`}
                          onClick={() => canLockItem(item) && handleLockToggle(item.id)}
                          title={getLockButtonTitle(item)}
                          disabled={!canLockItem(item)}
                        >
                          🔒
                        </button>
                        <button
                          className="action-icon x-icon"
                          onClick={() => handleXMarkClick(item.id)}
                          title="Delete item"
                        >
                          <img src="/images/icons/cross-mark.png" alt="Delete" className="action-icon-img" />
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
                        onBlur={() => clearCurrentInputValue(item.id)}
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
              {/* Show empty input row only when user starts typing */}
              {(emptyRowData.name !== '' || emptyRowData.amount > 0) && (
                <div className="table-row input-row">
                  <div className="table-cell table-actions-cell">
                    <button
                      className={`action-icon check-icon ${isCurrentCategoryOverBudget() ? 'disabled' : ''}`}
                      onClick={handleAddItem}
                      title={isCurrentCategoryOverBudget() ? 
                        `Cannot add: ${circleOrder[0].charAt(0).toUpperCase() + circleOrder[0].slice(1)} category is over budget` : 
                        (emptyRowData.amount > 0 ? "Add and lock item" : "Add item")
                      }
                      disabled={isCurrentCategoryOverBudget()}
                    >
                      {emptyRowData.amount > 0 ? '🔒' : (
                        <img src="/images/icons/check-mark.png" alt="Add" className="action-icon-img" />
                      )}
                    </button>
                    <button
                      className="action-icon x-icon"
                      onClick={handleClearEmptyRow}
                      title="Clear inputs"
                    >
                      <img src="/images/icons/cross-mark.png" alt="Clear" className="action-icon-img" />
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
                        className="item-amount-input"
                      />
                    </div>
                  </div>
                  <div className="table-cell item-percentage">
                    0%
                  </div>
                </div>
              )}
              
              {/* Always show a trigger row for adding new items */}
              {(emptyRowData.name === '' && emptyRowData.amount === 0) && (
                <div 
                  className={`table-row add-item-trigger ${isCurrentCategoryOverBudget() ? 'disabled' : ''}`} 
                  onClick={() => {
                    // Don't allow adding if category is over budget
                    if (isCurrentCategoryOverBudget()) {
                      const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
                      const categoryBudget = getCurrentCategoryBudget();
                      alert(`Cannot add more items: ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} category is over budget ($${categoryBudget.toFixed(2)}). Please reduce existing amounts or optimize your budget first.`);
                      return;
                    }
                    
                    // Simple approach: just set name to a space to trigger the input row
                    setEmptyRowData({ name: ' ', amount: 0 });
                    // Focus after a short delay
                    setTimeout(() => {
                      const nameInput = document.querySelector('.input-row .item-name-input') as HTMLInputElement;
                      if (nameInput) {
                        nameInput.focus();
                        nameInput.select(); // Select the space so user can type over it
                      }
                    }, 100);
                  }}
                  style={{ 
                    cursor: isCurrentCategoryOverBudget() ? 'not-allowed' : 'pointer',
                    opacity: isCurrentCategoryOverBudget() ? 0.5 : 1
                  }}
                >
                  <div className="table-cell table-actions-cell">
                    <span className="add-trigger-icon">+</span>
                  </div>
                  <div className="table-cell item-name add-trigger-text">
                    {isCurrentCategoryOverBudget() ? 'Category over budget' : 'Enter item name...'}
                  </div>
                  <div className="table-cell item-amount add-trigger-text">
                    $0.00
                  </div>
                  <div className="table-cell item-percentage add-trigger-text">
                    0%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Allocation Info */}
          <div className="budget-allocation-row">
            <div className="interactive-guide">
              <h4 className="guide-title">🎯 Smart Guide</h4>
              <div className="guide-content">
                {getInteractiveGuide()}
              </div>
            </div>
            <div className="allocation-right">
              <div className="allocation-info-box">
                <div className="allocation-info-header">
                  <div 
                    className="allocation-color-indicator"
                    style={{ backgroundColor: getRemainingAmountColor() }}
                  ></div>
                <h4 className="allocation-info-title">Remaining to Allocate</h4>
                </div>
                <div className="allocation-info-value">
                  ${getRemainingAmount()}
                </div>
              </div>
              <div className="allocation-info-box">
                <div className="allocation-info-header">
                  <div 
                    className="allocation-color-indicator"
                    style={{ backgroundColor: getAllocatedPercentageColor() }}
                  ></div>
                <h4 className="allocation-info-title">Allocated Percentage</h4>
                </div>
                <div className="allocation-info-value">
                  {getAllocatedPercentage()}%
                </div>
              </div>
              <div className="allocation-info-box">
                <div className="allocation-info-header">
                  <div 
                    className="allocation-color-indicator"
                    style={{ backgroundColor: '#FFD700' }}
                  ></div>
                <h4 className="allocation-info-title">Locked Items ({getLockedItemsCount()})</h4>
                </div>
                <div className="allocation-info-value">
                  ${getLockedItemsTotal()}
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Action Buttons */}
          <div className="budget-actions">
            <div className="action-buttons-container">
              <button 
                className={`view-report-btn ${!canViewReport() ? 'disabled' : ''}`}
                disabled={!canViewReport()}
                title={!canViewReport() ? 'Complete your budget setup first' : 'Optimize budget and view report'}
                onClick={() => {
                  if (canViewReport()) {
                    // First, automatically optimize the budget
                    handleAutoFix();
                    
                    // Small delay to allow optimization to complete
                    setTimeout(() => {
                      // Enable scrolling temporarily
                      document.body.style.overflow = 'auto';
                      document.documentElement.style.overflow = 'auto';
                      
                      // Scroll to report section
                      const reportSection = document.getElementById('report');
                      if (reportSection) {
                        reportSection.scrollIntoView({ behavior: 'smooth' });
                      }
                      
                      // Re-disable scrolling after animation
                      setTimeout(() => {
                        document.body.style.overflow = 'hidden';
                        document.documentElement.style.overflow = 'hidden';
                      }, 1000);
                    }, 100);
                  }
                }}
              >
                <span className="btn-icon">📊</span>
                <span className="btn-text">Optimize & View Report</span>
              </button>
              <button className="optimize-btn" onClick={handleAutoFix}>
                <span className="btn-icon">✨</span>
                <span className="btn-text">Optimize Budget</span>
              </button>
            </div>
            {!canViewReport() && (
              <div className="budget-warning">
                <span className="warning-icon">⚠️</span>
                <div className="warning-content">
                  {hasOverBudgetCategory() && (
                    <p className="warning-text">
                      Cannot view report: {getOverBudgetCategories().map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')} {getOverBudgetCategories().length === 1 ? 'is' : 'are'} over budget.
                    </p>
                  )}
                  {hasEmptyCategory() && (
                    <p className="warning-text">
                      Cannot view report: {getEmptyCategories().map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')} {getEmptyCategories().length === 1 ? 'has' : 'have'} no items added.
                    </p>
                  )}
                  <p className="warning-suggestion">
                    {hasOverBudgetCategory() && hasEmptyCategory() 
                      ? "Click \"Optimize & View Report\" to automatically fill empty categories and balance over-budget items."
                      : hasOverBudgetCategory()
                      ? "Click \"Optimize & View Report\" to automatically adjust your allocations and balance your budget."
                      : "Add items to empty categories."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetItemsSection; 