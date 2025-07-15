import React from 'react';

const QuoteBanner: React.FC = () => {
  return (
    <div className="bg-[var(--bg-card)] mt-12 py-8 px-6 rounded-2xl mx-6 text-center">
      <p className="sub-slogan-txt italic text-[var(--text-sub)] max-w-2xl mx-auto">
        “Do not save what is left after spending, but spend what is left after saving.”
      </p>
      <p className="small-txt mt-4 text-[var(--secondary-color)]">
        — Warren Buffet
      </p>
    </div>
  );
};

export default QuoteBanner;
