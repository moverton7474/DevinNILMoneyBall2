// Enhanced Moneyball Platform Type Definitions
export interface PlayerStats {
  totalTackles?: number;
  soloTackles?: number;
  assistedTackles?: number;
  passingYards?: number;
  rushingYards?: number;
  receivingYards?: number;
  receptions?: number;
  gamesPlayed: number;
  completions?: number;
  attempts?: number;
  passingTDs?: number;
  interceptions?: number;
  rushingTDs?: number;
  receivingTDs?: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  previousSchool: string;
  conference: string;
  transferFrom: 'FCS' | 'Group5' | 'Power4' | 'JUCO';
  stats: PlayerStats;
  marketValue: number;
  portalEntryDate: string;
  daysInPortal: number;
  evaluation?: PlayerEvaluation;
}

export interface PlayerEvaluation {
  productionScore: number;
  efficiencyRating: number;
  positionalImpact: number;
  adjustedValue: number;
  valuePerDollar: number;
  transferMultiplier: number;
  recommendation: 'IMMEDIATE_PURSUIT' | 'STRONG_INTEREST' | 'MODERATE_INTEREST' | 'LOW_PRIORITY';
  baronHopsonComparison?: BaronHopsonComparison;
}

export interface BaronHopsonComparison {
  similarity: number;
  playerValueRatio: number;
  baronBaselineRatio: number;
  advantageMultiplier: number;
  recommendation: 'STRONG_RECOMMENDATION' | 'MODERATE_INTEREST' | 'ANALYZE_FURTHER';
}

export type BudgetTier = 'Group5_Low' | 'Group5_High' | 'Power4_Standard' | 'Power4_Elite';

export interface BudgetTierConfig {
  name: string;
  totalBudget: number;
  maxIndividual: number;
  strategy: string;
  fcsTransferBonus: number;
  description: string;
}


export interface OptimizationResults {
  success: boolean;
  selectedPlayers: Player[];
  totalCost: number;
  totalValue: number;
  budgetUtilization: number;
  competitiveAdvantageScore: number;
  budgetEfficiency: number;
  rosterStrength: number;
  method: string;
  optimizationTime: number;
}

export interface BaronHopsonAnalysis {
  playerName: string;
  playerValue: number;
  playerProductionScore: number;
  playerValuePerDollar: number;
  comparableName: string;
  comparableValue: number;
  comparableProductionScore: number;
  comparableValuePerDollar: number;
  valueAdvantage: number;
  costSavings: number;
  productionComparison: number;
  baronHopsonSimilarity: number;
  recommendation: string;
}

export type OptimizationResult = OptimizationResults;

export interface OptimizationConstraints {
  totalBudget: number;
  positionRequirements: Record<string, number>;
  maxIndividualSpend: number;
  chemistryWeight?: number;
}

export interface MarketOpportunityMatrix {
  highValueLowCost: Player[];
  highValueHighCost: Player[];
  lowValueLowCost: Player[];
  lowValueHighCost: Player[];
}

export interface PriceAlert {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  oldPrice?: number;
  newPrice: number;
  percentageChange?: number;
  alertType: 'URGENT_ACTION' | 'PRICE_DROP' | 'HOT_MARKET' | 'OPPORTUNITY';
  timestamp: string;
  recommendation: string;
}

export interface CompetitiveIntelligence {
  rivalActivity: Array<{
    school: string;
    recentSignings: number;
    estimatedSpent: number;
    estimatedRemaining: number;
    targetPositions: string[];
    activityLevel: string;
  }>;
  marketTrends: {
    positionInflation: Record<string, number>;
    hotPositions: string[];
    undervaluedSegments: string[];
    averagePriceMovement: number;
  };
  opportunityWindows: Array<{
    description: string;
    timeframe: string;
    urgency: string;
    estimatedSavings: number;
    actionRequired: string;
  }>;
  recommendedActions: string[];
}
