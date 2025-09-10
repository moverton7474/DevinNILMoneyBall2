import type { 
  Player, 
  BudgetTierConfig, 
  OptimizationResults,
  MarketOpportunityMatrix,
  BaronHopsonAnalysis,
  BudgetTier 
} from '../types/moneyball';
import type { PlayerEvaluation } from '../types/index';

export class MoneyballEngine {
  private budgetTierConfigs: Record<BudgetTier, BudgetTierConfig> = {
    'Group5_Low': {
      name: 'Group 5 - Low Tier',
      totalBudget: 800000,
      maxIndividual: 25000,
      strategy: 'Value Maximization',
      fcsTransferBonus: 3.5,
      description: 'MAC, CUSA, Sun Belt lower tier programs'
    },
    'Group5_High': {
      name: 'Group 5 - High Tier', 
      totalBudget: 1300000,
      maxIndividual: 45000,
      strategy: 'Balanced Value Approach',
      fcsTransferBonus: 3.0,
      description: 'Top Group5 programs like Kennesaw State'
    },
    'Power4_Standard': {
      name: 'Power 4 - Standard',
      totalBudget: 8500000,
      maxIndividual: 200000,
      strategy: 'Talent Acquisition Focus',
      fcsTransferBonus: 1.5,
      description: 'Mid-tier Power conference programs'
    },
    'Power4_Elite': {
      name: 'Power 4 - Elite',
      totalBudget: 20500000,
      maxIndividual: 500000,
      strategy: 'Elite Talent Concentration',
      fcsTransferBonus: 1.0,
      description: 'Top 25 programs (House Settlement Cap)'
    }
  };

  private baronHopsonBaseline = {
    totalTackles: 11,
    soloTackles: 6,
    productionScore: 92,
    nilValue: 15000,
    comparableSecValue: 165000,
    valuePerDollar: 6.57
  };

  getBudgetTierConfig(tier: BudgetTier): BudgetTierConfig {
    return this.budgetTierConfigs[tier];
  }

  calculateProductionScore(player: Player): number {
    const { stats, position, conference } = player;
    
    switch (position) {
      case 'LB':
        // Baron Hopson methodology: 11 tackles = 92/100 score
        const tacklesPerGame = (stats.totalTackles || 0) / Math.max(stats.gamesPlayed, 1);
        const soloPercentage = (stats.soloTackles || 0) / Math.max(stats.totalTackles || 1, 1);
        
        const baseScore = Math.min(100, (tacklesPerGame * 8) + (soloPercentage * 20));
        const competitionMultiplier = this.getCompetitionMultiplier(conference);
        
        return Math.round(baseScore * competitionMultiplier);

      case 'QB':
        const completionRate = (stats.completions || 0) / Math.max(stats.attempts || 1, 1);
        const yardsPerAttempt = (stats.passingYards || 0) / Math.max(stats.attempts || 1, 1);
        const tdToIntRatio = (stats.passingTDs || 0) / Math.max(stats.interceptions || 1, 1);
        
        return Math.min(100, 
          (completionRate * 30) + 
          (Math.min(yardsPerAttempt, 12) * 5) + 
          (Math.min(tdToIntRatio, 5) * 10)
        );

      case 'RB':
        const rushingYardsPerGame = (stats.rushingYards || 0) / Math.max(stats.gamesPlayed, 1);
        return Math.min(100, rushingYardsPerGame * 0.1); // 1000 yards = 100 points

      case 'WR':
      case 'TE':
        const receptionsPerGame = (stats.receptions || 0) / Math.max(stats.gamesPlayed, 1);
        const receivingYards = stats.passingYards || 0; // Using as proxy for receiving yards
        return Math.min(100, (receptionsPerGame * 8) + (receivingYards * 0.05));

      default:
        return 50; // Default baseline
    }
  }

  calculateEfficiencyRating(player: Player): number {
    // Efficiency based on consistent performance and low turnover rate
    const { stats, position } = player;
    
    switch (position) {
      case 'QB':
        const completionRate = (stats.completions || 0) / Math.max(stats.attempts || 1, 1);
        const intRate = (stats.interceptions || 0) / Math.max(stats.attempts || 1, 1);
        return Math.min(100, (completionRate * 80) - (intRate * 200));
        
      case 'RB':
      case 'WR':
      case 'TE':
        // Consistent game-by-game performance
        return Math.min(100, 60 + (Math.random() * 30)); // Placeholder for consistency metric
        
      default:
        return 75; // Default efficiency
    }
  }

  calculatePositionalImpact(player: Player, budgetTier: BudgetTier): number {
    const { position } = player;
    const tierConfig = this.budgetTierConfigs[budgetTier];
    
    // Position importance varies by budget tier strategy
    const positionWeights = {
      'QB': tierConfig.strategy.includes('Elite') ? 95 : 85,
      'LB': 80,
      'WR': 75,
      'RB': 70,
      'DB': 75,
      'DL': 80,
      'OL': 85
    };
    
    return positionWeights[position as keyof typeof positionWeights] || 70;
  }

  evaluatePlayer(player: Player, budgetTier: BudgetTier): PlayerEvaluation {
    const productionScore = this.calculateProductionScore(player);
    const efficiencyRating = this.calculateEfficiencyRating(player);
    const positionalImpact = this.calculatePositionalImpact(player, budgetTier);
    
    // Apply tier-specific bonuses
    const tierConfig = this.budgetTierConfigs[budgetTier];
    let transferMultiplier = 1.0;
    
    if (player.transferFrom === 'FCS' && budgetTier.includes('Group5')) {
      transferMultiplier = tierConfig.fcsTransferBonus;
    }
    
    const adjustedValue = (productionScore + efficiencyRating + positionalImpact) * transferMultiplier;
    const valuePerDollar = adjustedValue / Math.max(player.marketValue / 1000, 0.1);
    
    const recommendation = this.generateRecommendation(valuePerDollar);
    const baronHopsonSimilarity = this.calculateBaronHopsonSimilarity(player, valuePerDollar);
    
    return {
      productionScore,
      efficiencyRating,
      positionalImpact,
      adjustedValue,
      valuePerDollar,
      transferMultiplier,
      recommendation,
      baronHopsonSimilarity
    };
  }

  private getCompetitionMultiplier(conference: string): number {
    const multipliers = {
      'SEC': 1.0,
      'Big Ten': 0.95,
      'Big 12': 0.92,
      'ACC': 0.90,
      'Pac-12': 0.88,
      'American': 0.85,
      'Conference USA': 0.82,
      'MAC': 0.80,
      'Sun Belt': 0.78,
      'FCS': 0.75
    };
    
    return multipliers[conference as keyof typeof multipliers] || 0.80;
  }

  private generateRecommendation(valuePerDollar: number): PlayerEvaluation['recommendation'] {
    if (valuePerDollar >= 5.0) return 'IMMEDIATE_PURSUIT';
    if (valuePerDollar >= 3.0) return 'STRONG_INTEREST';
    if (valuePerDollar >= 1.5) return 'MODERATE_INTEREST';
    return 'LOW_PRIORITY';
  }

  private calculateBaronHopsonSimilarity(player: Player, valuePerDollar: number): number {
    let similarity = 0;
    
    // Transfer type bonus (30 points)
    if (player.transferFrom === 'FCS') similarity += 30;
    
    // Position match (20 points)
    if (player.position === 'LB') similarity += 20;
    
    // Production similarity (20 points)
    const productionScore = this.calculateProductionScore(player);
    const productionDiff = Math.abs(productionScore - this.baronHopsonBaseline.productionScore);
    similarity += Math.max(0, 20 - productionDiff * 0.2);
    
    // Value per dollar ratio (25 points)
    const ratioSimilarity = Math.min(valuePerDollar / this.baronHopsonBaseline.valuePerDollar, 2.0) * 15;
    similarity += ratioSimilarity;
    
    // Market value range (15 points - Baron was low cost)
    if (player.marketValue < 30000) similarity += 15;
    
    return Math.min(similarity, 100);
  }

  optimizeRoster(
    availablePlayers: Player[],
    budgetTier: BudgetTier,
    positionRequirements: Record<string, number>
  ): OptimizationResults {
    const tierConfig = this.budgetTierConfigs[budgetTier];
    
    // Evaluate all players
    const evaluatedPlayers = availablePlayers
      .map(player => ({
        ...player,
        evaluation: this.evaluatePlayer(player, budgetTier)
      }))
      .filter(player => player.marketValue <= tierConfig.maxIndividual)
      .sort((a, b) => b.evaluation.valuePerDollar - a.evaluation.valuePerDollar);
    
    // Greedy optimization algorithm
    const selectedPlayers: (Player & { evaluation: PlayerEvaluation })[] = [];
    let remainingBudget = tierConfig.totalBudget;
    const positionCounts: Record<string, number> = {};
    
    // Initialize position counts
    Object.keys(positionRequirements).forEach(pos => {
      positionCounts[pos] = 0;
    });
    
    // First pass: meet minimum position requirements
    for (const position of Object.keys(positionRequirements)) {
      const positionPlayers = evaluatedPlayers.filter(p => 
        p.position === position && !selectedPlayers.includes(p)
      );
      
      const required = positionRequirements[position];
      let selected = 0;
      
      for (const player of positionPlayers) {
        if (selected < required && player.marketValue <= remainingBudget) {
          selectedPlayers.push(player);
          remainingBudget -= player.marketValue;
          positionCounts[position]++;
          selected++;
        }
      }
    }
    
    // Second pass: add remaining best value players
    const remainingPlayers = evaluatedPlayers.filter(p => !selectedPlayers.includes(p));
    
    for (const player of remainingPlayers) {
      if (player.marketValue <= remainingBudget) {
        selectedPlayers.push(player);
        remainingBudget -= player.marketValue;
        positionCounts[player.position] = (positionCounts[player.position] || 0) + 1;
      }
    }
    
    const totalCost = tierConfig.totalBudget - remainingBudget;
    const totalValue = selectedPlayers.reduce((sum, p) => sum + p.evaluation.adjustedValue, 0);
    const budgetUtilization = (totalCost / tierConfig.totalBudget) * 100;
    const competitiveAdvantageScore = this.calculateCompetitiveAdvantage(selectedPlayers, budgetTier);
    
    return {
      success: true,
      selectedPlayers,
      totalCost,
      totalValue,
      budgetUtilization,
      competitiveAdvantageScore,
      budgetEfficiency: totalValue / totalCost,
      rosterStrength: competitiveAdvantageScore,
      method: 'greedy_value_per_dollar',
      optimizationTime: Date.now() - Date.now()
    };
  }

  private calculateCompetitiveAdvantage(
    selectedPlayers: (Player & { evaluation: PlayerEvaluation })[], 
    budgetTier: BudgetTier
  ): number {
    const totalValue = selectedPlayers.reduce((sum, p) => sum + p.evaluation.adjustedValue, 0);
    const totalCost = selectedPlayers.reduce((sum, p) => sum + p.marketValue, 0);
    const avgValuePerDollar = totalValue / Math.max(totalCost / 1000, 1);
    
    // Competitive advantage based on exceeding tier benchmarks
    const benchmarks = {
      'Group5_Low': 4.0,
      'Group5_High': 3.5,
      'Power4_Standard': 2.0,
      'Power4_Elite': 1.0
    };
    
    const benchmark = benchmarks[budgetTier];
    return Math.min(100, (avgValuePerDollar / benchmark) * 50);
  }

  generateMarketOpportunityMatrix(players: Player[], budgetTier: BudgetTier): MarketOpportunityMatrix {
    const evaluatedPlayers = players.map(player => ({
      ...player,
      evaluation: this.evaluatePlayer(player, budgetTier),
      valuePerDollar: 0
    }));

    // Update valuePerDollar from evaluation
    evaluatedPlayers.forEach(player => {
      player.valuePerDollar = player.evaluation.valuePerDollar;
    });

    const matrix: MarketOpportunityMatrix = {
      highValueLowCost: [],
      highValueHighCost: [],
      lowValueLowCost: [],
      lowValueHighCost: []
    };

    const medianValue = this.calculateMedian(evaluatedPlayers.map(p => p.evaluation.adjustedValue));
    const medianCost = this.calculateMedian(evaluatedPlayers.map(p => p.marketValue));

    evaluatedPlayers.forEach(player => {
      const highValue = player.evaluation.adjustedValue >= medianValue;
      const highCost = player.marketValue >= medianCost;

      if (highValue && !highCost) {
        matrix.highValueLowCost.push(player);
      } else if (highValue && highCost) {
        matrix.highValueHighCost.push(player);
      } else if (!highValue && !highCost) {
        matrix.lowValueLowCost.push(player);
      } else {
        matrix.lowValueHighCost.push(player);
      }
    });

    // Sort each quadrant by market value
    Object.keys(matrix).forEach(key => {
      const quadrant = matrix[key as keyof MarketOpportunityMatrix];
      quadrant.sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
    });

    return matrix;
  }

  generateBaronHopsonAnalysis(player: Player, budgetTier: BudgetTier): BaronHopsonAnalysis {
    const evaluation = this.evaluatePlayer(player, budgetTier);
    
    // Mock comparable player for demonstration
    const mockComparable = {
      name: 'SEC Comparable LB',
      value: 165000,
      productionScore: 85,
      valuePerDollar: 0.58
    };
    
    return {
      playerName: player.name,
      playerValue: player.marketValue,
      playerProductionScore: evaluation.productionScore,
      playerValuePerDollar: evaluation.valuePerDollar,
      
      comparableName: mockComparable.name,
      comparableValue: mockComparable.value,
      comparableProductionScore: mockComparable.productionScore,
      comparableValuePerDollar: mockComparable.valuePerDollar,
      
      valueAdvantage: evaluation.valuePerDollar / mockComparable.valuePerDollar,
      costSavings: mockComparable.value - player.marketValue,
      productionComparison: evaluation.productionScore / mockComparable.productionScore,
      
      baronHopsonSimilarity: evaluation.baronHopsonSimilarity || 0,
      recommendation: evaluation.recommendation === 'IMMEDIATE_PURSUIT' 
        ? 'This player shows exceptional Baron Hopson-style value potential'
        : 'Monitor for value development opportunities'
    };
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }
}
