import { useState } from 'react';

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

interface ReportSectionProps {
  selectedPlan: BudgetPlan;
  customPercentages: {
    needs: number;
    savings: number;
    wants: number;
  };
  income: string;
  budgetItems: BudgetItem[];
}

interface SmartTip {
  id: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  category: 'budgeting' | 'saving' | 'investing' | 'debt' | 'emergency' | 'allocation';
  title: string;
  message: string;
  specificItems?: string[];
  priority: number; // 1-10
}

export const useReportSectionLogic = (props: ReportSectionProps) => {
  const { selectedPlan, customPercentages, income, budgetItems } = props;
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  const totalIncome = parseInt(income) || 0;
  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const unallocated = totalIncome - totalAllocated;

  // Smart Tips Generator based on actual budget data
  const generateSmartTips = (): SmartTip[] => {
    const tips: SmartTip[] = [];
    
    // Analyze spending by category
    const categoryTotals = budgetItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryPercentages = {
      needs: totalIncome > 0 ? (categoryTotals.needs || 0) / totalIncome * 100 : 0,
      savings: totalIncome > 0 ? (categoryTotals.savings || 0) / totalIncome * 100 : 0,
      wants: totalIncome > 0 ? (categoryTotals.wants || 0) / totalIncome * 100 : 0
    };

    // 1. Emergency Fund Analysis
    const emergencyItems = budgetItems.filter(item => 
      item.name.toLowerCase().includes('emergency') || 
      item.name.toLowerCase().includes('fund')
    );

    if (emergencyItems.length === 0) {
      tips.push({
        id: 'no-emergency-fund',
        type: 'critical',
        category: 'emergency',
        title: 'Missing Emergency Fund',
        message: 'You don\'t have an emergency fund allocated. Experts recommend 3-6 months of expenses for unexpected situations.',
        priority: 10
      });
    } else {
      const emergencyTotal = emergencyItems.reduce((sum, item) => sum + item.amount, 0);
      const monthsOfExpenses = emergencyTotal / (categoryTotals.needs || 1);
      
      if (monthsOfExpenses < 3) {
        tips.push({
          id: 'low-emergency-fund',
          type: 'warning',
          category: 'emergency',
          title: 'Boost Your Emergency Fund',
          message: `Your emergency fund of $${emergencyTotal} covers only ${monthsOfExpenses.toFixed(1)} months of needs. Consider increasing it to cover 3-6 months.`,
          specificItems: emergencyItems.map(item => item.name),
          priority: 8
        });
      }
    }

    // 2. Savings Rate Analysis
    if (categoryPercentages.savings < 10) {
      const currentSavingsItems = budgetItems.filter(item => item.category === 'savings');
      tips.push({
        id: 'low-savings-rate',
        type: 'warning',
        category: 'saving',
        title: 'Increase Your Savings Rate',
        message: `Your savings rate is ${categoryPercentages.savings.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`,
        specificItems: currentSavingsItems.map(item => `${item.name}: $${item.amount}`),
        priority: 9
      });
    } else if (categoryPercentages.savings >= 20) {
      tips.push({
        id: 'excellent-savings',
        type: 'success',
        category: 'saving',
        title: 'Excellent Savings Rate!',
        message: `Your ${categoryPercentages.savings.toFixed(1)}% savings rate is fantastic! You're building a strong financial future.`,
        priority: 6
      });
    }

    // 3. Budget Balance Analysis
    if (totalAllocated > totalIncome) {
      const overage = totalAllocated - totalIncome;
      const highestCategory = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      
      tips.push({
        id: 'over-budget',
        type: 'critical',
        category: 'budgeting',
        title: 'Budget Exceeds Income',
        message: `You're spending $${overage.toFixed(2)} more than your income. Consider reducing your ${highestCategory[0]} expenses.`,
        priority: 10
      });
    }

    // 4. High-Risk Spending Analysis
    const highAmountItems = budgetItems
      .filter(item => item.amount > totalIncome * 0.15) // More than 15% of income
      .sort((a, b) => b.amount - a.amount);

    if (highAmountItems.length > 0 && highAmountItems[0].category === 'wants') {
      tips.push({
        id: 'high-wants-spending',
        type: 'warning',
        category: 'budgeting',
        title: 'High Discretionary Spending',
        message: `"${highAmountItems[0].name}" ($${highAmountItems[0].amount}) is ${((highAmountItems[0].amount/totalIncome)*100).toFixed(1)}% of your income. Consider if this aligns with your financial goals.`,
        specificItems: [highAmountItems[0].name],
        priority: 7
      });
    }

    // 5. Needs Category Analysis
    if (categoryPercentages.needs > 60) {
      const needsItems = budgetItems.filter(item => item.category === 'needs');
      const highestNeed = needsItems.sort((a, b) => b.amount - a.amount)[0];
      
      tips.push({
        id: 'high-needs-spending',
        type: 'info',
        category: 'budgeting',
        title: 'High Essential Expenses',
        message: `Your needs spending (${categoryPercentages.needs.toFixed(1)}%) is above the recommended 50%. Look for ways to optimize costs like "${highestNeed?.name}".`,
        specificItems: needsItems.map(item => `${item.name}: $${item.amount}`),
        priority: 6
      });
    }

    // 6. Investment Opportunities
    const investmentItems = budgetItems.filter(item => 
      item.name.toLowerCase().includes('invest') || 
      item.name.toLowerCase().includes('401k') ||
      item.name.toLowerCase().includes('ira') ||
      item.name.toLowerCase().includes('stock')
    );

    if (investmentItems.length === 0 && categoryPercentages.savings > 15) {
      tips.push({
        id: 'consider-investing',
        type: 'info',
        category: 'investing',
        title: 'Consider Investment Options',
        message: 'You have good savings habits! Consider allocating some savings to investments like 401k, IRA, or index funds for long-term growth.',
        priority: 5
      });
    }

    // 7. Debt Analysis
    const debtItems = budgetItems.filter(item => 
      item.name.toLowerCase().includes('debt') ||
      item.name.toLowerCase().includes('loan') ||
      item.name.toLowerCase().includes('credit') ||
      item.name.toLowerCase().includes('payment')
    );

    if (debtItems.length > 0) {
      const totalDebt = debtItems.reduce((sum, item) => sum + item.amount, 0);
      const debtPercentage = (totalDebt / totalIncome) * 100;
      
      if (debtPercentage > 20) {
        tips.push({
          id: 'high-debt-payments',
          type: 'warning',
          category: 'debt',
          title: 'High Debt Payments',
          message: `Debt payments (${debtPercentage.toFixed(1)}% of income) are high. Consider debt consolidation or avalanche method to pay off high-interest debt first.`,
          specificItems: debtItems.map(item => `${item.name}: $${item.amount}`),
          priority: 8
        });
      }
    }

    // 8. Unallocated Money Tip
    if (unallocated > totalIncome * 0.05) { // More than 5% unallocated
      tips.push({
        id: 'unallocated-money',
        type: 'info',
        category: 'allocation',
        title: 'Optimize Unallocated Funds',
        message: `You have $${unallocated.toFixed(2)} unallocated. Consider directing this to emergency fund, savings, or debt payments for better financial health.`,
        priority: 7
      });
    }

    // Sort by priority and return top 5
    return tips.sort((a, b) => b.priority - a.priority).slice(0, 5);
  };

  // Generate smart tips based on current budget
  const smartTips = generateSmartTips();



  // Get category performance data
  const getCategoryPerformance = () => {
    if (totalIncome === 0) return [];

         return (['needs', 'savings', 'wants'] as const).map(category => {
      const targetPercentage = customPercentages[category];
      const targetAmount = (targetPercentage / 100) * totalIncome;
      const categoryItems = budgetItems.filter(item => item.category === category);
      const actualAmount = categoryItems.reduce((sum, item) => sum + item.amount, 0);
      const actualPercentage = totalIncome > 0 ? (actualAmount / totalIncome) * 100 : 0;
      const variance = actualPercentage - targetPercentage;
      const remaining = targetAmount - actualAmount;

      // Find biggest expense and performers
      const biggestExpense = categoryItems.reduce((max, item) => 
        item.amount > max.amount ? item : max, { name: 'None', amount: 0 });

      return {
        category,
        targetPercentage,
        targetAmount,
        actualAmount,
        actualPercentage,
        variance,
        remaining,
        itemCount: categoryItems.length,
        biggestExpense,
        status: variance > 5 ? 'over' : variance < -5 ? 'under' : 'good'
      };
    });
  };

  // Calculate monthly trends (now more realistic based on actual data)
  const getMonthlyTrends = () => {
    const currentMonth = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return Array.from({ length: 3 }, (_, i) => {
      const monthIndex = (currentMonth - 2 + i + 12) % 12;
      const variation = (Math.random() - 0.5) * 0.15; // ±7.5% variation
      
             const monthCategoryTotals = budgetItems.reduce((acc, item) => {
         acc[item.category] = (acc[item.category] || 0) + item.amount;
         return acc;
       }, {} as Record<string, number>);

       return {
         month: months[monthIndex],
         totalSpent: totalAllocated * (1 + variation),
         needs: (monthCategoryTotals.needs || 0) * (1 + variation),
         savings: (monthCategoryTotals.savings || 0) * (1 + variation),
         wants: (monthCategoryTotals.wants || 0) * (1 + variation)
       };
    });
  };

  // Goal tracking (based on actual savings data)
  const getSavingsGoals = () => {
    const savingsAmount = budgetItems
      .filter(item => item.category === 'savings')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const monthlyIncome = parseInt(income) || 0;

    return [
      {
        name: 'Emergency Fund',
        target: monthlyIncome * 6, // 6 months of income
        current: savingsAmount * 0.7, // Assume 70% goes to emergency fund
        priority: 'high',
        timeline: savingsAmount > 0 ? Math.ceil((monthlyIncome * 6 - savingsAmount * 0.7) / (savingsAmount * 0.7 / 12)) + ' months' : '∞'
      },
      {
        name: 'Vacation Fund',
        target: 3000,
        current: savingsAmount * 0.2, // 20% to vacation
        priority: 'medium',
        timeline: savingsAmount > 0 ? Math.ceil((3000 - savingsAmount * 0.2) / (savingsAmount * 0.2 / 12)) + ' months' : '∞'
      },
      {
        name: 'Investment Portfolio',
        target: 25000,
        current: savingsAmount * 0.1, // 10% to investments
        priority: 'low',
        timeline: savingsAmount > 0 ? Math.ceil((25000 - savingsAmount * 0.1) / (savingsAmount * 0.1 / 12)) + ' months' : '∞'
      }
    ];
  };

  // Export data functionality
  const exportToPDF = () => {
    // Would integrate with a PDF library like jsPDF
    console.log('Exporting to PDF...');
    alert('PDF export feature would be implemented here');
  };

  const exportToCSV = () => {
    const csvData = budgetItems.map(item => ({
      Category: item.category,
      Item: item.name,
      Amount: item.amount,
      Percentage: item.percentage
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    selectedTimeframe,
    setSelectedTimeframe,

    categoryPerformance: getCategoryPerformance(),
    smartTips: smartTips,
    monthlyTrends: getMonthlyTrends(),
    savingsGoals: getSavingsGoals(),
    exportToPDF,
    exportToCSV,
    totalIncome: parseInt(income) || 0,
    totalAllocated: budgetItems.reduce((sum, item) => sum + item.amount, 0),
    unallocated: (parseInt(income) || 0) - budgetItems.reduce((sum, item) => sum + item.amount, 0)
  };
}; 