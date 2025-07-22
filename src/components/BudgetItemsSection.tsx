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
}

const BudgetItemsSection: React.FC<BudgetItemsSectionProps> = (props) => {
  const { selectedPlan, setSelectedPlan, customPercentages, setCustomPercentages, income } = props;

  const {
    budgetItems,
    setBudgetItems,
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
    handleCheckMarkClick,
    handleXMarkClick,
    calculateItemPercentage,
    getCurrentCategoryItems,
    handleCircleClick,
    handleBackClick
  } = useBudgetItemsSectionLogic(props);

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

          {/* Information System */}
          <div className="plan-details-container">
            <div className="info-header">
              <h3 className="info-title">Budget Overview</h3>
              <button className="back-btn" onClick={handleBackClick}>
                <span className="back-btn-text">Back</span>
              </button>
            </div>

            {/* Status Section */}
            <div className="info-section">
              <h4 className="section-title">Status</h4>
              <div className="status-grid">
                <div className={`status-box ${getCategoryStatus('needs').color}`}>
                  <span className="status-category">Needs</span>
                  <span className="status-text">{getCategoryStatus('needs').status}</span>
                </div>
                <div className={`status-box ${getCategoryStatus('savings').color}`}>
                  <span className="status-category">Savings</span>
                  <span className="status-text">{getCategoryStatus('savings').status}</span>
                </div>
                <div className={`status-box ${getCategoryStatus('wants').color}`}>
                  <span className="status-category">Wants</span>
                  <span className="status-text">{getCategoryStatus('wants').status}</span>
                </div>
              </div>
            </div>

            {/* Items Added Section */}
            <div className="info-section">
              <h4 className="section-title">Items Added</h4>
              <div className="items-grid">
                <div className="items-box needs">
                  <span className="items-category">Needs</span>
                  <span className="items-count">{getCategoryItemsCount('needs')}</span>
                </div>
                <div className="items-box savings">
                  <span className="items-category">Savings</span>
                  <span className="items-count">{getCategoryItemsCount('savings')}</span>
                </div>
                <div className="items-box wants">
                  <span className="items-category">Wants</span>
                  <span className="items-count">{getCategoryItemsCount('wants')}</span>
                </div>
                <div className="items-box total">
                  <span className="items-category">Total</span>
                  <span className="items-count">{budgetItems.length}</span>
                </div>
              </div>
            </div>

            {/* Largest Single Item Section */}
            <div className="info-section">
              <h4 className="section-title">Largest Single Item</h4>
              <div className="largest-items-grid">
                {(['needs', 'savings', 'wants'] as const).map(category => {
                  const largestItem = getLargestItem(category);
                  return (
                    <div key={category} className="largest-item-box">
                      <span className="largest-category">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      {largestItem ? (
                        <div className="largest-item-info">
                          <span className="largest-item-name">👑 {largestItem.name}</span>
                          <span className="largest-item-amount">${largestItem.amount.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="no-items">No items added</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Average Item Cost Section */}
            <div className="info-section">
              <h4 className="section-title">Average Item Cost</h4>
              <div className="average-grid">
                {(['needs', 'savings', 'wants'] as const).map(category => {
                  const average = getAverageItemCost(category);
                  const itemCount = getCategoryItemsCount(category);
                  return (
                    <div key={category} className="average-box">
                      <span className="average-category">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      {itemCount > 0 ? (
                        <span className="average-amount">${average.toFixed(2)}</span>
                      ) : (
                        <span className="no-items">No items</span>
                      )}
                    </div>
                  );
                })}
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
                        <img src="/images/icons/edit-mark.png" alt="Edit" className="action-icon-img" />
                      </button>
                    ) : (
                      <>
                        <button
                          className="action-icon check-icon"
                          onClick={() => handleCheckMarkClick(item.id)}
                          title="Lock item"
                        >
                          <img src="/images/icons/check-mark.png" alt="Lock" className="action-icon-img" />
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
                    <img src="/images/icons/check-mark.png" alt="Add" className="action-icon-img" />
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

          {/* Row 4: Allocation Info */}
          <div className="budget-allocation-row">
            <div className="allocation-left">
              <div className="allocation-tip">
                <h4 className="tip-title">{getSmartTip().title}</h4>
                <p className="tip-text">
                  {getSmartTip().text}
                </p>
              </div>
            </div>
            <div className="allocation-right">
              <div className="allocation-info-box">
                <h4 className="allocation-info-title">Remaining to Allocate</h4>
                <div className="allocation-info-value">
                  ${getRemainingAmount()}
                </div>
              </div>
              <div className="allocation-info-box">
                <h4 className="allocation-info-title">Allocated Percentage</h4>
                <div className="allocation-info-value">
                  {getAllocatedPercentage()}%
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
                title={!canViewReport() ? 'Complete your budget setup first' : 'View your budget report'}
              >
                <span className="btn-icon">📊</span>
                <span className="btn-text">View Report</span>
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
                      ? "Click \"Optimize Budget\" to automatically fill empty categories and balance over-budget items."
                      : hasOverBudgetCategory()
                      ? "Click \"Optimize Budget\" to automatically adjust your allocations and balance your budget."
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