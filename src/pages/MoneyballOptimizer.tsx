import React, { useState } from 'react';
import { useOptimizeRoster } from '../hooks/useMoneyballData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BudgetTier, OptimizationConstraints } from '../types/moneyball';
import { TrendingUp, Users, DollarSign, Target, Clock, Zap } from 'lucide-react';
import BudgetTierSelector from '../components/moneyball/BudgetTierSelector';
import OptimizationResults from '../components/moneyball/OptimizationResults';
import PositionRequirements from '../components/moneyball/PositionRequirements';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MoneyballOptimizer: React.FC = () => {
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Group5_High');
  const [positionRequirements, setPositionRequirements] = useState({
    QB: 2,
    RB: 3,
    WR: 5,
    TE: 2,
    OL: 5,
    DL: 4,
    LB: 4,
    DB: 5
  });

  const optimizeMutation = useOptimizeRoster();

  const budgetTierConfigs = {
    'Group5_Low': { 
      budget: 800000, 
      label: 'Group 5 - Low', 
      strategy: 'Value Maximization',
      description: 'MAC, CUSA lower tier programs',
      maxIndividual: 25000,
      fcsBonus: '3.5x'
    },
    'Group5_High': { 
      budget: 1300000, 
      label: 'Group 5 - High', 
      strategy: 'Balanced Value',
      description: 'Top Group5 programs like KSU',
      maxIndividual: 45000,
      fcsBonus: '3.0x'
    },
    'Power4_Standard': { 
      budget: 8500000, 
      label: 'Power 4 - Standard', 
      strategy: 'Talent Acquisition',
      description: 'Mid-tier Power conferences',
      maxIndividual: 200000,
      fcsBonus: '1.5x'
    },
    'Power4_Elite': { 
      budget: 20500000, 
      label: 'Power 4 - Elite', 
      strategy: 'Elite Talent Focus',
      description: 'Top 25 programs (House Cap)',
      maxIndividual: 500000,
      fcsBonus: '1.0x'
    }
  };

  const handleOptimize = () => {
    const constraints: OptimizationConstraints = {
      totalBudget: budgetTierConfigs[budgetTier].budget,
      positionRequirements,
      maxIndividualSpend: budgetTierConfigs[budgetTier].maxIndividual,
      chemistryWeight: 0.1
    };

    optimizeMutation.mutate({ budgetTier, constraints });
  };

  return (
    <div className="space-y-6">
      {/* Budget Tier Selection */}
      <BudgetTierSelector
        selectedTier={budgetTier}
        onTierChange={setBudgetTier}
        configs={budgetTierConfigs}
      />

      {/* Baron Hopson Methodology Display */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Target className="w-5 h-5" />
            Baron Hopson Methodology: Applied Moneyball for Football
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-emerald-700">Performance Metrics</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Production Formula:</span>
                  <span className="font-medium">(Tackles ÷ 11) × 92</span>
                </div>
                <div className="flex justify-between">
                  <span>Solo Tackle Bonus:</span>
                  <span className="font-medium">+20 points at 60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Conference Scaling:</span>
                  <span className="font-medium">FCS → Group5 1.0x</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-emerald-700">Value Calculation</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>KSU Total Value:</span>
                  <span className="font-medium">6.57 per $1000</span>
                </div>
                <div className="flex justify-between">
                  <span>SEC Comparable:</span>
                  <span className="font-medium">0.58 per $1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Value Advantage:</span>
                  <span className="font-bold text-emerald-600">11.3x Superior</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-emerald-700">FCS Transfer Multipliers</h4>
              <div className="text-sm space-y-1">
                {Object.entries(budgetTierConfigs).map(([tier, config]) => (
                  <div key={tier} className="flex justify-between">
                    <span>{config.label}:</span>
                    <span className={`font-medium ${tier === budgetTier ? 'text-emerald-600 font-bold' : ''}`}>
                      {config.fcsBonus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
            <p className="text-sm text-emerald-800">
              <strong>Current Strategy ({budgetTierConfigs[budgetTier].strategy}):</strong> {' '}
              {budgetTier.includes('Group5') 
                ? 'Focus on FCS transfers and undervalued Group5 players with high production scores'
                : 'Balance elite talent acquisition with value optimization across all positions'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Position Requirements */}
      <PositionRequirements
        requirements={positionRequirements}
        onRequirementsChange={setPositionRequirements}
      />

      {/* Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Roster Optimization Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                ${(budgetTierConfigs[budgetTier].budget / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-blue-600">Total Budget</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {Object.values(positionRequirements).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm text-green-600">Target Players</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                ${(budgetTierConfigs[budgetTier].maxIndividual / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-purple-600">Max Individual</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleOptimize}
              disabled={optimizeMutation.isPending}
              size="lg"
              className="px-8 py-3"
            >
              {optimizeMutation.isPending ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Optimizing Roster...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  Optimize Roster
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimizeMutation.isPending && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <div className="ml-4">
              <p className="text-lg font-medium">Running Moneyball Optimization...</p>
              <p className="text-sm text-gray-600">Analyzing {budgetTierConfigs[budgetTier].label} tier strategy</p>
            </div>
          </CardContent>
        </Card>
      )}

      {optimizeMutation.data && (
        <OptimizationResults
          results={optimizeMutation.data}
          budgetTier={budgetTier}
          tierConfig={budgetTierConfigs[budgetTier]}
        />
      )}

      {optimizeMutation.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">
              Optimization failed: {optimizeMutation.error.message}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MoneyballOptimizer;