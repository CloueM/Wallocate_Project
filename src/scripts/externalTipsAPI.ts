// Example integration with external financial tips APIs
// This file shows how to expand the tips system with external data
import { useState } from 'react';

interface ExternalTip {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  relevanceScore: number;
}

interface BudgetData {
  totalIncome: number;
  totalAllocated: number;
  savingsRate: number;
  categories: {
    needs: number;
    savings: number;
    wants: number;
  };
  items: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
}

class ExternalFinancialTipsService {
  
  // Example: OpenAI GPT API for custom financial advice
  async getPersonalizedTipsFromOpenAI(budgetData: BudgetData): Promise<ExternalTip[]> {
    try {
      // This would require an OpenAI API key
      const prompt = `
        Based on this budget data:
        - Income: $${budgetData.totalIncome}
        - Total Allocated: $${budgetData.totalAllocated}
        - Savings Rate: ${budgetData.savingsRate}%
        - Needs: $${budgetData.categories.needs}
        - Savings: $${budgetData.categories.savings}
        - Wants: $${budgetData.categories.wants}
        
        Budget Items: ${JSON.stringify(budgetData.items)}
        
        Provide 3 specific financial tips based on this person's actual spending patterns.
        Focus on their specific items and amounts.
      `;

      // Example API call (would need actual implementation)
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_OPENAI_API_KEY`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500
        })
      });

      const data = await response.json();
      
      // Parse the response and convert to our tip format
      return this.parseOpenAIResponse(data.choices[0].message.content);
      
    } catch (error) {
      console.error('Failed to get tips from OpenAI:', error);
      return [];
    }
  }

  // Example: Financial quotes API
  async getInspirationalQuotes(): Promise<ExternalTip[]> {
    try {
      // Example using a quotes API
      const response = await fetch('https://quotes.rest/qod?category=inspire');
      const data = await response.json();
      
      return [{
        id: 'daily-quote',
        title: 'Daily Inspiration',
        content: data.contents.quotes[0].quote,
        category: 'motivation',
        source: data.contents.quotes[0].author,
        relevanceScore: 5
      }];
      
    } catch (error) {
      console.error('Failed to get inspirational quotes:', error);
      return [];
    }
  }

  // Example: Finley AI API integration
  async getAdviceFromFinleyAI(budgetData: BudgetData): Promise<ExternalTip[]> {
    try {
      // This would require Finley AI API credentials
      const response = await fetch('https://api.finleyai.com/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_FINLEY_AI_API_KEY`
        },
        body: JSON.stringify({
          income: budgetData.totalIncome,
          expenses: budgetData.totalAllocated,
          savingsRate: budgetData.savingsRate,
          categories: budgetData.categories
        })
      });

      const data = await response.json();
      
      return data.recommendations.map((rec: any, index: number) => ({
        id: `finley-${index}`,
        title: rec.title,
        content: rec.advice,
        category: rec.category,
        source: 'Finley AI',
        relevanceScore: rec.priority || 5
      }));
      
    } catch (error) {
      console.error('Failed to get advice from Finley AI:', error);
      return [];
    }
  }

  // Example: Custom financial data API
  async getMarketBasedTips(): Promise<ExternalTip[]> {
    try {
      // Example getting tips based on current market conditions
      const response = await fetch('https://api.financialdataapi.com/tips', {
        headers: {
          'X-API-Key': 'YOUR_FINANCIAL_DATA_API_KEY'
        }
      });
      
      const data = await response.json();
      
      return data.tips.map((tip: any) => ({
        id: tip.id,
        title: tip.headline,
        content: tip.description,
        category: tip.type,
        source: 'Financial Market Data',
        relevanceScore: tip.relevance
      }));
      
    } catch (error) {
      console.error('Failed to get market-based tips:', error);
      return [];
    }
  }

  // Combine multiple sources
  async getAllExternalTips(budgetData: BudgetData): Promise<ExternalTip[]> {
    const [openAITips, quotes, finleyTips, marketTips] = await Promise.allSettled([
      this.getPersonalizedTipsFromOpenAI(budgetData),
      this.getInspirationalQuotes(),
      this.getAdviceFromFinleyAI(budgetData),
      this.getMarketBasedTips()
    ]);

    const allTips: ExternalTip[] = [];
    
    // Combine successful results
    if (openAITips.status === 'fulfilled') allTips.push(...openAITips.value);
    if (quotes.status === 'fulfilled') allTips.push(...quotes.value);
    if (finleyTips.status === 'fulfilled') allTips.push(...finleyTips.value);
    if (marketTips.status === 'fulfilled') allTips.push(...marketTips.value);

    // Sort by relevance score
    return allTips.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private parseOpenAIResponse(response: string): ExternalTip[] {
    // Parse the GPT response and convert to structured tips
    const tips: ExternalTip[] = [];
    
    // Simple parsing logic - in practice, you'd want more robust parsing
    const sections = response.split('\n').filter(line => line.trim().length > 0);
    
    sections.forEach((section, index) => {
      if (section.includes('1.') || section.includes('2.') || section.includes('3.')) {
        tips.push({
          id: `openai-tip-${index}`,
          title: `Personalized Tip ${tips.length + 1}`,
          content: section.replace(/^\d+\.\s*/, ''),
          category: 'personalized',
          source: 'OpenAI GPT',
          relevanceScore: 8
        });
      }
    });

    return tips;
  }
}

// Usage example in your React components:
export const useExternalTips = (budgetData: BudgetData) => {
  const [externalTips, setExternalTips] = useState<ExternalTip[]>([]);
  const [loading, setLoading] = useState(false);
  
  const service = new ExternalFinancialTipsService();

  const fetchExternalTips = async () => {
    setLoading(true);
    try {
      const tips = await service.getAllExternalTips(budgetData);
      setExternalTips(tips);
    } catch (error) {
      console.error('Failed to fetch external tips:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    externalTips,
    loading,
    fetchExternalTips
  };
};

export default ExternalFinancialTipsService; 