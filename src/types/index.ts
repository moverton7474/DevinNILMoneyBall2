// Core type definitions for NIL Moneyball Platform

// Athlete and Player Types
export interface Athlete {
  id: number;
  name: string;
  position: string;
  height: string;
  weight: number;
  hometown: string;
  home_state: string;
  previous_school: string;
  gpa: number;
  years_eligibility_remaining: number;
  market_value?: number;
  estimated_nil_value?: number;
  baron_hopson_score?: number;
  created_at?: string;
  import_status?: string;
}

export interface TransferPortalPlayer extends Athlete {
  days_in_portal: number;
  portal_entry_date: string;
  transfer_from: string;
  committed_to?: string;
  conference?: string;
}

// Player Statistics
export interface PlayerStats {
  gamesPlayed: number;
  totalTackles?: number;
  soloTackles?: number;
  assistedTackles?: number;
  passingYards?: number;
  completions?: number;
  attempts?: number;
  passingTDs?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receivingYards?: number;
  receptions?: number;
  receivingTDs?: number;
}

// Evaluation Types
export interface PlayerEvaluation {
  id?: number;
  athlete_id?: number;
  budget_tier?: string;
  productionScore: number;
  efficiencyRating: number;
  positionalImpact: number;
  adjustedValue: number;
  valuePerDollar: number;
  transferMultiplier: number;
  baronHopsonSimilarity: number;
  marketabilityScore?: number;
  nilRoiProjection?: number;
  confidenceLevel?: number;
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

// Budget and Optimization Types
export type BudgetTier = 'Group5_Low' | 'Group5_High' | 'Power4_Standard' | 'Power4_Elite';

export interface OptimizationConstraints {
  totalBudget: number;
  positionRequirements: Record<string, number>;
  maxIndividualSpend: number;
  chemistryWeight?: number;
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

// Market Intelligence Types
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

// NIL Types
export interface NILOpportunity {
  id: number;
  title: string;
  brand_name: string;
  opportunity_type: string;
  compensation_amount: number;
  duration_months: number;
  position_requirements?: string[];
  follower_requirement?: number;
  geographic_requirements?: string[];
  academic_requirements?: number;
  applications_count?: number;
  max_participants?: number;
  application_deadline?: string;
}

export interface NILOpportunityMatch {
  opportunity_id: number;
  opportunity_title: string;
  brand_name: string;
  compensation_amount: number;
  matching_athletes: Array<{
    athlete_id: number;
    name: string;
    position: string;
    match_score: number;
    marketability_score: number;
    total_followers: number;
    gpa?: number;
    estimated_nil_value: number;
  }>;
  total_matches: number;
}

// Upload and Session Types
export interface UploadSession {
  id: string;
  filename: string;
  uploaded_at: string;
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  status: 'processing' | 'completed' | 'failed';
  players?: any[];
}

// Re-export from moneyball types for compatibility
export type Player = TransferPortalPlayer;
