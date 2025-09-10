import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BudgetTier } from '../../types/moneyball';
import { TrendingUp, DollarSign, Users, Zap } from 'lucide-react';

interface BudgetTierConfig {
  budget: number;
  label: string;
  strategy: string;
  description: string;
  maxIndividual: number;
  fcsBonus: string;
}

interface BudgetTierSelectorProps {
  selectedTier: BudgetTier;
  onTierChange: (tier: BudgetTier) => void;
  configs: Record<BudgetTier, BudgetTierConfig>;
}

const BudgetTierSelector: React.FC<BudgetTierSelectorProps> = ({
  selectedTier,
  onTierChange,
  configs
}) => {
  const getTierColor = (tier: BudgetTier, isSelected: boolean) => {
    const colors = {
      'Group5_Low': isSelected ? 'border-green-500 bg-green-50' : 'border-green-200 hover:border-green-300',
      'Group5_High': isSelected ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300',
      'Power4_Standard': isSelected ? 'border-purple-500 bg-purple-50' : 'border-purple-200 hover:border-purple-300',
      'Power4_Elite': isSelected ? 'border-red-500 bg-red-50' : 'border-red-200 hover:border-red-300'
    };
    return colors[tier];
  };

  const getTierIcon = (tier: BudgetTier) => {
    const icons = {
      'Group5_Low': Users,
      'Group5_High': TrendingUp,
      'Power4_Standard': DollarSign,
      'Power4_Elite': Zap
    };
    return icons[tier];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Tier Configuration</CardTitle>
        <p className="text-sm text-gray-600">
          Select your program's budget tier to optimize roster construction strategy
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(configs).map(([tier, config]) => {
            const isSelected = selectedTier === tier;
            const Icon = getTierIcon(tier as BudgetTier);
            
            return (
              <div
                key={tier}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${getTierColor(tier as BudgetTier, isSelected)}`}
                onClick={() => onTierChange(tier as BudgetTier)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-current' : 'text-gray-500'}`} />
                  {isSelected && (
                    <div className="w-3 h-3 bg-current rounded-full" />
                  )}
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">{config.label}</h3>
                <p className="text-xs text-gray-600 mb-2">{config.description}</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-bold text-blue-600">
                      ${(config.budget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Individual:</span>
                    <span className="font-medium">
                      ${(config.maxIndividual / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">FCS Bonus:</span>
                    <span className="font-medium text-green-600">{config.fcsBonus}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-700">{config.strategy}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetTierSelector;