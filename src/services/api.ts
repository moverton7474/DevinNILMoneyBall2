// Enhanced API Client for NIL Moneyball Platform
import type { 
  Player, 
  BudgetTier, 
  OptimizationResults, 
  MarketOpportunityMatrix,
  PriceAlert,
  CompetitiveIntelligence,
  OptimizationConstraints,
  PlayerEvaluation,
  BaronHopsonComparison 
} from '../types/moneyball';

const API_BASE_URL = 'http://localhost:5000/api/v1';

class MoneyballAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Transfer Portal Methods
  async getTransferPortalPlayers(): Promise<Player[]> {
    // Simulate API delay and return mock data for development
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransferPortalPlayers;
  }

  async getAthletes(): Promise<Player[]> {
    return this.getTransferPortalPlayers();
  }

  async getPlayerDetails(playerId: number): Promise<Player> {
    const players = await this.getTransferPortalPlayers();
    const player = players.find(p => p.id === playerId.toString());
    if (!player) throw new Error('Player not found');
    return player;
  }

  // Roster Upload Methods
  async uploadRoster(data: any): Promise<{ success: boolean; session_id: string; imported: number; failed: number; players: any[] }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      session_id: `session_${Date.now()}`,
      imported: data.players?.length || 0,
      failed: 0,
      players: data.players || []
    };
  }

  async getUploadSession(sessionId: string): Promise<{ players: any[] }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { players: [] };
  }

  async runBulkAnalysis(data: any): Promise<{ success: boolean; analyzed: number; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      analyzed: data.session_id ? 10 : 0
    };
  }

  // Moneyball Optimization
  async optimizeRoster(budgetTier: BudgetTier, constraints: OptimizationConstraints): Promise<OptimizationResults> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const players = mockTransferPortalPlayers;
    const config = budgetTierConfigs[budgetTier];
    
    // Simple greedy algorithm implementation
    const sortedPlayers = players
      .filter(p => p.marketValue <= config.maxIndividual)
      .map(p => ({
        ...p,
        evaluation: this.evaluatePlayerSync(p, budgetTier)
      }))
      .sort((a, b) => (b.evaluation?.valuePerDollar || 0) - (a.evaluation?.valuePerDollar || 0));
    
    const selectedPlayers: Player[] = [];
    let totalCost = 0;
    let totalValue = 0;
    const positionCounts: Record<string, number> = {};
    
    for (const player of sortedPlayers) {
      if (totalCost + player.marketValue > constraints.totalBudget) continue;
      
      const currentCount = positionCounts[player.position] || 0;
      const requiredCount = constraints.positionRequirements[player.position] || 0;
      
      if (currentCount < requiredCount || Object.values(positionCounts).every(count => count >= 1)) {
        selectedPlayers.push(player);
        totalCost += player.marketValue;
        totalValue += player.evaluation?.adjustedValue || 0;
        positionCounts[player.position] = currentCount + 1;
        
        if (selectedPlayers.length >= 25) break;
      }
    }
    
    return {
      success: true,
      selectedPlayers,
      totalCost,
      totalValue,
      budgetUtilization: totalCost / constraints.totalBudget,
      competitiveAdvantageScore: this.calculateCompetitiveAdvantage(selectedPlayers),
      budgetEfficiency: totalValue / (totalCost / 1000000),
      rosterStrength: totalValue / selectedPlayers.length,
      method: 'greedy_heuristic',
      optimizationTime: 2.0
    };
  }

  async getOptimizationResults(optimizationId: string): Promise<OptimizationResults | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return null;
  }

  // Analytics Methods
  async getAnalyticsDashboard(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDashboardData;
  }

  async getPositionAnalysis(position: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { position, analysis: 'Mock analysis data' };
  }

  // Market Intelligence
  async getMarketMatrix(): Promise<MarketOpportunityMatrix> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const players = mockTransferPortalPlayers.map(p => ({
      ...p,
      evaluation: this.evaluatePlayerSync(p, 'Group5_High')
    }));
    
    const matrix: MarketOpportunityMatrix = {
      highValueLowCost: [],
      highValueHighCost: [],
      lowValueLowCost: [],
      lowValueHighCost: []
    };
    
    players.forEach(player => {
      const value = player.evaluation?.adjustedValue || 0;
      const cost = player.marketValue;
      const isHighValue = value > 75;
      const isHighCost = cost > 50000;
      
      if (isHighValue && !isHighCost) {
        matrix.highValueLowCost.push(player);
      } else if (isHighValue && isHighCost) {
        matrix.highValueHighCost.push(player);
      } else if (!isHighValue && !isHighCost) {
        matrix.lowValueLowCost.push(player);
      } else {
        matrix.lowValueHighCost.push(player);
      }
    });
    
    return matrix;
  }

  async getPriceAlerts(): Promise<PriceAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPriceAlerts;
  }

  async getCompetitiveIntelligence(): Promise<CompetitiveIntelligence> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCompetitiveIntelligence;
  }

  // Player Analysis
  async analyzePlayer(playerId: number): Promise<PlayerEvaluation> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const player = mockTransferPortalPlayers.find(p => p.id === playerId.toString());
    if (!player) throw new Error('Player not found');
    
    return this.evaluatePlayerSync(player, 'Group5_High');
  }

  async evaluatePlayer(playerId: string): Promise<PlayerEvaluation> {
    return this.analyzePlayer(parseInt(playerId));
  }

  async runBaronHopsonAnalysis(playerStats: any): Promise<BaronHopsonComparison> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const baronBaseline = {
      totalTackles: 11,
      soloTackles: 6,
      marketValue: 15000,
      valuePerDollar: 6.57,
      productionScore: 92
    };
    
    const playerProductionScore = this.calculateProductionScore(playerStats, 'LB');
    const playerValuePerDollar = playerProductionScore / (playerStats.marketValue / 1000);
    
    return {
      similarity: this.calculateBaronSimilarity(playerStats, baronBaseline),
      playerValueRatio: playerValuePerDollar,
      baronBaselineRatio: baronBaseline.valuePerDollar,
      advantageMultiplier: playerValuePerDollar / baronBaseline.valuePerDollar,
      recommendation: playerValuePerDollar > 4.0 ? 'STRONG_RECOMMENDATION' : 'MODERATE_INTEREST'
    };
  }

  // Budget Management
  async getBudgetStatus(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { totalBudget: 1300000, spent: 450000, remaining: 850000 };
  }

  async updateBudgetAllocation(data: any): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  // NIL Opportunities
  async getNILOpportunities(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockNILOpportunities;
  }

  async matchNILOpportunity(opportunityId: number, athleteId: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { matchScore: 85, recommendation: 'Strong Match' };
  }

  // Private helper methods
  private evaluatePlayerSync(player: Player, budgetTier: BudgetTier): PlayerEvaluation {
    const productionScore = this.calculateProductionScore(player.stats, player.position);
    const efficiencyRating = this.calculateEfficiencyRating(player.stats, player.position);
    const positionalImpact = this.calculatePositionalImpact(player.position);
    
    const config = budgetTierConfigs[budgetTier];
    let transferMultiplier = 1.0;
    
    if (player.transferFrom === 'FCS' && ['Group5_Low', 'Group5_High'].includes(budgetTier)) {
      transferMultiplier = config.fcsTransferBonus;
    }
    
    const adjustedValue = (productionScore + efficiencyRating + positionalImpact) * transferMultiplier / 3;
    const valuePerDollar = adjustedValue / (player.marketValue / 1000);
    
    return {
      productionScore,
      efficiencyRating,
      positionalImpact,
      adjustedValue,
      valuePerDollar,
      transferMultiplier,
      recommendation: this.generateRecommendation(valuePerDollar),
      baronHopsonComparison: player.position === 'LB' ? this.getBaronComparison(player) : undefined
    };
  }

  private calculateProductionScore(stats: any, position: string): number {
    switch (position) {
      case 'LB':
        const tacklesPerGame = (stats.totalTackles || 0) / Math.max(stats.gamesPlayed, 1);
        const soloPercentage = (stats.soloTackles || 0) / Math.max(stats.totalTackles || 1, 1);
        return Math.min(100, Math.round((tacklesPerGame / 11) * 92 + (soloPercentage * 20)));
      
      case 'QB':
        const completionRate = (stats.completions || 0) / Math.max(stats.attempts || 1, 1);
        const yardsPerAttempt = (stats.passingYards || 0) / Math.max(stats.attempts || 1, 1);
        const tdToIntRatio = (stats.passingTDs || 0) / Math.max(stats.interceptions || 1, 1);
        return Math.min(100, Math.round(
          (completionRate * 30) + 
          (Math.min(yardsPerAttempt, 12) * 5) + 
          (Math.min(tdToIntRatio, 5) * 10)
        ));
      
      default:
        return 65 + Math.round(Math.random() * 30);
    }
  }

  private calculateEfficiencyRating(stats: any, position: string): number {
    return 60 + Math.round(Math.random() * 35);
  }

  private calculatePositionalImpact(position: string): number {
    const positionValues = {
      'QB': 95, 'LB': 80, 'WR': 75, 'RB': 70,
      'DB': 75, 'OL': 85, 'DL': 80, 'TE': 70
    };
    return positionValues[position as keyof typeof positionValues] || 70;
  }

  private generateRecommendation(valuePerDollar: number): PlayerEvaluation['recommendation'] {
    if (valuePerDollar > 5.0) return 'IMMEDIATE_PURSUIT';
    if (valuePerDollar > 3.0) return 'STRONG_INTEREST';
    if (valuePerDollar > 2.0) return 'MODERATE_INTEREST';
    return 'LOW_PRIORITY';
  }

  private getBaronComparison(player: Player): BaronHopsonComparison {
    return {
      similarity: 75,
      playerValueRatio: player.evaluation?.valuePerDollar || 0,
      baronBaselineRatio: 6.57,
      advantageMultiplier: (player.evaluation?.valuePerDollar || 0) / 6.57,
      recommendation: 'MODERATE_INTEREST'
    };
  }

  private calculateBaronSimilarity(playerStats: any, baronBaseline: any): number {
    return 75; // Mock similarity score
  }

  private calculateCompetitiveAdvantage(players: Player[]): number {
    return players.reduce((sum, p) => sum + (p.evaluation?.adjustedValue || 0), 0) / players.length;
  }
}

// Budget tier configurations
const budgetTierConfigs = {
  'Group5_Low': { totalBudget: 800000, maxIndividual: 25000, fcsTransferBonus: 3.5 },
  'Group5_High': { totalBudget: 1300000, maxIndividual: 45000, fcsTransferBonus: 3.0 },
  'Power4_Standard': { totalBudget: 8500000, maxIndividual: 200000, fcsTransferBonus: 1.5 },
  'Power4_Elite': { totalBudget: 20500000, maxIndividual: 500000, fcsTransferBonus: 1.0 }
};

// Mock data for development
const mockTransferPortalPlayers: Player[] = [
  {
    id: '1',
    name: 'Marcus Thompson',
    position: 'LB',
    previousSchool: 'Tennessee State',
    conference: 'OVC',
    transferFrom: 'FCS',
    marketValue: 18000,
    daysInPortal: 12,
    portalEntryDate: '2024-12-01',
    stats: {
      gamesPlayed: 12,
      totalTackles: 89,
      soloTackles: 52,
      assistedTackles: 37
    }
  },
  {
    id: '2',
    name: 'DeAndre Williams',
    position: 'QB',
    previousSchool: 'Alabama State',
    conference: 'SWAC',
    transferFrom: 'FCS',
    marketValue: 35000,
    daysInPortal: 8,
    portalEntryDate: '2024-12-05',
    stats: {
      gamesPlayed: 11,
      passingYards: 2845,
      completions: 198,
      attempts: 312,
      passingTDs: 22,
      interceptions: 8
    }
  },
  {
    id: '3',
    name: 'Jaylen Davis',
    position: 'WR',
    previousSchool: 'Middle Tennessee',
    conference: 'Conference USA',
    transferFrom: 'Group5',
    marketValue: 65000,
    daysInPortal: 15,
    portalEntryDate: '2024-11-28',
    stats: {
      gamesPlayed: 12,
      receptions: 67,
      receivingYards: 892,
      receivingTDs: 8
    }
  }
];

const mockPriceAlerts: PriceAlert[] = [
  {
    id: '1',
    playerId: '1',
    playerName: 'Marcus Thompson',
    position: 'LB',
    oldPrice: 25000,
    newPrice: 18000,
    percentageChange: -28,
    alertType: 'URGENT_ACTION',
    timestamp: '2024-12-13T10:30:00Z',
    recommendation: 'Immediate pursuit - Baron Hopson profile match'
  }
];

const mockCompetitiveIntelligence: CompetitiveIntelligence = {
  rivalActivity: [
    {
      school: 'Alabama',
      recentSignings: 3,
      estimatedSpent: 17200000,
      estimatedRemaining: 3300000,
      targetPositions: ['QB', 'WR', 'DB'],
      activityLevel: 'High'
    }
  ],
  marketTrends: {
    positionInflation: {
      'QB': 15.2,
      'LB': 8.7,
      'WR': 12.3
    },
    hotPositions: ['QB', 'WR', 'DB'],
    undervaluedSegments: ['FCS Transfers', 'Group5 Interior OL'],
    averagePriceMovement: 8.4
  },
  opportunityWindows: [],
  recommendedActions: []
};

const mockDashboardData = {
  overview: {
    total_athletes: 1847,
    total_evaluations: 3245,
    total_optimizations: 67,
    baron_hopson_prospects: 23
  },
  position_breakdown: [
    { position: 'LB', count: 312, avg_market_value: 35000 },
    { position: 'QB', count: 89, avg_market_value: 125000 }
  ],
  transfer_breakdown: [
    { transfer_from: 'FCS', count: 523, avg_market_value: 28000 },
    { transfer_from: 'Group5', count: 789, avg_market_value: 52000 }
  ],
  baron_hopson_prospects: [],
  budget_utilization: []
};

const mockNILOpportunities = [
  {
    id: 1,
    title: 'Local Restaurant Campaign',
    brand_name: 'Sports Grill',
    opportunity_type: 'SOCIAL_POST',
    compensation_amount: 500,
    duration_months: 6
  }
];

// Create and export singleton instance
export const moneyballApi = new MoneyballAPI();

// Export the class for testing
export { MoneyballAPI };

// Default export
export default moneyballApi;