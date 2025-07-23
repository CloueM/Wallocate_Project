// Define BudgetItem interface locally since it's not exported
interface BudgetItem {
  id: number;
  name: string;
  amount: number;
  percentage: number;
  category: 'needs' | 'savings' | 'wants';
}

interface FinancialTip {
  id: string;
  category: 'budgeting' | 'saving' | 'investing' | 'debt' | 'emergency' | 'general';
  title: string;
  tip: string;
  source: string;
  relevance: number; // 1-10 based on user's budget data
}

interface BudgetAnalysis {
  totalIncome: number;
  totalAllocated: number;
  savingsRate: number;
  needsPercentage: number;
  wantsPercentage: number;
  hasEmergencyFund: boolean;
  highestExpenseCategory: string;
}

class SmartFinancialTipsGenerator {
  private tips: FinancialTip[] = [
    {
      id: '1',
      category: 'budgeting',
      title: 'Follow the 50/30/20 Rule',
      tip: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.',
      source: 'Elizabeth Warren',
      relevance: 8
    },
    {
      id: '2',
      category: 'saving',
      title: 'Automate Your Savings',
      tip: 'Set up automatic transfers to your savings account right after payday to pay yourself first.',
      source: 'Financial Planning Association',
      relevance: 9
    },
    {
      id: '3',
      category: 'emergency',
      title: 'Build an Emergency Fund',
      tip: 'Aim to save 3-6 months of living expenses for unexpected situations.',
      source: 'Dave Ramsey',
      relevance: 10
    },
    {
      id: '4',
      category: 'budgeting',
      title: 'Track Every Dollar',
      tip: 'Give every dollar a purpose by assigning it to a specific category before spending.',
      source: 'Zero-Based Budgeting',
      relevance: 7
    },
    {
      id: '5',
      category: 'debt',
      title: 'Pay Off High-Interest Debt First',
      tip: 'Focus on paying off credit cards and loans with the highest interest rates to save money.',
      source: 'Avalanche Method',
      relevance: 8
    },
    {
      id: '6',
      category: 'saving',
      title: 'Use the 24-Hour Rule',
      tip: 'Wait 24 hours before making non-essential purchases to avoid impulse buying.',
      source: 'Behavioral Economics',
      relevance: 6
    },
    {
      id: '7',
      category: 'investing',
      title: 'Start Investing Early',
      tip: 'Even small amounts invested early can grow significantly due to compound interest.',
      source: 'Albert Einstein',
      relevance: 7
    },
    {
      id: '8',
      category: 'budgeting',
      title: 'Review Your Budget Monthly',
      tip: 'Regularly review and adjust your budget based on actual spending patterns.',
      source: 'Personal Finance Best Practices',
      relevance: 8
    }
  ];

  private analyzeBudget(
    budgetItems: BudgetItem[], 
    income: number, 
    customPercentages: { needs: number; savings: number; wants: number }
  ): BudgetAnalysis {
    const totalIncome = parseInt(income.toString()) || 0;
    const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const savingsAmount = budgetItems
      .filter(item => item.category === 'savings')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;
    const hasEmergencyFund = budgetItems.some(item => 
      item.name.toLowerCase().includes('emergency') && item.amount > 0
    );

    // Find highest expense category
    const categoryTotals = budgetItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    const highestExpenseCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'none';

    return {
      totalIncome,
      totalAllocated,
      savingsRate,
      needsPercentage: customPercentages.needs,
      wantsPercentage: customPercentages.wants,
      hasEmergencyFund,
      highestExpenseCategory
    };
  }

  private calculateRelevance(tip: FinancialTip, analysis: BudgetAnalysis): number {
    let relevance = tip.relevance;

    // Adjust relevance based on user's situation
    switch (tip.category) {
      case 'emergency':
        if (!analysis.hasEmergencyFund) relevance += 3;
        break;
      case 'saving':
        if (analysis.savingsRate < 10) relevance += 2;
        if (analysis.savingsRate < 5) relevance += 2;
        break;
      case 'budgeting':
        if (analysis.totalAllocated > analysis.totalIncome * 1.1) relevance += 3;
        break;
      case 'debt':
        if (analysis.wantsPercentage > 40) relevance += 2;
        break;
    }

    return Math.min(relevance, 10);
  }

  private generatePersonalizedTips(analysis: BudgetAnalysis): FinancialTip[] {
    const personalizedTips: FinancialTip[] = [];

    // Emergency fund tip
    if (!analysis.hasEmergencyFund) {
      personalizedTips.push({
        id: 'personal-emergency',
        category: 'emergency',
        title: 'Start Your Emergency Fund Today',
        tip: `You don't have an emergency fund yet. Start by saving just $500 as a starter emergency fund, then work toward 3-6 months of expenses.`,
        source: 'Personalized Recommendation',
        relevance: 10
      });
    }

    // Savings rate tip
    if (analysis.savingsRate < 10) {
      personalizedTips.push({
        id: 'personal-savings',
        category: 'saving',
        title: 'Boost Your Savings Rate',
        tip: `Your current savings rate is ${analysis.savingsRate.toFixed(1)}%. Try to gradually increase it to at least 20% for a stronger financial future.`,
        source: 'Personalized Recommendation',
        relevance: 9
      });
    }

    // Over-budget tip
    if (analysis.totalAllocated > analysis.totalIncome) {
      const overage = analysis.totalAllocated - analysis.totalIncome;
      personalizedTips.push({
        id: 'personal-budget',
        category: 'budgeting',
        title: 'Balance Your Budget',
        tip: `You're currently spending $${overage.toFixed(2)} more than your income. Review your ${analysis.highestExpenseCategory} expenses to find areas to cut back.`,
        source: 'Personalized Recommendation',
        relevance: 10
      });
    }

    return personalizedTips;
  }

  public getSmartTips(
    budgetItems: BudgetItem[], 
    income: string, 
    customPercentages: { needs: number; savings: number; wants: number },
    limit: number = 5
  ): FinancialTip[] {
    const analysis = this.analyzeBudget(budgetItems, parseInt(income) || 0, customPercentages);
    
    // Get personalized tips
    const personalizedTips = this.generatePersonalizedTips(analysis);
    
    // Calculate relevance for general tips
    const generalTips = this.tips.map(tip => ({
      ...tip,
      relevance: this.calculateRelevance(tip, analysis)
    }));

    // Combine and sort by relevance
    const allTips = [...personalizedTips, ...generalTips]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return allTips;
  }

  public getTipsByCategory(category: FinancialTip['category']): FinancialTip[] {
    return this.tips.filter(tip => tip.category === category);
  }

  public getRandomTip(): FinancialTip {
    const randomIndex = Math.floor(Math.random() * this.tips.length);
    return this.tips[randomIndex];
  }
}

// Export singleton instance
export const financialTipsGenerator = new SmartFinancialTipsGenerator();

// Hook for React components
export const useFinancialTips = (
  budgetItems: BudgetItem[], 
  income: string, 
  customPercentages: { needs: number; savings: number; wants: number }
) => {
  const getSmartTips = (limit?: number) => 
    financialTipsGenerator.getSmartTips(budgetItems, income, customPercentages, limit);
  
  const getTipsByCategory = (category: FinancialTip['category']) =>
    financialTipsGenerator.getTipsByCategory(category);
  
  const getRandomTip = () =>
    financialTipsGenerator.getRandomTip();

  return {
    getSmartTips,
    getTipsByCategory,
    getRandomTip
  };
}; 