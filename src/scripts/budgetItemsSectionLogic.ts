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
  const [budgetValidationErrors, setBudgetValidationErrors] = useState<{ [key: number]: string }>({});

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
    return Math.floor((percentage / 100) * totalIncome);
  };

  // Recursive function to calculate dollar amount to percentage
  const calculateDollarToPercentage = (dollarAmount: number, totalIncome: number, precision: number = 2): number => {
    if (precision <= 0) {
      return Math.round((dollarAmount / totalIncome) * 100);
    }
    return Math.round((dollarAmount / totalIncome) * 100 * Math.pow(10, precision)) / Math.pow(10, precision);
  };

  const handleAutoFix = () => {
    // Repeat adjustment until all categories are exactly balanced
    let maxTries = 5; // Prevent infinite loop in pathological cases
    let needsFix = true;
    let currentItems = [...budgetItems]; // Work with a local copy
    
    while (needsFix && maxTries-- > 0) {
      // Update adjustToTargetPercentages to work with currentItems and return the updated items
      currentItems = adjustToTargetPercentagesSync(currentItems);
      needsFix = false;
      const totalIncome = parseInt(income) || 0;
      
      ['needs', 'savings', 'wants'].forEach(category => {
        const categoryBudget = calculatePercentageToDollar(customPercentages[category], totalIncome);
        const items = currentItems.filter(item => item.category === category);
        const unlocked = items.filter(item => !lockedItems.has(item.id));
        if (unlocked.length > 0) {
          const allocated = items.reduce((sum, item) => sum + item.amount, 0);
          const diff = categoryBudget - allocated;
          if (diff !== 0) {
            needsFix = true;
            const lastUnlockedId = unlocked[unlocked.length - 1].id;
            currentItems = currentItems.map(item =>
              item.id === lastUnlockedId ? { ...item, amount: item.amount + diff } : item
            );
          }
        }
      });
    }
    
    // Finally, set the state with the corrected items
    setBudgetItems(currentItems);
  };

  const adjustToTargetPercentagesSync = (inputItems: any[]) => {
    const totalIncome = parseInt(income) || 0;
    if (totalIncome === 0) return inputItems;

    // Calculate target amounts for each category
    const targets = {
      needs: Math.floor((customPercentages.needs / 100) * totalIncome),
      savings: Math.floor((customPercentages.savings / 100) * totalIncome),
      wants: Math.floor((customPercentages.wants / 100) * totalIncome)
    };

    // Calculate locked amounts for each category
    const lockedAmounts = {
      needs: inputItems.filter(item => item.category === 'needs' && lockedItems.has(item.id))
        .reduce((sum, item) => sum + item.amount, 0),
      savings: inputItems.filter(item => item.category === 'savings' && lockedItems.has(item.id))
        .reduce((sum, item) => sum + item.amount, 0),
      wants: inputItems.filter(item => item.category === 'wants' && lockedItems.has(item.id))
        .reduce((sum, item) => sum + item.amount, 0)
    };

    // Calculate remaining amounts for unlocked items in each category
    const remainingForUnlocked = {
      needs: Math.max(0, targets.needs - lockedAmounts.needs),
      savings: Math.max(0, targets.savings - lockedAmounts.savings),
      wants: Math.max(0, targets.wants - lockedAmounts.wants)
    };

    // Create a new array with updated items
    const updatedItems = [...inputItems];

    // Process each category separately
    ['needs', 'savings', 'wants'].forEach(category => {
      const categoryKey = category as 'needs' | 'savings' | 'wants';
      const remainingForCategory = remainingForUnlocked[categoryKey];
      
      // Get all unlocked items in this category
      const unlockedCategoryItems = inputItems.filter(i => 
        i.category === category && !lockedItems.has(i.id)
      );
      
      if (unlockedCategoryItems.length === 0) {
        // If no unlocked items in this category, create one if there's remaining budget
        if (remainingForCategory > 0) {
          const newItem = {
            id: Date.now() + Math.random(),
            name: `Additional ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            amount: remainingForCategory,
            percentage: 0,
            category: category as 'needs' | 'savings' | 'wants'
          };
          updatedItems.push(newItem);
        }
        return;
      }

      // Reset all unlocked items to 0 first, then distribute the remaining budget
      unlockedCategoryItems.forEach(unlockedItem => {
        const itemIndex = updatedItems.findIndex(item => item.id === unlockedItem.id);
        if (itemIndex !== -1) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            amount: 0
          };
        }
      });

      // Distribute the remaining budget evenly among all unlocked items
      const amountPerItem = Math.floor(remainingForCategory / unlockedCategoryItems.length);
      const remainder = remainingForCategory % unlockedCategoryItems.length;

      unlockedCategoryItems.forEach((unlockedItem, index) => {
        const itemIndex = updatedItems.findIndex(item => item.id === unlockedItem.id);
        if (itemIndex !== -1) {
          // Give each item the base amount, plus 1 extra to the first 'remainder' items
          const extraAmount = index < remainder ? 1 : 0;
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            amount: amountPerItem + extraAmount
          };
        }
      });
    });

    return updatedItems;
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
    return `$${Math.round(dollarAmount)}`;
  };

  const getRemainingAmount = (): string => {
    const currentCategory = circleOrder[0];
    const totalIncome = parseInt(income);
    const categoryPercentage = customPercentages[currentCategory as keyof typeof customPercentages];
    const categoryAmount = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    const currentCategoryItems = getCurrentCategoryItems();
    const allocatedAmount = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    const remainingAmount = categoryAmount - allocatedAmount;
    return remainingAmount.toString();
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

  const getGlobalAllocatedPercentage = (): string => {
    const totalIncome = parseInt(income) || 0;
    const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const allocatedPercentage = totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0;
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

  const getGlobalAllocatedPercentageColor = (): string => {
    const percentage = parseFloat(getGlobalAllocatedPercentage());
    
    // Stricter ranges for global allocation - should be exactly 100%
    if (percentage >= 99.5 && percentage <= 100.5) return '#2ed573'; // Green for perfect allocation
    if (percentage >= 95 && percentage <= 105) return '#ffa726'; // Orange for close to perfect
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

  const isLockedItemsUnderfunded = (): boolean => {
    const totalIncome = parseFloat(income) || 0;
    const categories: ('needs' | 'savings' | 'wants')[] = ['needs', 'savings', 'wants'];
    return categories.some(category => {
      const categoryBudget = calculatePercentageToDollar(customPercentages[category], totalIncome);
      const lockedTotal = budgetItems.filter(item => item.category === category && lockedItems.has(item.id)).reduce((sum, item) => sum + item.amount, 0);
      return lockedTotal > categoryBudget;
    });
  };

  const canViewReport = (): boolean => {
    const totalIncome = parseFloat(income) || 0;
    const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const remaining = totalIncome - totalAllocated;
    
    // Must have items in all categories AND allocate 100% of income AND not have locked items over budget
    return !hasOverBudgetCategory() && !hasEmptyCategory() && remaining === 0 && !isLockedItemsUnderfunded();
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
      return "You still have $" + Math.round(remaining).toFixed(0) + " to allocate. Add more items or increase amounts to reach 100%.";
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
    // Don't allow amount changes if item name is empty
    if (isItemNameEmpty(id)) {
      return;
    }
    
    // Track the current input value for real-time validation
    setCurrentInputValues(prev => ({
      ...prev,
      [id]: amount
    }));
    
    // Validate budget limits in real-time
    const validationError = validateBudgetLimit(id, amount);
    setBudgetValidationErrors(prev => ({
      ...prev,
      [id]: validationError
    }));
    
    if (amount >= 0 && !validationError) {
      setBudgetItems(prev => prev.map(item => 
        item.id === id ? { ...item, amount } : item
      ));
    }
  };

  const validateBudgetLimit = (itemId: number, newAmount: number): string => {
    const item = budgetItems.find(item => item.id === itemId);
    if (!item) return '';
    
    const totalIncome = parseInt(income) || 0;
    const categoryBudget = calculatePercentageToDollar(customPercentages[item.category], totalIncome);
    
    // Calculate current category total excluding the item being edited
    const currentCategoryItems = budgetItems.filter(budgetItem => 
      budgetItem.category === item.category && budgetItem.id !== itemId
    );
    const currentCategoryTotal = currentCategoryItems.reduce((sum, budgetItem) => sum + budgetItem.amount, 0);
    
    // Calculate new category total with the new amount
    const newCategoryTotal = currentCategoryTotal + newAmount;
    
    // Check if category would be over budget
    if (newCategoryTotal > categoryBudget) {
      const overAmount = newCategoryTotal - categoryBudget;
      return `${item.category.charAt(0).toUpperCase() + item.category.slice(1)} would be $${Math.round(overAmount)} over budget`;
    }
    
    // Check if total budget would be exceeded
    const totalAllocated = budgetItems.reduce((sum, budgetItem) => {
      if (budgetItem.id === itemId) {
        return sum + newAmount;
      }
      return sum + budgetItem.amount;
    }, 0);
    
    if (totalAllocated > totalIncome) {
      const overAmount = totalAllocated - totalIncome;
      return `Total budget would be $${Math.round(overAmount)} over income`;
    }
    
    return '';
  };

  const getItemValidationError = (itemId: number): string => {
    return budgetValidationErrors[itemId] || '';
  };

  const isItemOverBudget = (itemId: number): boolean => {
    return !!budgetValidationErrors[itemId];
  };

  const isItemNameEmpty = (itemId: number): boolean => {
    const item = budgetItems.find(item => item.id === itemId);
    return !item || !item.name.trim();
  };

  const isEmptyRowNameEmpty = (): boolean => {
    return !emptyRowData.name.trim();
  };

  const validateEmptyRowBudgetLimit = (): boolean => {
    const totalIncome = parseInt(income) || 0;
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const categoryBudget = calculatePercentageToDollar(customPercentages[currentCategory], totalIncome);
    
    // Calculate current category total
    const currentCategoryItems = budgetItems.filter(item => item.category === currentCategory);
    const currentCategoryTotal = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate new category total with empty row amount
    const newCategoryTotal = currentCategoryTotal + emptyRowData.amount;
    
    // Check if category would be over budget
    if (newCategoryTotal > categoryBudget) {
      return true;
    }
    
    // Check if total budget would be exceeded
    const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0) + emptyRowData.amount;
    
    if (totalAllocated > totalIncome) {
      return true;
    }
    
    return false;
  };

  const getEmptyRowValidationError = (): string => {
    const totalIncome = parseInt(income) || 0;
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const categoryBudget = calculatePercentageToDollar(customPercentages[currentCategory], totalIncome);
    
    // Calculate current category total
    const currentCategoryItems = budgetItems.filter(item => item.category === currentCategory);
    const currentCategoryTotal = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate new category total with empty row amount
    const newCategoryTotal = currentCategoryTotal + emptyRowData.amount;
    
    // Check if category would be over budget
    if (newCategoryTotal > categoryBudget) {
      const overAmount = newCategoryTotal - categoryBudget;
      return `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} would be $${Math.round(overAmount)} over budget`;
    }
    
    // Check if total budget would be exceeded
    const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0) + emptyRowData.amount;
    
    if (totalAllocated > totalIncome) {
      const overAmount = totalAllocated - totalIncome;
      return `Total budget would be $${Math.round(overAmount)} over income`;
    }
    
    return '';
  };

  const handleEmptyRowNameChange = (name: string) => {
    setEmptyRowData(prev => ({ ...prev, name }));
  };

  const handleEmptyRowAmountChange = (amount: number) => {
    // Don't allow amount changes if name is empty
    if (isEmptyRowNameEmpty()) {
      return;
    }
    
    setEmptyRowData(prev => ({ ...prev, amount }));
  };

  const isCurrentCategoryOverBudget = (): boolean => {
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const totalIncome = parseInt(income) || 0;
    const categoryPercentage = customPercentages[currentCategory];
    const categoryBudget = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    const currentCategoryItems = budgetItems.filter(item => item.category === currentCategory);
    const currentCategoryTotal = currentCategoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    return currentCategoryTotal >= categoryBudget;
  };

  const getCurrentCategoryBudget = (): number => {
    const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
    const totalIncome = parseInt(income) || 0;
    const categoryPercentage = customPercentages[currentCategory];
    return calculatePercentageToDollar(categoryPercentage, totalIncome);
  };

  const handleAddItem = (onError?: (msg: string) => void) => {
    // Check if current category is over budget
    if (isCurrentCategoryOverBudget()) {
      const currentCategory = circleOrder[0] as 'needs' | 'savings' | 'wants';
      const categoryBudget = getCurrentCategoryBudget();
      const msg = `Cannot add more items: ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} category is over budget ($${Math.round(categoryBudget)}). Please reduce existing amounts or optimize your budget first.`;
      if (onError) onError(msg);
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
    
    // Clear any validation errors for empty row
    setBudgetValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors['empty-row'];
      return newErrors;
    });
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
    
    // Clear validation error when input is cleared
    setBudgetValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
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
    const totalIncome = parseInt(income) || 0;
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
    const totalIncome = parseInt(income) || 0;
    const categoryPercentage = customPercentages[item.category as keyof typeof customPercentages];
    const categoryBudget = calculatePercentageToDollar(categoryPercentage, totalIncome);
    
    // Get all items in the same category (excluding the current item)
    const categoryItems = budgetItems.filter(i => i.category === item.category && i.id !== item.id);
    const categoryTotal = categoryItems.reduce((sum, i) => sum + i.amount, 0);
    
    // Check if adding this item would exceed the category budget
    const totalWithItem = categoryTotal + amountToCheck;
    
    if (totalWithItem > categoryBudget) {
      return `Amount exceeds ${item.category} budget ($${Math.round(categoryBudget)})`;
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
    
    return Math.round(lockedItemsTotal).toString();
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
    getGlobalAllocatedPercentage,
    getRemainingAmountColor,
    getAllocatedPercentageColor,
    getGlobalAllocatedPercentageColor,
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
    validateBudgetLimit,
    getItemValidationError,
    isItemOverBudget,
    isItemNameEmpty,
    isEmptyRowNameEmpty,
    validateEmptyRowBudgetLimit,
    getEmptyRowValidationError,
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
    getCurrentCategoryBudget,
    isLockedItemsUnderfunded
  };
}; 