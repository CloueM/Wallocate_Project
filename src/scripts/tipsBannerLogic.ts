import { useState, useEffect } from 'react';

interface Tip {
  id: number;
  text: string;
}

const tips: Tip[] = [
  {
    id: 1,
    text: "Click colored circles (Needs/Savings/Wants) to switch between categories"
  },
  {
    id: 2,
    text: "Enter amounts to automatically lock items (🔒) and preserve your inputs"
  },
  {
    id: 3,
    text: "Use 🔓 to unlock and edit locked items when you need to make changes"
  },
  {
    id: 4,
    text: "\"Optimize Budget\" redistributes remaining funds across all unlocked items"
  },
  {
    id: 5,
    text: "Complete all categories at 100% allocation to view your detailed report"
  },
  {
    id: 6,
    text: "Add new items by clicking the \"+\" row at the bottom of each category"
  },
  {
    id: 7,
    text: "Delete items using the ✕ button, or lock them to prevent accidental changes"
  }
];

export const useTipsBannerLogic = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
        setIsVisible(true);
      }, 500);
      
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    currentTip: tips[currentTipIndex],
    isVisible
  };
}; 