import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

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

export const budgetPlans: BudgetPlan[] = [
  {
    name: "Custom Plan",
    description: "Users with unique priorities who want full control.",
    needs: 50,
    savings: 20,
    wants: 30
  },
  {
    name: "Saver's Plan", 
    description: "Aggressive Savings for Goals or Early Retirement",
    needs: 50,
    savings: 35,
    wants: 15
  },
  {
    name: "Minimalist Plan",
    description: "Frugal lifestyle, freelancers, or anyone reducing expenses to hit goals quickly.",
    needs: 60,
    savings: 25,
    wants: 15
  },
  {
    name: "Survival Plan",
    description: "Students, Low-Income earners, or those in high cost-of-living areas prioritizing essentials.",
    needs: 70,
    savings: 20,
    wants: 10
  },
  {
    name: "Standard Plan",
    description: "Beginners, steady income earners, those wanting a simple, balanced approach.",
    needs: 50,
    savings: 30,
    wants: 20
  }
];

export const useBudgetItemsSectionLogic = (props: BudgetItemsSectionProps) => {
  const { selectedPlan, setSelectedPlan, customPercentages, setCustomPercentages, income } = props;

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [lockedItems, setLockedItems] = useState<Set<number>>(new Set());
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [circleOrder, setCircleOrder] = useState(['needs', 'savings', 'wants']);
  const circleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const budgetSummaryInfoRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);
  const [emptyRowData, setEmptyRowData] = useState({ name: '', amount: 0 });
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    const amount = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const percentage = budgetItems.reduce((sum, item) => sum + item.percentage, 0);
    setTotalAmount(amount);
    setTotalPercentage(percentage);
  }, [budgetItems]);

  // Set initial positions and animate circles when order changes
  useEffect(() => {
    const circles = circleOrder.map(category => circleRefs.current[category]).filter(Boolean);
    
    if (circles.length > 0) {
      const circleWidth = 80;
      const gap = 24;
      
      circles.forEach((circle, index) => {
        if (!circle) return;
        
        const targetX = index * (circleWidth + gap);
        
        if (isInitialRender.current) {
          gsap.set(circle, { x: targetX });
        } else {
          gsap.to(circle, {
            x: targetX,
            duration: 0.1,
            ease: "power2.out"
          });
        }
      });
      
      if (isInitialRender.current) {
        isInitialRender.current = false;
      }
    }
  }, [circleOrder]);

  // Recursive function to calculate percentage to dollar amount
  const calculatePercentageToDollar = (percentage: number, totalIncome: number, precision: number = 2): number => {
    if (precision <= 0) {
      return Math.round((percentage / 100) * totalIncome);
    }
    return Math.round((percentage / 100) * totalIncome * Math.pow(10, precision)) / Math.pow(10, precision);
  };

  // Recursive function to calculate dollar amount to percentage
  const calculateDollarToPercentage = (dollarAmount: number, totalIncome: number, precision: number = 2): number => {
    if (precision <= 0) {
      return Math.round((dollarAmount / totalIncome) * 100);
    }
    return Math.round((dollarAmount / totalIncome) * 100 * Math.pow(10, precision)) / Math.pow(10, precision);
  };

  const handleAutoFix = () => {
    const totalIncome = parseInt(income);
    const newItems = [...budgetItems];
    
    ['needs', 'savings', 'wants'].forEach(category => {
      const categoryItems = newItems.filter(item => item.category === category);
      const categoryPercentage = customPercentages[category as keyof typeof customPercentages];
      const categoryBudget = calculatePercentageToDollar(categoryPercentage, totalIncome);
      
      const currentAllocated = categoryItems.reduce((sum, item) => sum + item.amount, 0);
      const zeroItems = categoryItems.filter(item => item.amount === 0);
      
      if (zeroItems.length > 0) {
        const remainingBudget = categoryBudget - currentAllocated;
        
        if (remainingBudget > 0) {
          const amountPerItem = remainingBudget / zeroItems.length;
          
          zeroItems.forEach(item => {
            const itemIndex = newItems.findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
              newItems[itemIndex] = {
                ...newItems[itemIndex],
                amount: Math.round(amountPerItem * 100) / 100
              };
            }
          });
        }
      }
    });
    
    setBudgetItems(newItems);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'needs': return 'var(--needs-color)';
      case 'savings': return 'var(--savings-color)';
      case 'wants': return 'var(--wants-color)';
      default: return 'var(--secondary-color)';
    }
  };

  const getCurrentCategoryAmount = (): string => {
    const currentCategory = circleOrder[0];
    const percentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const totalIncome = parseInt(income);
    const dollarAmount = calculatePercentageToDollar(percentage, totalIncome);
    return dollarAmount.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getRemainingAmount = (): string => {
    const currentCategory = circleOrder[0];
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    const currentCategoryItems = getCurrentCategoryItems();
    const allocatedAmount = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    const remainingAmount = categoryAmount - allocatedAmount;
    return remainingAmount.toFixed(2);
  };

  const getAllocatedPercentage = (): string => {
    const currentCategory = circleOrder[0];
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    const currentCategoryItems = getCurrentCategoryItems();
    const allocatedAmount = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    if (categoryAmount === 0) return '0.00';
    const allocatedPercentage = (allocatedAmount / categoryAmount) * 100;
    return allocatedPercentage.toFixed(2);
  };

  const getCategoryStatus = (category: 'needs' | 'savings' | 'wants'): { status: string; color: string } => {
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[category];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    const categoryItems = budgetItems.filter(item => item.category === category);
    const allocatedAmount = categoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    if (categoryAmount === 0) return { status: 'No Budget', color: 'gray' };
    
    const percentage = (allocatedAmount / categoryAmount) * 100;
    
    if (percentage > 105) return { status: 'Over Budget', color: 'red' };
    if (percentage < 95) return { status: 'Under Budget', color: 'blue' };
    return { status: 'Perfect Budget', color: 'green' };
  };

  const hasOverBudgetCategory = (): boolean => {
    return ['needs', 'savings', 'wants'].some(category => 
      getCategoryStatus(category as 'needs' | 'savings' | 'wants').color === 'red'
    );
  };

  const hasEmptyCategory = (): boolean => {
    return ['needs', 'savings', 'wants'].some(category => 
      getCategoryItemsCount(category as 'needs' | 'savings' | 'wants') === 0
    );
  };

  const canViewReport = (): boolean => {
    return !hasOverBudgetCategory() && !hasEmptyCategory();
  };

  const getOverBudgetCategories = (): string[] => {
    return ['needs', 'savings', 'wants'].filter(category => 
      getCategoryStatus(category as 'needs' | 'savings' | 'wants').color === 'red'
    );
  };

  const getEmptyCategories = (): string[] => {
    return ['needs', 'savings', 'wants'].filter(category => 
      getCategoryItemsCount(category as 'needs' | 'savings' | 'wants') === 0
    );
  };

  const getCategoryItemsCount = (category: 'needs' | 'savings' | 'wants'): number => {
    return budgetItems.filter(item => item.category === category).length;
  };

  const getLargestItem = (category: 'needs' | 'savings' | 'wants'): { name: string; amount: number } | null => {
    const categoryItems = budgetItems.filter(item => item.category === category);
    if (categoryItems.length === 0) return null;
    
    const largest = categoryItems.reduce((max, item) => item.amount > max.amount ? item : max);
    return { name: largest.name, amount: largest.amount };
  };

  const getAverageItemCost = (category: 'needs' | 'savings' | 'wants'): number => {
    const categoryItems = budgetItems.filter(item => item.category === category);
    if (categoryItems.length === 0) return 0;
    
    const totalAmount = categoryItems.reduce((sum, item) => sum + item.amount, 0);
    return totalAmount / categoryItems.length;
  };

  const getSmartTip = (): { title: string; text: string } => {
    const currentCategory = circleOrder[0];
    const currentItems = getCurrentCategoryItems();
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    const allocatedAmount = currentItems.reduce((sum, item) => sum + item.amount, 0);
    const allocatedPercentage = parseFloat(getAllocatedPercentage());

    const hasHighValueItems = currentItems.some(item => item.amount > categoryAmount * 0.3);
    const hasManyItems = currentItems.length > 5;
    const isOverBudget = allocatedPercentage > 100;
    const isUnderBudget = allocatedPercentage < 50;
    const hasZeroItems = currentItems.length === 0;
    const biggestItem = currentItems.reduce((max, item) => item.amount > max.amount ? item : max, { name: '', amount: 0 });

    if (currentCategory === 'needs') {
      if (hasZeroItems) {
        return {
          title: "🏠 Hey there! Let's get started",
          text: "I see you haven't added any essential expenses yet. Let's start with the basics - add your rent/mortgage, utilities, groceries, and insurance. These are your foundation for financial stability."
        };
      }
      if (hasHighValueItems) {
        return {
          title: "💰 I noticed something important",
          text: `Your "${biggestItem.name}" is taking up ${((biggestItem.amount / categoryAmount) * 100).toFixed(1)}% of your needs budget. That's quite significant! Have you considered negotiating this expense or looking for alternatives?`
        };
      }
      if (isOverBudget) {
        return {
          title: "⚠️ We need to talk about your needs budget",
          text: `You're currently ${(allocatedPercentage - 100).toFixed(1)}% over your needs budget. I see you have ${currentItems.length} essential expenses totaling $${allocatedAmount.toFixed(2)}. Which of these could we potentially reduce or optimize?`
        };
      }
      if (isUnderBudget) {
        return {
          title: "✅ You're doing great with your essentials!",
          text: `You're only using ${allocatedPercentage.toFixed(1)}% of your needs budget - that's excellent! You have $${(categoryAmount - allocatedAmount).toFixed(2)} left. Maybe we could move some of this to your savings or wants?`
        };
      }
      return {
        title: "📊 Your needs are well balanced",
        text: `You have ${currentItems.length} essential expenses totaling $${allocatedAmount.toFixed(2)}, which is ${allocatedPercentage.toFixed(1)}% of your budget. This looks really good! Consider setting up automatic payments to avoid any late fees.`
      };
    }

    if (currentCategory === 'savings') {
      if (hasZeroItems) {
        return {
          title: "💎 Ready to start building your future?",
          text: `You have $${categoryAmount.toFixed(2)} available for savings but haven't added anything yet. Even starting with $100 for an emergency fund makes a huge difference. What's your first savings goal?`
        };
      }
      if (allocatedPercentage < 50) {
        return {
          title: "🎯 Let's boost your savings game",
          text: `You're only using ${allocatedPercentage.toFixed(1)}% of your savings budget. You have $${(categoryAmount - allocatedAmount).toFixed(2)} left to allocate! What about increasing your emergency fund or adding a retirement contribution?`
        };
      }
      if (hasManyItems) {
        return {
          title: "🎯 Wow, you're really diversifying!",
          text: `You have ${currentItems.length} different savings goals - that's impressive! You've allocated $${allocatedAmount.toFixed(2)} total. Which of these goals is most urgent? Maybe we should prioritize by timeline.`
        };
      }
      return {
        title: "💰 Your savings strategy looks solid",
        text: `You've allocated $${allocatedAmount.toFixed(2)} across ${currentItems.length} savings goals, using ${allocatedPercentage.toFixed(1)}% of your budget. Remember the order: emergency fund first, then retirement, then specific goals.`
      };
    }

    if (currentCategory === 'wants') {
      if (hasZeroItems) {
        return {
          title: "🎉 Time to treat yourself!",
          text: `You have $${categoryAmount.toFixed(2)} available for wants but haven't added anything yet. What brings you joy? Maybe dining out, entertainment, or a personal treat? Life isn't just about saving - it's about enjoying too!`
        };
      }
      if (isOverBudget) {
        return {
          title: "🎭 Let's check your wants spending",
          text: `You're ${(allocatedPercentage - 100).toFixed(1)}% over your wants budget with $${allocatedAmount.toFixed(2)} allocated. I see you have ${currentItems.length} items. Which of these brings you the most happiness? Maybe we can prioritize the ones that matter most.`
        };
      }
      if (hasHighValueItems) {
        return {
          title: "💎 That's quite a luxury item!",
          text: `Your "${biggestItem.name}" at $${biggestItem.amount.toFixed(2)} is a significant want purchase. That's ${((biggestItem.amount / categoryAmount) * 100).toFixed(1)}% of your wants budget! Are you sure this aligns with your long-term financial goals?`
        };
      }
      return {
        title: "🎯 You have great self-control!",
        text: `You're using ${allocatedPercentage.toFixed(1)}% of your wants budget with $${allocatedAmount.toFixed(2)} across ${currentItems.length} items. That's a really healthy balance! You still have $${(categoryAmount - allocatedAmount).toFixed(2)} left for more treats.`
      };
    }

    return {
      title: "💡 Keep up the great work!",
      text: "You're building excellent financial habits by tracking your expenses. Every budget entry brings you closer to your financial goals!"
    };
  };

  const handleItemNameChange = (id: number, name: string) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id ? { ...item, name } : item
    ));
  };

  const handleItemAmountChange = (id: number, amount: number) => {
    if (amount >= 0) {
      setBudgetItems(prev => prev.map(item => 
        item.id === id ? { ...item, amount } : item
      ));
    }
  };

  const handleEmptyRowNameChange = (name: string) => {
    setEmptyRowData(prev => ({ ...prev, name }));
  };

  const handleEmptyRowAmountChange = (amount: number) => {
    if (emptyRowData.name.trim() && amount >= 0) {
      setEmptyRowData(prev => ({ ...prev, amount }));
    }
  };

  const handleAddItem = () => {
    if (emptyRowData.name.trim() || emptyRowData.amount > 0) {
      const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
      const newItem: BudgetItem = {
        id: Date.now(),
        name: emptyRowData.name.trim(),
        amount: emptyRowData.amount,
        percentage: 0,
        category: currentCategory
      };
      setBudgetItems(prev => [...prev, newItem]);
      setEmptyRowData({ name: '', amount: 0 });
      setLockedItems(prev => new Set([...prev, newItem.id]));
    }
  };

  const handleClearEmptyRow = () => {
    setEmptyRowData({ name: '', amount: 0 });
  };

  const handleCheckMarkClick = (id: number) => {
    setLockedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleXMarkClick = (id: number) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
    setLockedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const calculateItemPercentage = (item: BudgetItem): number => {
    const currentCategory = circleOrder[0];
    if (item.category !== currentCategory || item.amount === 0) {
      return 0;
    }
    
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryTotalAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    if (categoryTotalAmount === 0) return 0;
    
    return Math.round((item.amount / categoryTotalAmount) * 100 * 100) / 100;
  };

  const getCurrentCategoryItems = (): BudgetItem[] => {
    const currentCategory = circleOrder[0];
    return budgetItems.filter(item => item.category === currentCategory);
  };

  const handleCircleClick = (category: string) => {
    const newOrder = [...circleOrder];
    const clickedIndex = newOrder.indexOf(category);
    const firstIndex = 0;
    
    const clickedCircle = circleRefs.current[category];
    const budgetSummaryInfo = budgetSummaryInfoRef.current;
    
    if (clickedCircle) {
      gsap.to(clickedCircle, {
        scale: 1.15,
        duration: 0.1,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(clickedCircle, {
            scale: 1,
            duration: 0.01,
            ease: "power2.out"
          });
        }
      });
    }
    
    if (budgetSummaryInfo) {
      gsap.to(budgetSummaryInfo, {
        opacity: 0,
        x: 30,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          [newOrder[firstIndex], newOrder[clickedIndex]] = [newOrder[clickedIndex], newOrder[firstIndex]];
          setCircleOrder(newOrder);
          
          gsap.fromTo(budgetSummaryInfo, 
            {
              opacity: 0,
              x: -30
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: "power2.out"
            }
          );
        }
      });
    } else {
      [newOrder[firstIndex], newOrder[clickedIndex]] = [newOrder[clickedIndex], newOrder[firstIndex]];
      setCircleOrder(newOrder);
    }
  };

  const handleBackClick = () => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    const planSection = document.getElementById('plan');
    if (planSection) {
      planSection.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }, 1000);
  };

  return {
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
  };
}; 