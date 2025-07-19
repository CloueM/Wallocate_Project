import { gsap } from 'gsap';
import React, { useEffect, useRef, useState } from 'react';

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

const budgetPlans: BudgetPlan[] = [
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

const BudgetItemsSection: React.FC<BudgetItemsSectionProps> = ({
  selectedPlan,
  setSelectedPlan,
  customPercentages,
  setCustomPercentages,
  income
}) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [lockedItems, setLockedItems] = useState<Set<number>>(new Set());

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [circleOrder, setCircleOrder] = useState(['needs', 'savings', 'wants']);
  const circleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const budgetSummaryInfoRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);

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
      // Calculate the target positions for each circle
      const circleWidth = 80; // Width of each circle (5rem = 80px)
      const gap = 24; // Gap between circles (1.5rem = 24px)
      
      circles.forEach((circle, index) => {
        if (!circle) return;
        
        const targetX = index * (circleWidth + gap);
        
        if (isInitialRender.current) {
          // Set initial position without animation
          gsap.set(circle, { x: targetX });
        } else {
          // Animate to new position
          gsap.to(circle, {
            x: targetX,
            duration: 0.1,
            ease: "power2.out"
          });
        }
      });
      
      // Mark initial render as complete
      if (isInitialRender.current) {
        isInitialRender.current = false;
      }
    }
  }, [circleOrder]);



  const handleAutoFix = () => {
    const totalIncome = parseInt(income);
    const newItems = [...budgetItems];
    
    // Process each category separately
    ['needs', 'savings', 'wants'].forEach(category => {
      const categoryItems = newItems.filter(item => item.category === category);
      const categoryPercentage = customPercentages[category as keyof typeof customPercentages];
      const categoryBudget = calculatePercentageToDollar(categoryPercentage, totalIncome);
      
      // Calculate current allocated amount in this category
      const currentAllocated = categoryItems.reduce((sum, item) => sum + item.amount, 0);
      
      // Find items with zero amounts in this category
      const zeroItems = categoryItems.filter(item => item.amount === 0);
      const nonZeroItems = categoryItems.filter(item => item.amount > 0);
      
      if (zeroItems.length > 0) {
        // Calculate remaining budget to distribute
        const remainingBudget = categoryBudget - currentAllocated;
        
        if (remainingBudget > 0) {
          // Distribute remaining budget equally among zero items
          const amountPerItem = remainingBudget / zeroItems.length;
          
          zeroItems.forEach(item => {
            const itemIndex = newItems.findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
              newItems[itemIndex] = {
                ...newItems[itemIndex],
                amount: Math.round(amountPerItem * 100) / 100 // Round to 2 decimal places
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

  // Get the current category's dollar amount
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

  // Calculate remaining amount that can be allocated
  const getRemainingAmount = (): string => {
    const currentCategory = circleOrder[0];
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    // Calculate total allocated amount for current category
    const currentCategoryItems = getCurrentCategoryItems();
    const allocatedAmount = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    const remainingAmount = categoryAmount - allocatedAmount;
    return remainingAmount.toFixed(2);
  };

  // Calculate allocated percentage for current category
  const getAllocatedPercentage = (): string => {
    const currentCategory = circleOrder[0];
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    // Calculate total allocated amount for current category
    const currentCategoryItems = getCurrentCategoryItems();
    const allocatedAmount = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    if (categoryAmount === 0) return '0.00';
    const allocatedPercentage = (allocatedAmount / categoryAmount) * 100;
    return allocatedPercentage.toFixed(2);
  };

  // Get category status (under/over/perfect budget)
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

  // Check if any category is over budget
  const hasOverBudgetCategory = (): boolean => {
    return ['needs', 'savings', 'wants'].some(category => 
      getCategoryStatus(category as 'needs' | 'savings' | 'wants').color === 'red'
    );
  };

  // Check if any category is empty (no items)
  const hasEmptyCategory = (): boolean => {
    return ['needs', 'savings', 'wants'].some(category => 
      getCategoryItemsCount(category as 'needs' | 'savings' | 'wants') === 0
    );
  };

  // Check if report can be viewed (no over budget and no empty categories)
  const canViewReport = (): boolean => {
    return !hasOverBudgetCategory() && !hasEmptyCategory();
  };

  // Get over budget categories for display
  const getOverBudgetCategories = (): string[] => {
    return ['needs', 'savings', 'wants'].filter(category => 
      getCategoryStatus(category as 'needs' | 'savings' | 'wants').color === 'red'
    );
  };

  // Get empty categories for display
  const getEmptyCategories = (): string[] => {
    return ['needs', 'savings', 'wants'].filter(category => 
      getCategoryItemsCount(category as 'needs' | 'savings' | 'wants') === 0
    );
  };

  // Get items count for a category
  const getCategoryItemsCount = (category: 'needs' | 'savings' | 'wants'): number => {
    return budgetItems.filter(item => item.category === category).length;
  };

  // Get largest item for a category
  const getLargestItem = (category: 'needs' | 'savings' | 'wants'): { name: string; amount: number } | null => {
    const categoryItems = budgetItems.filter(item => item.category === category);
    if (categoryItems.length === 0) return null;
    
    const largest = categoryItems.reduce((max, item) => item.amount > max.amount ? item : max);
    return { name: largest.name, amount: largest.amount };
  };

  // Get average item cost for a category
  const getAverageItemCost = (category: 'needs' | 'savings' | 'wants'): number => {
    const categoryItems = budgetItems.filter(item => item.category === category);
    if (categoryItems.length === 0) return 0;
    
    const totalAmount = categoryItems.reduce((sum, item) => sum + item.amount, 0);
    return totalAmount / categoryItems.length;
  };

  // Generate smart tips based on user's budget data
  const getSmartTip = (): { title: string; text: string } => {
    const currentCategory = circleOrder[0];
    const currentItems = getCurrentCategoryItems();
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    const allocatedAmount = currentItems.reduce((sum, item) => sum + item.amount, 0);
    const allocatedPercentage = parseFloat(getAllocatedPercentage());

    // Analyze spending patterns
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

  // Handle item name update
  const handleItemNameChange = (id: number, name: string) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id ? { ...item, name } : item
    ));
  };

  // Handle item amount update
  const handleItemAmountChange = (id: number, amount: number) => {
    // Only allow non-negative amounts
    if (amount >= 0) {
      setBudgetItems(prev => prev.map(item => 
        item.id === id ? { ...item, amount } : item
      ));
    }
  };

  // Handle empty row input changes
  const [emptyRowData, setEmptyRowData] = useState({ name: '', amount: 0 });
  const [userInput, setUserInput] = useState('');

  const handleEmptyRowNameChange = (name: string) => {
    setEmptyRowData(prev => ({ ...prev, name }));
  };

  const handleEmptyRowAmountChange = (amount: number) => {
    // Only allow amount input if item name is provided and amount is not negative
    if (emptyRowData.name.trim() && amount >= 0) {
      setEmptyRowData(prev => ({ ...prev, amount }));
    }
  };

  // Add item when check mark is clicked
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
      setEmptyRowData({ name: '', amount: 0 }); // Clear the empty row
      // Lock the newly added item
      setLockedItems(prev => new Set([...prev, newItem.id]));
    }
  };

  // Clear empty row when X is clicked
  const handleClearEmptyRow = () => {
    setEmptyRowData({ name: '', amount: 0 });
  };

  // Handle check mark click (lock/unlock item)
  const handleCheckMarkClick = (id: number) => {
    setLockedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Unlock
      } else {
        newSet.add(id); // Lock
      }
      return newSet;
    });
  };

  // Handle X mark click (clear item)
  const handleXMarkClick = (id: number) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
    setLockedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Calculate percentage for an item based on current category total
  const calculateItemPercentage = (item: BudgetItem): number => {
    const currentCategory = circleOrder[0];
    if (item.category !== currentCategory || item.amount === 0) {
      return 0;
    }
    
    // Get the category's total allocated amount from income
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryTotalAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    if (categoryTotalAmount === 0) return 0;
    
    return Math.round((item.amount / categoryTotalAmount) * 100 * 100) / 100; // Round to 2 decimal places
  };

  // Get items for current category
  const getCurrentCategoryItems = (): BudgetItem[] => {
    const currentCategory = circleOrder[0];
    return budgetItems.filter(item => item.category === currentCategory);
  };

  // Add new item when user starts typing
  const addNewItem = () => {
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const newItem: BudgetItem = {
      id: Date.now(),
      name: "",
      amount: 0,
      percentage: 0,
      category: currentCategory
    };
    setBudgetItems(prev => [...prev, newItem]);
  };

  const handleCircleClick = (category: string) => {
    const newOrder = [...circleOrder];
    const clickedIndex = newOrder.indexOf(category);
    const firstIndex = 0;
    
    // Start both animations immediately
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
      // Fade out and slide to the right
      gsap.to(budgetSummaryInfo, {
        opacity: 0,
        x: 30,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Swap the clicked circle with the first position
          [newOrder[firstIndex], newOrder[clickedIndex]] = [newOrder[clickedIndex], newOrder[firstIndex]];
          setCircleOrder(newOrder);
          
          // Fade in and slide from the left
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
      // Fallback if element not found
      [newOrder[firstIndex], newOrder[clickedIndex]] = [newOrder[clickedIndex], newOrder[firstIndex]];
      setCircleOrder(newOrder);
    }
  };

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
              <button 
                className="back-btn"
                onClick={() => {
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
                }}
              >
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