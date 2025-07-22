import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

interface BudgetPlan {
  name: string;
  description: string;
  needs: number;
  savings: number;
  wants: number;
}

interface PlanSectionProps {
  selectedPlan: BudgetPlan;
  setSelectedPlan: (plan: BudgetPlan) => void;
  customPercentages: {
    needs: number;
    savings: number;
    wants: number;
  };
  setCustomPercentages: (percentages: { needs: number; savings: number; wants: number }) => void;
  income: string;
  setIncome: (income: string) => void;
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

export const usePlanSectionLogic = (props: PlanSectionProps) => {
  const {
    selectedPlan,
    setSelectedPlan,
    customPercentages,
    setCustomPercentages,
    income,
    setIncome
  } = props;

  // Refs for sliders and percentage labels
  const needsSliderRef = useRef<HTMLInputElement>(null);
  const savingsSliderRef = useRef<HTMLInputElement>(null);
  const wantsSliderRef = useRef<HTMLInputElement>(null);
  const needsPercentageRef = useRef<HTMLDivElement>(null);
  const savingsPercentageRef = useRef<HTMLDivElement>(null);
  const wantsPercentageRef = useRef<HTMLDivElement>(null);

  // Initialize percentage positions on mount
  useEffect(() => {
    updatePercentagePosition('needs', customPercentages.needs);
    updatePercentagePosition('savings', customPercentages.savings);
    updatePercentagePosition('wants', customPercentages.wants);
  }, []);

  const handlePlanSelect = (plan: BudgetPlan) => {
    setSelectedPlan(plan);
    const newPercentages = {
      needs: plan.needs,
      savings: plan.savings,
      wants: plan.wants
    };
    
    // Animate sliders with GSAP
    animateSliders(newPercentages);
    
    setCustomPercentages(newPercentages);
  };

  const animateSliders = (newPercentages: { needs: number; savings: number; wants: number }) => {
    // Animate needs slider
    if (needsSliderRef.current) {
      gsap.to(needsSliderRef.current, {
        value: newPercentages.needs,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (needsSliderRef.current) {
            updatePercentagePosition('needs', needsSliderRef.current.valueAsNumber);
          }
        }
      });
    }

    // Animate savings slider
    if (savingsSliderRef.current) {
      gsap.to(savingsSliderRef.current, {
        value: newPercentages.savings,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (savingsSliderRef.current) {
            updatePercentagePosition('savings', savingsSliderRef.current.valueAsNumber);
          }
        }
      });
    }

    // Animate wants slider
    if (wantsSliderRef.current) {
      gsap.to(wantsSliderRef.current, {
        value: newPercentages.wants,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (wantsSliderRef.current) {
            updatePercentagePosition('wants', wantsSliderRef.current.valueAsNumber);
          }
        }
      });
    }
  };

  const handleSliderChange = (type: 'needs' | 'savings' | 'wants', value: number) => {
    const newPercentages = { ...customPercentages, [type]: value };
    setCustomPercentages(newPercentages);
    // Update to custom plan when user adjusts
    setSelectedPlan({ 
      name: "Custom Plan",
      description: "Users with unique priorities who want full control.",
      ...newPercentages 
    });
    
    // Update percentage position
    updatePercentagePosition(type, value);
  };

  const updatePercentagePosition = (type: 'needs' | 'savings' | 'wants', value: number) => {
    const slider = document.querySelector(`input[data-type="${type}"]`) as HTMLInputElement;
    const percentageLabel = document.querySelector(`.slider-percentage[data-type="${type}"]`) as HTMLElement;
    
    if (slider && percentageLabel) {
      const sliderRect = slider.getBoundingClientRect();
      const percentage = (value / 100) * (sliderRect.width - 40); // 40px is thumb width
      percentageLabel.style.left = `${percentage + 20}px`; // 20px is half thumb width
    }
  };

  // Calculate total percentage
  const totalPercentage = customPercentages.needs + customPercentages.savings + customPercentages.wants;
  
  // Determine indicator color based on total percentage
  const getIndicatorColor = (total: number) => {
    if (total > 100) return 'red';
    if (total >= 75 && total <= 99) return 'orange';
    if (total >= 0 && total <= 74) return 'blue';
    if (total === 100) return 'green';
    return 'blue'; // default
  };

  const indicatorColor = getIndicatorColor(totalPercentage);

  const handleContinueClick = () => {
    if (totalPercentage === 100) {
      console.log('Proceeding with budget plan:', selectedPlan.name);
      // Enable scrolling temporarily
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      
      // Scroll to budget items section
      const budgetItemsSection = document.getElementById('budget-items');
      if (budgetItemsSection) {
        budgetItemsSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Re-disable scrolling after animation
      setTimeout(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }, 1000);
    }
  };

  return {
    needsSliderRef,
    savingsSliderRef,
    wantsSliderRef,
    needsPercentageRef,
    savingsPercentageRef,
    wantsPercentageRef,
    handlePlanSelect,
    handleSliderChange,
    totalPercentage,
    indicatorColor,
    handleContinueClick
  };
}; 