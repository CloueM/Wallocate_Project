import React from 'react';
import { useTipsBannerLogic } from '../scripts/tipsBannerLogic.ts';
import '../styles/TipsBanner.css';

const TipsBanner: React.FC = () => {
  const { currentTip, isVisible } = useTipsBannerLogic();

  return (
    <div className={`tips-banner ${isVisible ? 'tip-visible' : 'tip-fade'}`}>
      <div className="tip-content">
        <span className="tip-title">💡 Tips</span>
        <div className="tip-text-container">
          <span className="tip-text">{currentTip.text}</span>
        </div>
      </div>
    </div>
  );
};

export default TipsBanner; 