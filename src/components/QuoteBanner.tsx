import React, { useState, useEffect } from 'react';

const quotes = [
  {
    text: "Do not save what is left after spending, but spend what is left after saving",
    author: "Warren Buffet"
  },
  {
    text: "A goal without a plan is just a wish.",
    author: "Antoine de Saint-Exupéry"
  },
  {
    text: "The best way to predict the future is to plan for it.",
    author: "Abraham Lincoln"
  },
  {
    text: "Clarity comes from action, not thought.",
    author: "Marie Forleo"
  },
  {
    text: "Planning is bringing the future into the present so you can do something about it now.",
    author: "Alan Lakein"
  },
  {
    text: "The secret to getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki"
  },
  {
    text: "Commit to the Lord whatever you do, and he will establish your plans.",
    author: "Proverbs 16:3"
  },
  {
    text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
    author: "Proverbs 21:5"
  }
];

const QuoteBanner: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => 
          prevIndex === quotes.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 500); // Half second fade out before changing quote
      
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentQuoteIndex];

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
