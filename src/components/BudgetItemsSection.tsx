import React, { useState, useEffect } from 'react';
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
    getGlobalAllocatedPercentage,
    getRemainingAmountColor,
    getAllocatedPercentageColor,
    getGlobalAllocatedPercentageColor,
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
    validateBudgetLimit,
    getItemValidationError,
    isItemOverBudget,
    isItemNameEmpty,
    isEmptyRowNameEmpty,
    validateEmptyRowBudgetLimit,
    getEmptyRowValidationError,
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
    getCurrentCategoryBudget,
    isLockedItemsUnderfunded
  } = useBudgetItemsSectionLogic(props);

  const [warningMessage, setWarningMessage] = useState('All good! Your budget is on track.');
  const [warningType, setWarningType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (isLockedItemsUnderfunded()) {
      const totalIncome = parseInt(income) || 0;
      const categories = ['needs', 'savings', 'wants'];
      const overfunded = categories
        .map(category => {
          const categoryBudget = Math.floor((customPercentages[category] / 100) * totalIncome);
          const lockedTotal = budgetItems.filter(item => item.category === category && lockedItems.has(item.id)).reduce((sum, item) => sum + item.amount, 0);
          if (lockedTotal > categoryBudget) {
            return `${category.charAt(0).toUpperCase() + category.slice(1)}: locked $${lockedTotal} > budget $${categoryBudget}`;
          }
          return null;
        })
        .filter(Boolean)
        .join(', ');
      setWarningMessage(`Cannot optimize: Locked items exceed category budget. ${overfunded}. Unlock or reduce amounts to proceed.`);
      setWarningType('error');
    }
  }, [budgetItems, lockedItems, customPercentages, income]);

  // Checklist requirements - use the same logic as the displayed values
  const hasItemsInAllCategories = getEmptyCategories().length === 0;
  const remainingAmount = Math.round(parseFloat(getRemainingAmount()));
  const allocatedPercentage = Math.round(parseFloat(getGlobalAllocatedPercentage()));
  const allocatedAllIncome = (remainingAmount === 0 && allocatedPercentage === 100);
  const noOverBudgetCategory = !hasOverBudgetCategory();
  const noLockedItemsUnderfunded = !isLockedItemsUnderfunded();
  const allRequirementsMet = hasItemsInAllCategories && allocatedAllIncome && noOverBudgetCategory && noLockedItemsUnderfunded;

  // Debug log
  console.log('Checklist Debug:', {
    remainingAmount,
    allocatedPercentage,
    hasItemsInAllCategories,
    allocatedAllIncome,
    noOverBudgetCategory,
    noLockedItemsUnderfunded,
    allRequirementsMet,
    canViewReport: canViewReport()
  });

  // Helper for locked items in current category
  const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
  const lockedItemsInCategory = budgetItems.filter(item => item.category === currentCategory && lockedItems.has(item.id));
  const lockedCountInCategory = lockedItemsInCategory.length;
  const lockedTotalInCategory = lockedItemsInCategory.reduce((sum, item) => sum + item.amount, 0);

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
            <div className="allocation-tip checklist-box">
              <h4 className="tip-title">📝 Budget Setup Checklist</h4>
              <ul className="checklist small-text">
                <li className={`checklist-item${hasItemsInAllCategories ? ' completed' : ''}`}>
                  <span className="checkbox">{hasItemsInAllCategories ? '✅' : '⬜'}</span>
                  <span className="checklist-text">Add at least 1 item to each category (Needs, Savings, Wants)</span>
                </li>
                <li className={`checklist-item${allocatedAllIncome ? ' completed' : ''}`}>
                  <span className="checkbox">{allocatedAllIncome ? '✅' : '⬜'}</span>
                  <span className="checklist-text">Allocate 100% of your income</span>
                </li>
                <li className={`checklist-item${noOverBudgetCategory ? ' completed' : ''}`}>
                  <span className="checkbox">{noOverBudgetCategory ? '✅' : '⬜'}</span>
                  <span className="checklist-text">No category is over budget</span>
                </li>
                <li className={`checklist-item${noLockedItemsUnderfunded ? ' completed' : ''}`}>
                  <span className="checkbox">{noLockedItemsUnderfunded ? '✅' : '⬜'}</span>
                  <span className="checklist-text">No locked items exceed category budget</span>
                </li>
                <li className={`checklist-item${allRequirementsMet ? ' completed' : ''}`}>
                  <span className="checkbox">{allRequirementsMet ? '✅' : '⬜'}</span>
                  <span className="checklist-text">All requirements met! "Optimize & View Report" is enabled</span>
                </li>
              </ul>
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
                          onClick={() => {
                            if (!canLockItem(item)) {
                              setWarningMessage(getLockButtonTitle(item));
                              setWarningType('error');
                            } else {
                              handleLockToggle(item.id);
                            }
                          }}
                          disabled={!canLockItem(item)}
                          onMouseEnter={() => {
                            if (!canLockItem(item)) {
                              setWarningMessage(getLockButtonTitle(item));
                              setWarningType('error');
                            }
                          }}
                          onMouseLeave={() => {
                            setWarningMessage('All good! Your budget is on track.');
                            setWarningType('success');
                          }}
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
                      onMouseEnter={() => {
                        if (isItemNameEmpty(item.id)) {
                          setWarningMessage('Enter item name first');
                          setWarningType('error');
                        }
                      }}
                      onMouseLeave={() => {
                        setWarningMessage('All good! Your budget is on track.');
                        setWarningType('success');
                      }}
                    />
                  </div>
                  <div className="table-cell item-amount">
                    <div className="amount-input-container">
                      <span className="dollar-sign">$</span>
                      <input
                        type="number"
                        value={item.amount ? Math.round(item.amount) : ''}
                        onChange={(e) => handleItemAmountChange(item.id, Math.round(parseFloat(e.target.value)) || 0)}
                        onBlur={() => clearCurrentInputValue(item.id)}
                        placeholder="0"
                        min="0"
                        step="1"
                        className={`item-amount-input ${lockedItems.has(item.id) ? 'locked-input' : ''} ${isItemOverBudget(item.id) ? 'error-input' : ''} ${isItemNameEmpty(item.id) ? 'disabled-input' : ''}`}
                        disabled={lockedItems.has(item.id) || isItemNameEmpty(item.id)}
                        title={isItemNameEmpty(item.id) ? 'Enter item name first' : getItemValidationError(item.id)}
                      />
                      {isItemOverBudget(item.id) && (
                        <div className="validation-error">
                          {getItemValidationError(item.id)}
                        </div>
                      )}
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
                      onClick={() => handleAddItem((msg) => { setWarningMessage(msg); setWarningType('error'); })}
                      disabled={isCurrentCategoryOverBudget()}
                      onMouseEnter={() => {
                        if (isCurrentCategoryOverBudget()) {
                          setWarningMessage(`Cannot add: ${circleOrder[0].charAt(0).toUpperCase() + circleOrder[0].slice(1)} category is over budget`);
                          setWarningType('error');
                        }
                      }}
                      onMouseLeave={() => {
                        setWarningMessage('All good! Your budget is on track.');
                        setWarningType('success');
                      }}
                    >
                      {emptyRowData.amount > 0 ? '🔒' : (
                        <img src="/images/icons/check-mark.png" alt="Add" className="action-icon-img" />
                      )}
                    </button>
                    {isCurrentCategoryOverBudget() && (
                      <div className="custom-tooltip">
                        {`Cannot add: ${circleOrder[0].charAt(0).toUpperCase() + circleOrder[0].slice(1)} category is over budget`}
                      </div>
                    )}
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
                      onBlur={() => {
                        if (!emptyRowData.name.trim()) {
                          handleClearEmptyRow();
                        }
                      }}
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
                        value={emptyRowData.amount ? Math.round(emptyRowData.amount) : ''}
                        onChange={(e) => handleEmptyRowAmountChange(Math.round(parseFloat(e.target.value)) || 0)}
                        placeholder="0"
                        min="0"
                        step="1"
                        className={`item-amount-input ${validateEmptyRowBudgetLimit() ? 'error-input' : ''} ${isEmptyRowNameEmpty() ? 'disabled-input' : ''}`}
                        disabled={isEmptyRowNameEmpty()}
                        title={isEmptyRowNameEmpty() ? 'Enter item name first' : getEmptyRowValidationError()}
                      />
                      {validateEmptyRowBudgetLimit() && (
                        <div className="validation-error">
                          {getEmptyRowValidationError()}
                        </div>
                      )}
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
                      setWarningMessage(`Cannot add more items: ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} category is over budget ($${Math.round(categoryBudget)}). Please reduce existing amounts or optimize your budget first.`);
                      setWarningType('error');
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
                  ${Math.round(parseFloat(getRemainingAmount()))}
                </div>
              </div>
              <div className="allocation-info-box">
                <div className="allocation-info-header">
                  <div 
                    className="allocation-color-indicator"
                    style={{ backgroundColor: getGlobalAllocatedPercentageColor() }}
                  ></div>
                <h4 className="allocation-info-title">Allocated Percentage</h4>
                </div>
                <div className="allocation-info-value">
                  {Math.round(parseFloat(getGlobalAllocatedPercentage()))}%
                </div>
              </div>
              <div className="allocation-info-box">
                <div className="allocation-info-header">
                  <div 
                    className="allocation-color-indicator"
                    style={{ backgroundColor: '#FFD700' }}
                  ></div>
                <h4 className="allocation-info-title">Locked Items ({lockedCountInCategory})</h4>
                </div>
                <div className="allocation-info-value">
                  ${lockedTotalInCategory}
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Action Buttons */}
          <div className="budget-actions">
            <div className="action-buttons-container">
              <button 
                className={`view-report-btn ${!allRequirementsMet ? 'disabled' : ''}`}
                disabled={!allRequirementsMet}
                onClick={() => {
                  if (allRequirementsMet) {
                    handleAutoFix();
                    setTimeout(() => {
                      document.body.style.overflow = 'auto';
                      document.documentElement.style.overflow = 'auto';
                      const reportSection = document.getElementById('report');
                      if (reportSection) {
                        reportSection.scrollIntoView({ behavior: 'smooth' });
                      }
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
              {!allRequirementsMet && (
                <div className="custom-tooltip">
                  {hasOverBudgetCategory() && `Cannot view report: ${getOverBudgetCategories().map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')} ${getOverBudgetCategories().length === 1 ? 'is' : 'are'} over budget.`}
                  {hasEmptyCategory() && `Cannot view report: ${getEmptyCategories().map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')} ${getEmptyCategories().length === 1 ? 'has' : 'have'} no items added.`}
                  {!hasOverBudgetCategory() && !hasEmptyCategory() && 'Complete your budget setup first'}
                </div>
              )}
              <button className="optimize-btn" onClick={handleAutoFix} disabled={isLockedItemsUnderfunded()} aria-disabled={isLockedItemsUnderfunded()}>
                <span className="btn-icon">✨</span>
                <span className="btn-text">Optimize Budget</span>
              </button>
              {/* allocation-tip-note moved here */}
              <div className="allocation-tip-note">
                <strong>💡 Tip:</strong> Items with amounts are automatically locked. Use 🔓 to unlock and edit.
              </div>
            </div>
          </div>
          {/* Budget warning now as a new row below budget-actions */}
          <div className={`budget-warning budget-warning-row ${warningType === 'success' ? 'success' : 'error'}`}>
            <span className="warning-icon">{warningType === 'success' ? '✅' : '⚠️'}</span>
            <div className="warning-content">
              <p className="warning-text">{warningMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetItemsSection; 