import React, { useEffect, useState } from 'react';
import { useFinancialTips } from '../scripts/financialTipsAPI';
import '../styles/FinancialTipsSection.css';

interface BudgetItem {
  id: number;
  name: string;
  amount: number;
  percentage: number;
  category: 'needs' | 'savings' | 'wants';
}

interface FinancialTipsSectionProps {
  budgetItems: BudgetItem[];
  income: string;
  customPercentages: {
    needs: number;
    savings: number;
    wants: number;
  };
}

const FinancialTipsSection: React.FC<FinancialTipsSectionProps> = ({
  budgetItems,
  income,
  customPercentages
}) => {
  const { getSmartTips, getRandomTip } = useFinancialTips(budgetItems, income, customPercentages);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tips, setTips] = useState(getSmartTips(3));

  useEffect(() => {
    // Update tips when budget data changes
    setTips(getSmartTips(3));
  }, [budgetItems, income, customPercentages]);

  useEffect(() => {
    // Rotate through tips every 8 seconds
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [tips.length]);

  const handlePrevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const refreshTips = () => {
    setTips(getSmartTips(3));
    setCurrentTipIndex(0);
  };

  if (tips.length === 0) return null;

  const currentTip = tips[currentTipIndex];

  return (
    <section className="financial-tips-section">
      <div className="tips-container">
        <div className="tips-header">
          <h3 className="tips-title">💡 Smart Financial Tips</h3>
          <div className="tips-controls">
            <button className="tips-btn tips-refresh" onClick={refreshTips} title="Refresh Tips">
              🔄
            </button>
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-category">
            <span className={`category-badge category-${currentTip.category}`}>
              {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1)}
            </span>
            <span className="tip-relevance">
              {'⭐'.repeat(Math.min(Math.floor(currentTip.relevance / 2), 5))}
            </span>
          </div>
          
          <h4 className="tip-title">{currentTip.title}</h4>
          <p className="tip-content">{currentTip.tip}</p>
          
          <div className="tip-footer">
            <span className="tip-source">Source: {currentTip.source}</span>
            <div className="tip-navigation">
              <button 
                className="tips-btn tips-nav" 
                onClick={handlePrevTip}
                disabled={tips.length <= 1}
                title="Previous Tip"
              >
                ←
              </button>
              <span className="tip-counter">
                {currentTipIndex + 1} / {tips.length}
              </span>
              <button 
                className="tips-btn tips-nav" 
                onClick={handleNextTip}
                disabled={tips.length <= 1}
                title="Next Tip"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="tip-indicators">
          {tips.map((_, index) => (
            <button
              key={index}
              className={`tip-indicator ${index === currentTipIndex ? 'active' : ''}`}
              onClick={() => setCurrentTipIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinancialTipsSection; 