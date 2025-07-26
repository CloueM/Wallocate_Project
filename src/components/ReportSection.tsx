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
    // Current Budget Analysis
    categoryBalance,
    riskAnalysis,
    efficiencyScore,
    
    // Financial Projections
    savingsGrowth,
    goalTimeline,
    retirementProjection,
    emergencyFundTimeline,
    
    // Smart Recommendations
    optimizationSuggestions,
    benchmarkComparisons,
    riskWarnings,
    goalPriority,
    
    // What-If Scenarios
    incomeChangeImpact,
    expenseAdjustments,
    savingsRateChanges,
    
    // What-If Scenario Controls
    setIncomeChangePercentage,
    setExpenseChangeAmount,
    setSavingsRatePercentage,
    
    // Export functions
    exportToPDF,
    exportToCSV
  } = useReportSectionLogic(props);

  return (
    <section className="report-section" id="report">
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div className="header-content">
            <h1 className="report-title">Financial Health Report</h1>
            <p className="report-subtitle">Comprehensive analysis of your budget and financial projections</p>
          </div>
          <div className="header-actions">
            <button className="export-btn" onClick={exportToPDF}>
              📄 Export PDF
            </button>
            <button className="export-btn" onClick={exportToCSV}>
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* Row 1: Current Budget Analysis */}
        <div className="report-row row-1">
          <h2 className="row-title">Current Budget Analysis</h2>
          <div className="analysis-grid">
            <div className="analysis-card category-balance">
              <div className="card-header">
                <h3 className="card-title">Category Balance Assessment</h3>
                <span className="card-icon">⚖️</span>
              </div>
              <div className="card-content">
                <div className="balance-overview">
                  <div className="balance-item">
                    <span className="balance-label">Needs</span>
                    <span className="balance-value">{categoryBalance.needs.percentage}%</span>
                    <span className={`balance-status ${categoryBalance.needs.status}`}>
                      {categoryBalance.needs.assessment}
                    </span>
                  </div>
                  <div className="balance-item">
                    <span className="balance-label">Savings</span>
                    <span className="balance-value">{categoryBalance.savings.percentage}%</span>
                    <span className={`balance-status ${categoryBalance.savings.status}`}>
                      {categoryBalance.savings.assessment}
                    </span>
                  </div>
                  <div className="balance-item">
                    <span className="balance-label">Wants</span>
                    <span className="balance-value">{categoryBalance.wants.percentage}%</span>
                    <span className={`balance-status ${categoryBalance.wants.status}`}>
                      {categoryBalance.wants.assessment}
                    </span>
                  </div>
                </div>
                <div className="balance-recommendation">
                  <span className="recommendation-text">{categoryBalance.recommendation}</span>
                </div>
              </div>
            </div>

            <div className="analysis-card risk-analysis">
              <div className="card-header">
                <h3 className="card-title">Risk Analysis</h3>
                <span className="card-icon">🛡️</span>
              </div>
              <div className="card-content">
                <div className="risk-metrics">
                  <div className="risk-metric">
                    <span className="metric-label">Emergency Fund</span>
                    <span className="metric-value">{riskAnalysis.emergencyFund.months} months</span>
                    <span className={`metric-status ${riskAnalysis.emergencyFund.status}`}>
                      {riskAnalysis.emergencyFund.level}
                    </span>
                  </div>
                  <div className="risk-metric">
                    <span className="metric-label">Debt Load</span>
                    <span className="metric-value">{riskAnalysis.debtLoad.percentage}%</span>
                    <span className={`metric-status ${riskAnalysis.debtLoad.status}`}>
                      {riskAnalysis.debtLoad.level}
                    </span>
                  </div>
                  <div className="risk-metric">
                    <span className="metric-label">Financial Stability</span>
                    <span className="metric-value">{riskAnalysis.stability.score}/100</span>
                    <span className={`metric-status ${riskAnalysis.stability.status}`}>
                      {riskAnalysis.stability.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="analysis-card efficiency-score">
              <div className="card-header">
                <h3 className="card-title">Efficiency Score</h3>
                <span className="card-icon">📈</span>
              </div>
              <div className="card-content">
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-number">{efficiencyScore.overall}</span>
                    <span className="score-grade">{efficiencyScore.grade}</span>
                  </div>
                  <div className="score-breakdown">
                    <div className="score-item">
                      <span className="score-label">Budget Alignment</span>
                      <span className="score-value">{efficiencyScore.alignment}/100</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Savings Rate</span>
                      <span className="score-value">{efficiencyScore.savingsRate}/100</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Risk Management</span>
                      <span className="score-value">{efficiencyScore.riskManagement}/100</span>
                    </div>
                  </div>
                </div>
                <div className="efficiency-tip">
                  <span className="tip-text">{efficiencyScore.improvementTip}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Financial Projections */}
        <div className="report-row row-2">
          <h2 className="row-title">Financial Projections</h2>
          <div className="projections-grid">
            <div className="projection-card savings-growth">
              <div className="card-header">
                <h3 className="card-title">Savings Growth</h3>
                <span className="card-icon">💰</span>
              </div>
              <div className="card-content">
                <div className="projection-timeline">
                  <div className="timeline-item">
                    <span className="timeline-period">1 Year</span>
                    <span className="timeline-value">${savingsGrowth.oneYear.toLocaleString()}</span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-period">5 Years</span>
                    <span className="timeline-value">${savingsGrowth.fiveYears.toLocaleString()}</span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-period">10 Years</span>
                    <span className="timeline-value">${savingsGrowth.tenYears.toLocaleString()}</span>
                  </div>
                </div>
                <div className="growth-rate">
                  <span className="growth-text">Assuming {savingsGrowth.assumedRate}% annual return</span>
                </div>
              </div>
            </div>

            <div className="projection-card goal-timeline">
              <div className="card-header">
                <h3 className="card-title">Goal Achievement</h3>
                <span className="card-icon">🎯</span>
              </div>
              <div className="card-content">
                <div className="goal-items">
                  {goalTimeline.map((goal, index) => (
                    <div key={index} className="goal-item">
                      <span className="goal-name">{goal.name}</span>
                      <span className="goal-time">{goal.timeToAchieve}</span>
                      <span className="goal-amount">${goal.targetAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="projection-card retirement-projection">
              <div className="card-header">
                <h3 className="card-title">Retirement Outlook</h3>
                <span className="card-icon">🏖️</span>
              </div>
              <div className="card-content">
                <div className="retirement-metrics">
                  <div className="retirement-item">
                    <span className="retirement-label">At Age 65</span>
                    <span className="retirement-value">${retirementProjection.atAge65.toLocaleString()}</span>
                  </div>
                  <div className="retirement-item">
                    <span className="retirement-label">Monthly Income</span>
                    <span className="retirement-value">${retirementProjection.monthlyIncome.toLocaleString()}</span>
                  </div>
                  <div className="retirement-item">
                    <span className="retirement-label">Readiness</span>
                    <span className={`retirement-status ${retirementProjection.readiness.status}`}>
                      {retirementProjection.readiness.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="projection-card emergency-timeline">
              <div className="card-header">
                <h3 className="card-title">Emergency Fund</h3>
                <span className="card-icon">🚨</span>
              </div>
              <div className="card-content">
                <div className="emergency-progress">
                  <div className="emergency-item">
                    <span className="emergency-label">Current</span>
                    <span className="emergency-value">{emergencyFundTimeline.current} months</span>
                  </div>
                  <div className="emergency-item">
                    <span className="emergency-label">Target (6 months)</span>
                    <span className="emergency-value">{emergencyFundTimeline.timeToTarget}</span>
                  </div>
                  <div className="emergency-item">
                    <span className="emergency-label">Target Amount</span>
                    <span className="emergency-value">${emergencyFundTimeline.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Smart Recommendations */}
        <div className="report-row row-3">
          <h2 className="row-title">Smart Recommendations</h2>
          <div className="recommendations-grid">
            <div className="recommendation-card optimization">
              <div className="card-header">
                <h3 className="card-title">Optimization Suggestions</h3>
                <span className="card-icon">⚡</span>
              </div>
              <div className="card-content">
                <div className="optimization-list">
                  {optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="optimization-item">
                      <span className="optimization-action">{suggestion.action}</span>
                      <span className="optimization-impact">+{suggestion.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="recommendation-card benchmarks">
              <div className="card-header">
                <h3 className="card-title">Benchmark Comparison</h3>
                <span className="card-icon">📊</span>
              </div>
              <div className="card-content">
                <div className="benchmark-items">
                  {benchmarkComparisons.map((benchmark, index) => (
                    <div key={index} className="benchmark-item">
                      <span className="benchmark-rule">{benchmark.rule}</span>
                      <span className="benchmark-your">You: {benchmark.yourValue}</span>
                      <span className="benchmark-ideal">Ideal: {benchmark.idealValue}</span>
                      <span className={`benchmark-status ${benchmark.status}`}>
                        {benchmark.assessment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="recommendation-card risk-warnings">
              <div className="card-header">
                <h3 className="card-title">Risk Warnings</h3>
                <span className="card-icon">⚠️</span>
              </div>
              <div className="card-content">
                <div className="warning-list">
                  {riskWarnings.map((warning, index) => (
                    <div key={index} className={`warning-item ${warning.severity}`}>
                      <span className="warning-message">{warning.message}</span>
                      <span className="warning-action">{warning.recommendedAction}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="recommendation-card goal-priority">
              <div className="card-header">
                <h3 className="card-title">Goal Prioritization</h3>
                <span className="card-icon">🎯</span>
              </div>
              <div className="card-content">
                <div className="priority-list">
                  {goalPriority.map((goal, index) => (
                    <div key={index} className="priority-item">
                      <span className="priority-rank">#{index + 1}</span>
                      <span className="priority-goal">{goal.name}</span>
                      <span className="priority-reason">{goal.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: What-If Scenarios */}
        <div className="report-row row-4">
          <h2 className="row-title">What-If Scenarios</h2>
          <div className="scenarios-grid">
            <div className="scenario-card income-impact">
              <div className="card-header">
                <h3 className="card-title">Income Change Impact</h3>
                <span className="card-icon">💼</span>
              </div>
              <div className="card-content">
                <div className="scenario-controls">
                  <div className="control-group">
                    <label className="control-label">Income Change</label>
                    <input 
                      type="range" 
                      min="-50" 
                      max="50" 
                      value={incomeChangeImpact.percentage}
                      onChange={(e) => setIncomeChangePercentage(parseInt(e.target.value))}
                      className="scenario-slider"
                    />
                    <span className="control-value">{incomeChangeImpact.percentage}%</span>
                  </div>
                  <div className="impact-results">
                    <div className="impact-item">
                      <span className="impact-label">New Monthly Income</span>
                      <span className="impact-value">${incomeChangeImpact.newIncome.toLocaleString()}</span>
                    </div>
                    <div className="impact-item">
                      <span className="impact-label">Savings Impact</span>
                      <span className="impact-value">${incomeChangeImpact.savingsImpact.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="scenario-card expense-adjustments">
              <div className="card-header">
                <h3 className="card-title">Expense Adjustments</h3>
                <span className="card-icon">🏠</span>
              </div>
              <div className="card-content">
                <div className="scenario-controls">
                  <div className="control-group">
                    <label className="control-label">Major Expense Change</label>
                    <input 
                      type="range" 
                      min="-500" 
                      max="500" 
                      value={expenseAdjustments.amount}
                      onChange={(e) => setExpenseChangeAmount(parseInt(e.target.value))}
                      className="scenario-slider"
                    />
                    <span className="control-value">${expenseAdjustments.amount}</span>
                  </div>
                  <div className="impact-results">
                    <div className="impact-item">
                      <span className="impact-label">Remaining for Other Categories</span>
                      <span className="impact-value">${expenseAdjustments.remainingFunds.toLocaleString()}</span>
                    </div>
                    <div className="impact-item">
                      <span className="impact-label">Budget Health Impact</span>
                      <span className={`impact-status ${expenseAdjustments.healthImpact.status}`}>
                        {expenseAdjustments.healthImpact.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="scenario-card savings-rate">
              <div className="card-header">
                <h3 className="card-title">Savings Rate Changes</h3>
                <span className="card-icon">📈</span>
              </div>
              <div className="card-content">
                <div className="scenario-controls">
                  <div className="control-group">
                    <label className="control-label">Savings Rate</label>
                    <input 
                      type="range" 
                      min="5" 
                      max="50" 
                      value={savingsRateChanges.rate}
                      onChange={(e) => setSavingsRatePercentage(parseInt(e.target.value))}
                      className="scenario-slider"
                    />
                    <span className="control-value">{savingsRateChanges.rate}%</span>
                  </div>
                  <div className="impact-results">
                    <div className="impact-item">
                      <span className="impact-label">10-Year Savings</span>
                      <span className="impact-value">${savingsRateChanges.tenYearProjection.toLocaleString()}</span>
                    </div>
                    <div className="impact-item">
                      <span className="impact-label">Retirement Readiness</span>
                      <span className={`impact-status ${savingsRateChanges.retirementImpact.status}`}>
                        {savingsRateChanges.retirementImpact.level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportSection; 