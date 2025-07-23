import React from 'react';
import { useReportSectionLogic } from '../scripts/reportSectionLogic';
import '../styles/ReportSection.css';

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

interface ReportSectionProps {
  selectedPlan: BudgetPlan;
  customPercentages: {
    needs: number;
    savings: number;
    wants: number;
  };
  income: string;
  budgetItems: BudgetItem[];
}

const ReportSection: React.FC<ReportSectionProps> = (props) => {
  const {
    selectedTimeframe,
    setSelectedTimeframe,
    categoryPerformance,
    monthlyTrends,
    savingsGoals,
    smartTips,
    exportToPDF,
    exportToCSV
  } = useReportSectionLogic(props);

  return (
    <section className="report-section" id="report">
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div>
            <h1 className="report-title">Budget Report</h1>
            <p className="report-subtitle">Comprehensive analysis of your financial planning</p>
          </div>
          <div className="report-actions">
            <div className="timeframe-selector">
              <button 
                className={`timeframe-btn ${selectedTimeframe === 'month' ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe('month')}
              >
                Month
              </button>
              <button 
                className={`timeframe-btn ${selectedTimeframe === 'quarter' ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe('quarter')}
              >
                Quarter
              </button>
              <button 
                className={`timeframe-btn ${selectedTimeframe === 'year' ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe('year')}
              >
                Year
              </button>
            </div>
            <button className="export-btn" onClick={exportToPDF}>
              📊 Export PDF
            </button>
            <button className="export-btn" onClick={exportToCSV}>
              📁 Export CSV
            </button>
          </div>
        </div>





        {/* Personalized Tips Based on Your Budget */}
        <div className="personalized-tips-section">
          <div className="section-header">
            <h2 className="section-title">💡 Personalized Financial Tips</h2>
            <p className="section-subtitle">Based on your actual budget allocations, amounts, and spending patterns</p>
          </div>
          
          {smartTips && smartTips.length > 0 ? (
            <div className="smart-tips-grid">
              {smartTips.map((tip, index) => (
                <div key={tip.id} className={`smart-tip-card tip-${tip.type}`}>
                  <div className="tip-header">
                    <div className={`tip-type-badge tip-type-${tip.type}`}>
                      {tip.type === 'critical' && '🚨'}
                      {tip.type === 'warning' && '⚠️'}
                      {tip.type === 'info' && 'ℹ️'}
                      {tip.type === 'success' && '✅'}
                    </div>
                    <span className="tip-category">{tip.category}</span>
                    <div className="tip-priority">
                      {'⭐'.repeat(Math.min(Math.floor(tip.priority / 2), 5))}
                    </div>
                  </div>
                  
                  <h3 className="tip-title">{tip.title}</h3>
                  <p className="tip-message">{tip.message}</p>
                  
                  {tip.specificItems && tip.specificItems.length > 0 && (
                    <div className="tip-specific-items">
                      <span className="items-label">Related Items:</span>
                      <div className="items-list">
                        {tip.specificItems.map((item, itemIndex) => (
                          <span key={itemIndex} className="item-tag">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tips-message">
              <div className="no-tips-icon">🎉</div>
              <h3>Excellent Financial Management!</h3>
              <p>Your budget is well-balanced and follows financial best practices. Keep up the great work!</p>
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="category-performance">
          <h3>Category Performance Analysis</h3>
          <div className="category-grid">
            {categoryPerformance.map((category) => (
              <div key={category.category} className="category-card">
                <div className="category-header">
                  <h4 className="category-name">{category.category}</h4>
                  <span className={`category-status ${category.status}`}>
                    {category.status === 'good' ? 'On Track' : 
                     category.status === 'over' ? 'Over Budget' : 'Under Budget'}
                  </span>
                </div>
                
                <div className="category-amounts">
                  <div className="amount-row">
                    <span className="amount-label">Target</span>
                    <span className="amount-value">${category.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">Actual</span>
                    <span className="amount-value">${category.actualAmount.toFixed(2)}</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">Variance</span>
                    <span className="amount-value">
                      {category.variance > 0 ? '+' : ''}{category.variance.toFixed(1)}%
                    </span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">Items</span>
                    <span className="amount-value">{category.itemCount}</span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${category.status === 'over' ? 'over' : ''}`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, (category.actualAmount / category.targetAmount) * 100))}%` 
                    }}
                  ></div>
                </div>

                {category.biggestExpense.amount > 0 && (
                  <div className="amount-row">
                    <span className="amount-label">Biggest Expense</span>
                    <span className="amount-value">
                      {category.biggestExpense.name} (${category.biggestExpense.amount.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3 className="chart-title">Monthly Spending Trends</h3>
            <div className="trend-chart">
              {monthlyTrends.map((trend, index) => (
                <div 
                  key={index} 
                  className="trend-bar"
                  style={{ 
                    height: `${(trend.totalSpent / Math.max(...monthlyTrends.map(t => t.totalSpent))) * 100}%` 
                  }}
                >
                  <span className="trend-label">{trend.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Category Distribution</h3>
            <div className="category-grid">
              {categoryPerformance.map((cat) => (
                <div key={cat.category} className="amount-row">
                  <span className="amount-label">{cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}</span>
                  <span className="amount-value">{cat.actualPercentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="goals-section">
          <h3>Savings Goals Progress</h3>
          <div className="goals-grid">
            {savingsGoals.map((goal, index) => (
              <div key={index} className="goal-card">
                <div className="goal-header">
                  <h4 className="goal-name">{goal.name}</h4>
                  <span className={`goal-priority ${goal.priority}`}>
                    {goal.priority} priority
                  </span>
                </div>
                
                <div className="goal-progress">
                  <div className="goal-amounts">
                    <span>${goal.current.toFixed(2)}</span>
                    <span>${goal.target.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="goal-timeline">
                    {((goal.current / goal.target) * 100).toFixed(1)}% complete • {goal.timeline} remaining
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportSection; 