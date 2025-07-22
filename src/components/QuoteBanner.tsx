import React from 'react';
import { useQuoteBannerLogic } from '../scripts/quoteBannerLogic';
import '../styles/QuoteBanner.css';

const QuoteBanner: React.FC = () => {
  const { currentQuote, isVisible } = useQuoteBannerLogic();

  return (
    <div className={`quote-banner ${isVisible ? 'quote-visible' : 'quote-fade'}`}>
      <p className="quote-text">
        "{currentQuote.text}"
      </p>
      <p className="quote-author">
        — {currentQuote.author}
      </p>
    </div>
  );
};

export default QuoteBanner;
