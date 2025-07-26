import { useState, useMemo } from 'react';

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

export const useReportSectionLogic = (props: ReportSectionProps) => {
  const { selectedPlan, customPercentages, income, budgetItems } = props;
  
  const totalIncome = parseInt(income) || 0;
  const needsItems = budgetItems.filter(item => item.category === 'needs');
  const savingsItems = budgetItems.filter(item => item.category === 'savings');
  const wantsItems = budgetItems.filter(item => item.category === 'wants');
  
  const needsTotal = needsItems.reduce((sum, item) => sum + item.amount, 0);
  const savingsTotal = savingsItems.reduce((sum, item) => sum + item.amount, 0);
  const wantsTotal = wantsItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Current Budget Analysis
  const categoryBalance = useMemo(() => {
    const needsPercentage = totalIncome > 0 ? (needsTotal / totalIncome) * 100 : 0;
    const savingsPercentage = totalIncome > 0 ? (savingsTotal / totalIncome) * 100 : 0;
    const wantsPercentage = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0;
    
    const assessCategory = (actual: number, target: number) => {
      const diff = Math.abs(actual - target);
      if (diff <= 2) return { status: 'excellent', assessment: 'Perfect' };
      if (diff <= 5) return { status: 'good', assessment: 'Good' };
      if (diff <= 10) return { status: 'fair', assessment: 'Fair' };
      return { status: 'poor', assessment: 'Needs Adjustment' };
    };
    
    return {
      needs: {
        percentage: needsPercentage.toFixed(1),
        ...assessCategory(needsPercentage, customPercentages.needs)
      },
      savings: {
        percentage: savingsPercentage.toFixed(1),
        ...assessCategory(savingsPercentage, customPercentages.savings)
      },
      wants: {
        percentage: wantsPercentage.toFixed(1),
        ...assessCategory(wantsPercentage, customPercentages.wants)
      },
      recommendation: "Your budget follows a balanced approach. Consider the 50/30/20 rule as a benchmark."
    };
  }, [needsTotal, savingsTotal, wantsTotal, totalIncome, customPercentages]);

  const riskAnalysis = useMemo(() => {
    const emergencyFund = savingsItems.find(item => 
      item.name.toLowerCase().includes('emergency')
    )?.amount || 0;
    
    const monthlyExpenses = needsTotal + wantsTotal;
    const emergencyMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    
    const debtItems = budgetItems.filter(item => 
      item.name.toLowerCase().includes('debt') || 
      item.name.toLowerCase().includes('payment')
    );
    const debtTotal = debtItems.reduce((sum, item) => sum + item.amount, 0);
    const debtPercentage = totalIncome > 0 ? (debtTotal / totalIncome) * 100 : 0;
    
    const stabilityScore = Math.min(100, 
      (emergencyMonths >= 3 ? 40 : emergencyMonths * 13) +
      (debtPercentage <= 30 ? 30 : Math.max(0, 30 - (debtPercentage - 30))) +
      (savingsTotal / totalIncome >= 0.2 ? 30 : (savingsTotal / totalIncome) * 150)
    );
    
    return {
      emergencyFund: {
        months: emergencyMonths.toFixed(1),
        status: emergencyMonths >= 6 ? 'excellent' : emergencyMonths >= 3 ? 'good' : 'poor',
        level: emergencyMonths >= 6 ? 'Excellent' : emergencyMonths >= 3 ? 'Adequate' : 'Insufficient'
      },
      debtLoad: {
        percentage: debtPercentage.toFixed(1),
        status: debtPercentage <= 20 ? 'good' : debtPercentage <= 40 ? 'fair' : 'poor',
        level: debtPercentage <= 20 ? 'Healthy' : debtPercentage <= 40 ? 'Manageable' : 'High Risk'
      },
      stability: {
        score: Math.round(stabilityScore),
        status: stabilityScore >= 80 ? 'excellent' : stabilityScore >= 60 ? 'good' : 'poor',
        level: stabilityScore >= 80 ? 'Stable' : stabilityScore >= 60 ? 'Moderate' : 'At Risk'
      }
    };
  }, [budgetItems, needsTotal, wantsTotal, savingsItems, totalIncome]);

  const efficiencyScore = useMemo(() => {
    const alignmentScore = Math.max(0, 100 - Math.abs(
      (needsTotal + savingsTotal + wantsTotal - totalIncome) / totalIncome * 100
    ));
    
    const savingsRateScore = Math.min(100, (savingsTotal / totalIncome) * 500);
    const riskScore = riskAnalysis.stability.score;
    
    const overall = Math.round((alignmentScore + savingsRateScore + riskScore) / 3);
    const grade = overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'F';
    
    return {
      overall,
      grade,
      alignment: Math.round(alignmentScore),
      savingsRate: Math.round(savingsRateScore),
      riskManagement: riskScore,
      improvementTip: overall >= 80 ? "Excellent work! Keep maintaining this balance." : 
                     overall >= 60 ? "Consider increasing your savings rate for better long-term security." :
                     "Focus on building an emergency fund and reducing high-risk spending."
    };
  }, [needsTotal, savingsTotal, wantsTotal, totalIncome, riskAnalysis]);

  // Financial Projections
  const savingsGrowth = useMemo(() => {
    const monthlySavings = savingsTotal;
    const annualRate = 0.07; // 7% assumed return
    const monthlyRate = annualRate / 12;
    
    const calculateCompoundGrowth = (months: number) => {
      let total = 0;
      for (let i = 0; i < months; i++) {
        total = (total + monthlySavings) * (1 + monthlyRate);
      }
      return Math.round(total);
    };
    
    return {
      oneYear: calculateCompoundGrowth(12),
      fiveYears: calculateCompoundGrowth(60),
      tenYears: calculateCompoundGrowth(120),
      assumedRate: '7.0'
    };
  }, [savingsTotal]);

  const goalTimeline = useMemo(() => [
    {
      name: "Emergency Fund (6 months)",
      targetAmount: (needsTotal + wantsTotal) * 6,
      timeToAchieve: savingsTotal > 0 ? `${Math.ceil(((needsTotal + wantsTotal) * 6) / savingsTotal)} months` : "No savings allocated"
    },
    {
      name: "House Down Payment (20%)",
      targetAmount: 80000,
      timeToAchieve: savingsTotal > 0 ? `${Math.ceil(80000 / savingsTotal)} months` : "No savings allocated"
    },
    {
      name: "New Car",
      targetAmount: 25000,
      timeToAchieve: savingsTotal > 0 ? `${Math.ceil(25000 / savingsTotal)} months` : "No savings allocated"
    }
  ], [needsTotal, wantsTotal, savingsTotal]);

  const retirementProjection = useMemo(() => {
    const monthlyRetirementSavings = savingsItems
      .filter(item => item.name.toLowerCase().includes('retirement'))
      .reduce((sum, item) => sum + item.amount, 0);
    
    const yearsToRetirement = 30; // Assume 30 years
    const annualReturn = 0.07;
    const monthlyReturn = annualReturn / 12;
    const months = yearsToRetirement * 12;
    
    let futureValue = 0;
    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + monthlyRetirementSavings) * (1 + monthlyReturn);
    }
    
    const monthlyIncome = Math.round(futureValue * 0.04 / 12); // 4% withdrawal rule
    
    return {
      atAge65: Math.round(futureValue),
      monthlyIncome,
      readiness: {
        status: monthlyIncome >= totalIncome * 0.8 ? 'excellent' : monthlyIncome >= totalIncome * 0.6 ? 'good' : 'poor',
        level: monthlyIncome >= totalIncome * 0.8 ? 'On Track' : monthlyIncome >= totalIncome * 0.6 ? 'Moderate' : 'Behind'
      }
    };
  }, [savingsItems, totalIncome]);

  const emergencyFundTimeline = useMemo(() => {
    const emergencyFund = savingsItems.find(item => 
      item.name.toLowerCase().includes('emergency')
    )?.amount || 0;
    
    const monthlyExpenses = needsTotal + wantsTotal;
    const currentMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    const targetAmount = monthlyExpenses * 6;
    
    return {
      current: currentMonths.toFixed(1),
      timeToTarget: emergencyFund > 0 && monthlyExpenses > 0 ? 
        `${Math.ceil((targetAmount - emergencyFund) / emergencyFund)} months` : 
        "Start saving now",
      targetAmount
    };
  }, [savingsItems, needsTotal, wantsTotal]);

  // Smart Recommendations
  const optimizationSuggestions = useMemo(() => [
    {
      action: "Increase emergency fund allocation",
      impact: "2 points to stability score"
    },
    {
      action: "Reduce wants spending by $100",
      impact: "$1,200 annual savings"
    },
    {
      action: "Automate retirement contributions",
      impact: "Better long-term security"
    }
  ], []);

  const benchmarkComparisons = useMemo(() => [
    {
      rule: "50/30/20 Rule",
      yourValue: `${((needsTotal / totalIncome) * 100).toFixed(0)}/${((wantsTotal / totalIncome) * 100).toFixed(0)}/${((savingsTotal / totalIncome) * 100).toFixed(0)}`,
      idealValue: "50/30/20",
      status: Math.abs((needsTotal / totalIncome) * 100 - 50) <= 5 ? 'good' : 'fair',
      assessment: Math.abs((needsTotal / totalIncome) * 100 - 50) <= 5 ? 'Good Match' : 'Needs Adjustment'
    },
    {
      rule: "Emergency Fund",
      yourValue: `${riskAnalysis.emergencyFund.months} months`,
      idealValue: "6 months",
      status: parseFloat(riskAnalysis.emergencyFund.months) >= 6 ? 'excellent' : 'poor',
      assessment: parseFloat(riskAnalysis.emergencyFund.months) >= 6 ? 'Excellent' : 'Build More'
    }
  ], [needsTotal, wantsTotal, savingsTotal, totalIncome, riskAnalysis]);

  const riskWarnings = useMemo(() => {
    const warnings = [];
    
    if (parseFloat(riskAnalysis.emergencyFund.months) < 3) {
      warnings.push({
        severity: 'high',
        message: "Emergency fund is below 3 months of expenses",
        recommendedAction: "Prioritize building emergency savings"
      });
    }
    
    if (parseFloat(riskAnalysis.debtLoad.percentage) > 40) {
      warnings.push({
        severity: 'high',
        message: "Debt payments exceed 40% of income",
        recommendedAction: "Consider debt consolidation strategies"
      });
    }
    
    if (savingsTotal / totalIncome < 0.1) {
      warnings.push({
        severity: 'medium',
        message: "Savings rate is below 10%",
        recommendedAction: "Gradually increase savings allocation"
      });
    }
    
    return warnings.length > 0 ? warnings : [{
      severity: 'low',
      message: "No major financial risks detected",
      recommendedAction: "Continue current financial practices"
    }];
  }, [riskAnalysis, savingsTotal, totalIncome]);

  const goalPriority = useMemo(() => [
    {
      name: "Build Emergency Fund",
      reason: "Foundation of financial security"
    },
    {
      name: "Pay Off High-Interest Debt",
      reason: "Reduces financial burden"
    },
    {
      name: "Increase Retirement Savings",
      reason: "Compound interest benefits"
    },
    {
      name: "Save for Major Purchases",
      reason: "Avoid future debt"
    }
  ], []);

  // What-If Scenarios (simplified with static values for now)
  const [incomeChangePercentage, setIncomeChangePercentage] = useState(0);
  const [expenseChangeAmount, setExpenseChangeAmount] = useState(0);
  const [savingsRatePercentage, setSavingsRatePercentage] = useState(20);

  const incomeChangeImpact = useMemo(() => ({
    percentage: incomeChangePercentage,
    newIncome: Math.round(totalIncome * (1 + incomeChangePercentage / 100)),
    savingsImpact: Math.round(totalIncome * (incomeChangePercentage / 100) * 0.3) // Assume 30% goes to savings
  }), [incomeChangePercentage, totalIncome]);

  const expenseAdjustments = useMemo(() => ({
    amount: expenseChangeAmount,
    remainingFunds: totalIncome - needsTotal - wantsTotal - expenseChangeAmount,
    healthImpact: {
      status: expenseChangeAmount > 200 ? 'negative' : expenseChangeAmount < -200 ? 'positive' : 'neutral',
      change: expenseChangeAmount > 200 ? 'Decreased' : expenseChangeAmount < -200 ? 'Improved' : 'Stable'
    }
  }), [expenseChangeAmount, totalIncome, needsTotal, wantsTotal]);

  const savingsRateChanges = useMemo(() => {
    const newMonthlySavings = totalIncome * (savingsRatePercentage / 100);
    const tenYearProjection = newMonthlySavings * 12 * 10 * 1.07; // Simplified compound calculation
    
    return {
      rate: savingsRatePercentage,
      tenYearProjection: Math.round(tenYearProjection),
      retirementImpact: {
        status: savingsRatePercentage >= 20 ? 'positive' : 'negative',
        level: savingsRatePercentage >= 20 ? 'On Track' : 'Behind'
      }
    };
  }, [savingsRatePercentage, totalIncome]);

  // Export functions
  const exportToPDF = () => {
    console.log('Exporting to PDF...');
    // TODO: Implement PDF export
  };

  const exportToCSV = () => {
    console.log('Exporting to CSV...');
    // TODO: Implement CSV export
  };

  return {
    // Current Budget Analysis
    categoryBalance,
    riskAnalysis,
    efficiencyScore,
    
    // Financial Projections
    savingsGrowth,
    goalTimeline,
    retirementProjection,
    emergencyFundTimeline,
    
    // Smart Recommendations
    optimizationSuggestions,
    benchmarkComparisons,
    riskWarnings,
    goalPriority,
    
    // What-If Scenarios
    incomeChangeImpact,
    expenseAdjustments,
    savingsRateChanges,
    
    // What-If Scenario Controls
    setIncomeChangePercentage,
    setExpenseChangeAmount,
    setSavingsRatePercentage,
    
    // Export functions
    exportToPDF,
    exportToCSV
  };
}; 