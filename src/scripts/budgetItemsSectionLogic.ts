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
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
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
  const { selectedPlan, setSelectedPlan, customPercentages, setCustomPercentages, income, budgetItems, setBudgetItems } = props;
  const [lockedItems, setLockedItems] = useState<Set<number>>(new Set());
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [circleOrder, setCircleOrder] = useState(['needs', 'savings', 'wants']);
  const circleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const budgetSummaryInfoRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);
  const [emptyRowData, setEmptyRowData] = useState({ name: '', amount: 0 });
  const [userInput, setUserInput] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<string>('');
  const [currentInputValues, setCurrentInputValues] = useState<{ [key: number]: number }>({});

  // Track cursor position and hovered elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Detect what element is being hovered
      const target = e.target as HTMLElement;
      if (target) {
        if (target.closest('.needs-circle')) {
          setHoveredElement('needs-circle');
        } else if (target.closest('.savings-circle')) {
          setHoveredElement('savings-circle');
        } else if (target.closest('.wants-circle')) {
          setHoveredElement('wants-circle');
        } else if (target.closest('.budget-items-table')) {
          setHoveredElement('budget-table');
        } else if (target.closest('.view-report-btn')) {
          setHoveredElement('view-report-btn');
        } else {
          setHoveredElement('');
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    const totalIncome = parseInt(income) || 0;
    const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const difference = totalIncome - totalAllocated;
    
    if (Math.abs(difference) < totalIncome * 0.05) {
      // Perfect budget (within 5%) - fine-tune allocations
      optimizePerfectBudget();
    } else if (difference > 0) {
      // Under budget - handle unallocated money
      handleUnderBudget(difference);
    } else {
      // Over budget - reduce allocations
      handleOverBudget(Math.abs(difference));
    }
  };

  const optimizePerfectBudget = () => {
    // Simply call adjustToTargetPercentages which now properly handles locked items
    // and ensures we reach exactly 100% allocation
    adjustToTargetPercentages();
  };

  const handleUnderBudget = (unallocatedAmount: number) => {
    const totalIncome = parseInt(income) || 0;
    const unallocatedPercent = (unallocatedAmount / totalIncome) * 100;
    
    // If small amount (< 5%), keep as buffer
    if (unallocatedPercent <= 5) {
      console.log(`Keeping $${unallocatedAmount.toFixed(2)} as emergency buffer (${unallocatedPercent.toFixed(1)}%)`);
      return;
    }
    
    // Prioritize savings (most financially responsible)
    const savingsAllocation = unallocatedAmount * 0.7; // 70% to savings
    const distributedAmount = unallocatedAmount * 0.3; // 30% distributed
    
    addToSavings(savingsAllocation);
    setTimeout(() => distributeRemaining(distributedAmount), 100);
  };

  const handleOverBudget = (overAmount: number) => {
    console.log(`Reducing budget by $${overAmount.toFixed(2)}...`);
    
    // Priority: Reduce Wants → Savings → Needs (financial priority order)
    let remaining = overAmount;
    
    // 1. First, reduce wants (lowest priority)
    remaining = reduceCategory('wants', remaining);
    
    // 2. If still over, reduce savings (with caution)
    if (remaining > 0) {
      remaining = reduceCategory('savings', remaining);
    }
    
    // 3. Last resort: reduce needs (essential items)
    if (remaining > 0) {
      reduceCategory('needs', remaining);
    }
  };

  const reduceCategory = (category: 'needs' | 'savings' | 'wants', targetReduction: number): number => {
    const unlockedCategoryItems = budgetItems.filter(item => 
      item.category === category && !lockedItems.has(item.id)
    );
    const unlockedCategoryTotal = unlockedCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    if (unlockedCategoryTotal === 0) return targetReduction;
    
    const reductionAmount = Math.min(targetReduction, unlockedCategoryTotal);
    const reductionRatio = reductionAmount / unlockedCategoryTotal;
    
    // Reduce each unlocked item proportionally, starting with largest amounts
    const updatedItems = budgetItems.map(item => {
      if (item.category === category && !lockedItems.has(item.id)) {
        return {
          ...item,
          amount: Math.max(0, Math.round((item.amount * (1 - reductionRatio)) * 100) / 100)
        };
      }
      return item;
    });
    
    setBudgetItems(updatedItems);
    return Math.max(0, targetReduction - reductionAmount);
  };

  const addToSavings = (amount: number) => {
    const unlockedSavingsItems = budgetItems.filter(item => 
      item.category === 'savings' && !lockedItems.has(item.id)
    );
    
    if (unlockedSavingsItems.length > 0) {
      // Add to largest existing unlocked savings item
      const largestSavingsItem = unlockedSavingsItems.reduce((max, item) => 
        item.amount > max.amount ? item : max
      );
      
      const updatedItems = budgetItems.map(item => {
        if (item.id === largestSavingsItem.id) {
          return { 
            ...item, 
            amount: Math.round((item.amount + amount) * 100) / 100 
          };
        }
        return item;
      });
      setBudgetItems(updatedItems);
    } else {
      // Create new savings item if no unlocked savings items exist
      const newSavingsItem = {
        id: Date.now(),
        name: 'Additional Savings',
        amount: Math.round(amount * 100) / 100,
        percentage: 0,
        category: 'savings' as const
      };
      setBudgetItems(prev => [...prev, newSavingsItem]);
    }
  };

  const distributeRemaining = (amount: number) => {
    const unlockedItems = budgetItems.filter(item => !lockedItems.has(item.id));
    const unlockedTotalAllocated = unlockedItems.reduce((sum, item) => sum + item.amount, 0);
    
    if (unlockedTotalAllocated === 0) return;
    
    // Distribute proportionally across unlocked items only
    const updatedItems = budgetItems.map(item => {
      if (lockedItems.has(item.id)) {
        // Keep locked items unchanged
        return item;
      } else {
        // Distribute among unlocked items
        return {
          ...item,
          amount: Math.round((item.amount + (item.amount / unlockedTotalAllocated) * amount) * 100) / 100
        };
      }
    });
    
    setBudgetItems(updatedItems);
  };

  const adjustToTargetPercentages = () => {
    const totalIncome = parseInt(income) || 0;
    if (totalIncome === 0) return;

    // Calculate target amounts for each category
    const targets = {
      needs: (customPercentages.needs / 100) * totalIncome,
      savings: (customPercentages.savings / 100) * totalIncome,
      wants: (customPercentages.wants / 100) * totalIncome
    };

    // Calculate locked amounts for each category
    const lockedAmounts = {
      needs: budgetItems.filter(item => item.category === 'needs' && lockedItems.has(item.id))
        .reduce((sum, item) => sum + item.amount, 0),
      savings: budgetItems.filter(item => item.category === 'savings' && lockedItems.has(item.id))
        .reduce((sum, item) => sum + item.amount, 0),
      wants: budgetItems.filter(item => item.category === 'wants' && lockedItems.has(item.id))
        .reduce((sum, item) => sum + item.amount, 0)
    };

    // Calculate remaining amounts for unlocked items in each category
    const remainingForUnlocked = {
      needs: Math.max(0, targets.needs - lockedAmounts.needs),
      savings: Math.max(0, targets.savings - lockedAmounts.savings),
      wants: Math.max(0, targets.wants - lockedAmounts.wants)
    };

    // Create a new array with updated items
    const updatedItems = [...budgetItems];

    // Process each category separately
    ['needs', 'savings', 'wants'].forEach(category => {
      const categoryKey = category as 'needs' | 'savings' | 'wants';
      const remainingForCategory = remainingForUnlocked[categoryKey];
      
      // Get all unlocked items in this category
      const unlockedCategoryItems = budgetItems.filter(i => 
        i.category === category && !lockedItems.has(i.id)
      );
      
      if (unlockedCategoryItems.length === 0) return;

      // Calculate current total of unlocked items in this category
      const currentUnlockedTotal = unlockedCategoryItems.reduce((sum, i) => sum + i.amount, 0);
      
      if (currentUnlockedTotal === 0) {
        // If no unlocked items have amounts, distribute evenly
        const amountPerItem = remainingForCategory / unlockedCategoryItems.length;
        
        // Update each unlocked item in this category
        unlockedCategoryItems.forEach(unlockedItem => {
          const itemIndex = updatedItems.findIndex(item => item.id === unlockedItem.id);
          if (itemIndex !== -1) {
            updatedItems[itemIndex] = {
              ...updatedItems[itemIndex],
              amount: Math.round(amountPerItem * 100) / 100
            };
          }
        });
      } else {
        // Distribute proportionally based on current amounts
        const distributionRatio = remainingForCategory / currentUnlockedTotal;
        
        // Update each unlocked item in this category
        unlockedCategoryItems.forEach(unlockedItem => {
          const itemIndex = updatedItems.findIndex(item => item.id === unlockedItem.id);
          if (itemIndex !== -1) {
            updatedItems[itemIndex] = {
              ...updatedItems[itemIndex],
              amount: Math.round((unlockedItem.amount * distributionRatio) * 100) / 100
            };
          }
        });
      }
    });

    setBudgetItems(updatedItems);
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

  // Get color indicator for remaining amount (category-specific)
  const getRemainingAmountColor = (): string => {
    const currentCategory = circleOrder[0];
    const remaining = parseFloat(getRemainingAmount());
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    // Calculate relative remaining as percentage of this category's budget
    const remainingPercent = categoryAmount > 0 ? (remaining / categoryAmount) * 100 : 0;
    
    if (remaining < -5) return '#ff4757'; // Red for over-allocated
    if (remaining < 0) return '#ffa726'; // Orange for slightly over
    if (Math.abs(remainingPercent) <= 5) return '#2ed573'; // Green for close to perfect (within 5%)
    if (Math.abs(remainingPercent) <= 15) return '#ffa726'; // Orange for moderate difference
    return '#ff4757'; // Red for significant difference
  };

  // Get color indicator for allocated percentage (category-specific)
  const getAllocatedPercentageColor = (): string => {
    const currentCategory = circleOrder[0];
    const percentage = parseFloat(getAllocatedPercentage());
    
    // More lenient ranges for category-specific allocation
    if (percentage >= 90 && percentage <= 110) return '#2ed573'; // Green for good allocation
    if (percentage >= 75 && percentage <= 125) return '#ffa726'; // Orange for acceptable range
    return '#ff4757'; // Red for poor allocation
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
    const totalIncome = parseFloat(income) || 0;
    const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const remaining = totalIncome - totalAllocated;
    
    // Must have items in all categories AND allocate 100% of income
    return !hasOverBudgetCategory() && !hasEmptyCategory() && remaining <= 0;
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
    const needsItems = budgetItems.filter(item => item.category === 'needs');
    const savingsItems = budgetItems.filter(item => item.category === 'savings');
    const wantsItems = budgetItems.filter(item => item.category === 'wants');
    
    const needsAmount = needsItems.reduce((sum, item) => sum + item.amount, 0);
    const savingsAmount = savingsItems.reduce((sum, item) => sum + item.amount, 0);
    const wantsAmount = wantsItems.reduce((sum, item) => sum + item.amount, 0);
    
    const totalIncome = parseFloat(income) || 0;
    const totalAllocated = needsAmount + savingsAmount + wantsAmount;
    const remaining = totalIncome - totalAllocated;
    
    // Priority-based guidance
    if (needsAmount === 0 && (savingsAmount > 0 || wantsAmount > 0)) {
      return {
        title: "Prioritize Your Needs",
        text: "Start with essential expenses like housing, food, and utilities. These should come first before savings or wants."
      };
    }
    
    if (needsAmount > 0 && savingsAmount === 0 && wantsAmount > 0) {
      return {
        title: "Don't Skip Savings",
        text: "You have needs and wants, but no savings. Consider adding emergency funds or retirement savings before wants."
      };
    }
    
    if (remaining > 0 && remaining < totalIncome * 0.1) {
      return {
        title: "Almost There!",
        text: "You're very close to allocating 100%. Consider adding small items or increasing existing amounts to reach your full budget."
      };
    }
    
    if (remaining > totalIncome * 0.2) {
      return {
        title: "Unallocated Funds",
        text: "You have significant unallocated funds. Consider adding more items or increasing amounts in your categories."
      };
    }
    
    if (needsAmount > totalIncome * 0.7) {
      return {
        title: "High Needs Allocation",
        text: "Your needs are taking up most of your budget. Consider if some items could be moved to wants or if you can reduce costs."
      };
    }
    
    return {
      title: "Well Balanced!",
      text: "Your budget looks well distributed across needs, savings, and wants. Great job on maintaining balance!"
    };
  };

  const getInteractiveGuide = (): string => {
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const needsItems = budgetItems.filter(item => item.category === 'needs');
    const savingsItems = budgetItems.filter(item => item.category === 'savings');
    const wantsItems = budgetItems.filter(item => item.category === 'wants');
    
    const needsAmount = needsItems.reduce((sum, item) => sum + item.amount, 0);
    const savingsAmount = savingsItems.reduce((sum, item) => sum + item.amount, 0);
    const wantsAmount = wantsItems.reduce((sum, item) => sum + item.amount, 0);
    
    const totalIncome = parseFloat(income) || 0;
    const totalAllocated = needsAmount + savingsAmount + wantsAmount;
    const remaining = totalIncome - totalAllocated;
    const allocatedPercentage = totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0;
    
    // Cursor-based guidance
    if (hoveredElement === 'wants-circle' && needsAmount === 0) {
      return "Click on the Needs circle first to add essential expenses like housing, food, and utilities.";
    }
    
    if (hoveredElement === 'wants-circle' && needsAmount > 0 && savingsAmount === 0) {
      return "Click on the Savings circle to add emergency funds and retirement savings before wants.";
    }
    
    if (hoveredElement === 'savings-circle' && needsAmount === 0) {
      return "Click on the Needs circle first to add essential expenses before setting up savings.";
    }
    
    if (hoveredElement === 'view-report-btn' && allocatedPercentage < 100) {
      return "You need to allocate 100% of your income before viewing the report. Add more items or increase amounts.";
    }
    
    if (hoveredElement === 'view-report-btn' && remaining > 0) {
      return "You still have $" + remaining.toFixed(2) + " to allocate. Add more items or increase amounts to reach 100%.";
    }
    
    if (hoveredElement === 'view-report-btn' && allocatedPercentage === 100) {
      return "Clicking this button will optimize your budget and show your comprehensive financial report.";
    }
    
    // Button-specific guidance
    if (hoveredElement === 'optimize-btn') {
      const unlockedItems = budgetItems.filter(item => !lockedItems.has(item.id));
      const unlockedItemsWithAmounts = unlockedItems.filter(item => item.amount > 0);
      
      if (unlockedItemsWithAmounts.length > 0) {
        return "Clicking the optimize button will reset the amounts in your unlocked items to zero and balance out the remaining balance.";
      } else {
        return "Clicking the optimize button will balance out the remaining balance in your unlocked items.";
      }
    }
    
    // Category-specific guidance
    if (currentCategory === 'needs') {
      const currentItems = getCurrentCategoryItems();
      const currentAmount = currentItems.reduce((sum, item) => sum + item.amount, 0);
      const targetAmount = totalIncome * (customPercentages.needs / 100);
      
      if (currentItems.length === 0) {
        return "Add your essential needs: housing, groceries, utilities, insurance, etc.";
      }
      
      if (currentAmount < targetAmount * 0.5) {
        return "You're only using " + ((currentAmount / targetAmount) * 100).toFixed(0) + "% of your needs budget. Add more items or increase amounts.";
      }
      
      if (currentAmount > targetAmount * 1.1) {
        return "Your needs are over budget. Consider moving some items to wants or reducing amounts.";
      }
      
      return "Good progress on needs! Consider adding more items or moving to Savings category.";
    }
    
    if (currentCategory === 'savings') {
      const currentItems = getCurrentCategoryItems();
      const currentAmount = currentItems.reduce((sum, item) => sum + item.amount, 0);
      const targetAmount = totalIncome * (customPercentages.savings / 100);
      
      if (currentItems.length === 0) {
        return "Add your savings goals: emergency fund, retirement, investments, etc.";
      }
      
      if (currentAmount < targetAmount * 0.5) {
        return "You're only using " + ((currentAmount / targetAmount) * 100).toFixed(0) + "% of your savings budget. Increase your savings amounts.";
      }
      
      return "Great savings setup! Consider adding more items or moving to Wants category.";
    }
    
    if (currentCategory === 'wants') {
      const currentItems = getCurrentCategoryItems();
      const currentAmount = currentItems.reduce((sum, item) => sum + item.amount, 0);
      const targetAmount = totalIncome * (customPercentages.wants / 100);
      
      if (currentItems.length === 0) {
        return "Add your lifestyle wants: dining out, entertainment, shopping, hobbies, etc.";
      }
      
      if (currentAmount > targetAmount * 1.1) {
        return "Your wants are over budget. Consider reducing amounts or moving items to other categories.";
      }
      
      return "Nice wants setup! Make sure all categories are complete before viewing the report.";
    }
    
    // General guidance
    if (allocatedPercentage < 50) {
      return "Add items to all three categories to build your complete budget.";
    }
    
    if (allocatedPercentage < 100) {
      return "You're " + allocatedPercentage.toFixed(0) + "% complete. Add more items or increase amounts to reach 100%.";
    }
    
    return "Perfect! Your budget is 100% allocated. You can now view your comprehensive report!";
  };

  const handleItemNameChange = (id: number, name: string) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id ? { ...item, name } : item
    ));
  };

  const handleItemAmountChange = (id: number, amount: number) => {
    // Track the current input value for real-time validation
    setCurrentInputValues(prev => ({
      ...prev,
      [id]: amount
    }));
    
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
    setEmptyRowData(prev => ({ ...prev, amount }));
  };

  const isCurrentCategoryOverBudget = (): boolean => {
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const totalIncome = parseFloat(income) || 0;
    const categoryPercentage = customPercentages[currentCategory];
    const categoryBudget = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    const currentCategoryItems = budgetItems.filter(item => item.category === currentCategory);
    const currentCategoryTotal = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    return currentCategoryTotal > categoryBudget;
  };

  const getCurrentCategoryBudget = (): number => {
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const totalIncome = parseFloat(income) || 0;
    const categoryPercentage = customPercentages[currentCategory];
    return calculatePercentageToDollar(categoryPercentage, totalIncome);
  };

  const handleAddItem = () => {
    // Check if current category is over budget
    if (isCurrentCategoryOverBudget()) {
      const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
      const categoryBudget = getCurrentCategoryBudget();
      alert(`Cannot add more items: ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} category is over budget ($${categoryBudget.toFixed(2)}). Please reduce existing amounts or optimize your budget first.`);
      return;
    }

    // Allow adding items even without amounts
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const newItem: BudgetItem = {
      id: Date.now(),
      name: emptyRowData.name.trim() || 'Untitled Item',
      amount: emptyRowData.amount || 0,
      percentage: 0,
      category: currentCategory
    };
    setBudgetItems(prev => [...prev, newItem]);
    
    // Only auto-lock the item if it has an amount
    if (emptyRowData.amount > 0) {
      setLockedItems(prev => new Set([...prev, newItem.id]));
    }
    
    // Clear current input and immediately trigger a new input row for continuous adding
    setEmptyRowData({ name: ' ', amount: 0 });
    
    // Focus the new input row
    setTimeout(() => {
      const nameInput = document.querySelector('.input-row .item-name-input') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
    }, 100);
  };

  const handleClearEmptyRow = () => {
    // Reset completely - this will hide the input row and show the trigger row
    setEmptyRowData({ name: '', amount: 0 });
  };

  const handleLockToggle = (id: number) => {
    setLockedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        // Clear current input value when item is locked
        setCurrentInputValues(prev => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      }
      return newSet;
    });
  };

  const clearCurrentInputValue = (id: number) => {
    setCurrentInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const canLockItem = (item: BudgetItem, tempAmount?: number): boolean => {
    // Use current input value if available, otherwise use item amount
    const currentInputValue = currentInputValues[item.id];
    const amountToCheck = tempAmount !== undefined ? tempAmount : (currentInputValue !== undefined ? currentInputValue : item.amount);
    
    // Can only lock if user manually entered an amount (not zero)
    if (amountToCheck <= 0) {
      return false;
    }
    
    // Check if the item amount exceeds the category budget
    const totalIncome = parseFloat(income) || 0;
    const categoryPercentage = customPercentages[item.category as keyof typeof customPercentages];
    const categoryBudget = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    // Get all items in the same category (excluding the current item)
    const categoryItems = budgetItems.filter(i => i.category === item.category && i.id !== item.id);
    const categoryTotal = categoryItems.reduce((sum, i) => sum + i.amount, 0);
    
    // Check if adding this item would exceed the category budget
    const totalWithItem = categoryTotal + amountToCheck;
    
    // Allow locking if the total doesn't exceed the category budget
    return totalWithItem <= categoryBudget;
  };

  const getLockButtonTitle = (item: BudgetItem, tempAmount?: number): string => {
    // Use current input value if available, otherwise use item amount
    const currentInputValue = currentInputValues[item.id];
    const amountToCheck = tempAmount !== undefined ? tempAmount : (currentInputValue !== undefined ? currentInputValue : item.amount);
    
    if (amountToCheck <= 0) {
      return "Enter amount to lock";
    }
    
    // Check if the item amount exceeds the category budget
    const totalIncome = parseFloat(income) || 0;
    const categoryPercentage = customPercentages[item.category as keyof typeof customPercentages];
    const categoryBudget = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    // Get all items in the same category (excluding the current item)
    const categoryItems = budgetItems.filter(i => i.category === item.category && i.id !== item.id);
    const categoryTotal = categoryItems.reduce((sum, i) => sum + i.amount, 0);
    
    // Check if adding this item would exceed the category budget
    const totalWithItem = categoryTotal + amountToCheck;
    
    if (totalWithItem > categoryBudget) {
      return `Amount exceeds ${item.category} budget ($${categoryBudget.toFixed(2)})`;
    }
    
    return "Lock item";
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

  const getCurrentCategoryItems = () => {
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const items = budgetItems.filter(item => item.category === currentCategory);
    return items;
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

  const getLockedItemsTotal = (): string => {
    const lockedItemsTotal = budgetItems
      .filter(item => lockedItems.has(item.id))
      .reduce((sum, item) => sum + item.amount, 0);
    
    return lockedItemsTotal.toFixed(2);
  };

  const getLockedItemsCount = (): number => {
    return budgetItems.filter(item => lockedItems.has(item.id)).length;
  };

  return {
    budgetItems,
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
    getRemainingAmountColor,
    getAllocatedPercentageColor,
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
    getInteractiveGuide,
    handleItemNameChange,
    handleItemAmountChange,
    handleEmptyRowNameChange,
    handleEmptyRowAmountChange,
    handleAddItem,
    handleClearEmptyRow,
    handleLockToggle,
    canLockItem,
    getLockButtonTitle,
    clearCurrentInputValue,
    handleXMarkClick,
    calculateItemPercentage,
    getCurrentCategoryItems,
    handleCircleClick,
    handleBackClick,
    getLockedItemsTotal,
    getLockedItemsCount,
    isCurrentCategoryOverBudget,
    getCurrentCategoryBudget
  };
}; 