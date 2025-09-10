import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  AlertTriangle,
  Clock,
  Award,
  BarChart3
} from 'lucide-react';

interface BudgetAllocation {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
}

interface BudgetTierConfig {
  name: string;
  totalBudget: number;
  maxIndividual: number;
  strategy: string;
  description: string;
  fcsBonus: string;
}

const BudgetManagement: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string>('Group5_High');
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(false);

  const budgetTiers: Record<string, BudgetTierConfig> = {
    Group5_Low: {
      name: 'Group 5 - Low Tier',
      totalBudget: 800000,
      maxIndividual: 25000,
      strategy: 'Value Maximization',
      description: 'MAC, CUSA, Sun Belt lower tier programs',
      fcsBonus: '3.5x'
    },
    Group5_High: {
      name: 'Group 5 - High Tier',
      totalBudget: 1300000,
      maxIndividual: 45000,
      strategy: 'Balanced Value Approach',
      description: 'Top Group5 programs like Kennesaw State',
      fcsBonus: '3.0x'
    },
    Power4_Standard: {
      name: 'Power 4 - Standard',
      totalBudget: 8500000,
      maxIndividual: 200000,
      strategy: 'Talent Acquisition Focus',
      description: 'Mid-tier Power conference programs',
      fcsBonus: '1.5x'
    },
    Power4_Elite: {
      name: 'Power 4 - Elite',
      totalBudget: 20500000,
      maxIndividual: 500000,
      strategy: 'Elite Talent Concentration',
      description: 'Top 25 programs (House Settlement Cap)',
      fcsBonus: '1.0x'
    }
  };

  useEffect(() => {
    generateSampleAllocations();
  }, [selectedTier]);

  const generateSampleAllocations = () => {
    const tier = budgetTiers[selectedTier];
    const sampleAllocations: BudgetAllocation[] = [
      {
        category: 'Quarterback',
        allocated: tier.totalBudget * 0.25,
        spent: tier.totalBudget * 0.18,
        remaining: tier.totalBudget * 0.07,
        utilization: 72
      },
      {
        category: 'Skill Positions',
        allocated: tier.totalBudget * 0.35,
        spent: tier.totalBudget * 0.28,
        remaining: tier.totalBudget * 0.07,
        utilization: 80
      },
      {
        category: 'Offensive Line',
        allocated: tier.totalBudget * 0.15,
        spent: tier.totalBudget * 0.12,
        remaining: tier.totalBudget * 0.03,
        utilization: 80
      },
      {
        category: 'Defense',
        allocated: tier.totalBudget * 0.20,
        spent: tier.totalBudget * 0.15,
        remaining: tier.totalBudget * 0.05,
        utilization: 75
      },
      {
        category: 'Special Teams',
        allocated: tier.totalBudget * 0.05,
        spent: tier.totalBudget * 0.03,
        remaining: tier.totalBudget * 0.02,
        utilization: 60
      }
    ];

    setAllocations(sampleAllocations);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTierColor = (tier: string, isSelected: boolean) => {
    const colors = {
      Group5_Low: isSelected ? 'border-green-500 bg-green-50' : 'border-green-200 hover:border-green-300',
      Group5_High: isSelected ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300',
      Power4_Standard: isSelected ? 'border-purple-500 bg-purple-50' : 'border-purple-200 hover:border-purple-300',
      Power4_Elite: isSelected ? 'border-red-500 bg-red-50' : 'border-red-200 hover:border-red-300'
    };
    return colors[tier as keyof typeof colors] || '';
  };

  const totalSpent = allocations.reduce((sum, alloc) => sum + alloc.spent, 0);
  const totalRemaining = allocations.reduce((sum, alloc) => sum + alloc.remaining, 0);
  const overallUtilization = (totalSpent / budgetTiers[selectedTier].totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Budget Tier Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Tier Management</CardTitle>
          <p className="text-sm text-gray-600">
            Manage NIL budget allocation and spending across different program tiers
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(budgetTiers).map(([tier, config]) => (
              <div
                key={tier}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${getTierColor(tier, selectedTier === tier)}`}
                onClick={() => setSelectedTier(tier)}
              >
                <h3 className="font-medium text-gray-900 mb-1">{config.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{config.description}</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Budget:</span>
                    <span className="font-bold text-blue-600">
                      ${(config.totalBudget / 1000000).toFixed(1)}M
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetTiers[selectedTier].totalBudget)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRemaining)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilization</p>
              <p className="text-2xl font-bold text-gray-900">{overallUtilization.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baron Hopson Value Strategy */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Award className="w-5 h-5" />
            Baron Hopson Value Strategy for {budgetTiers[selectedTier].name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-emerald-700">Budget Allocation Strategy</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total Available:</span>
                  <span className="font-bold">{formatCurrency(budgetTiers[selectedTier].totalBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>FCS Transfer Multiplier:</span>
                  <span className="font-bold text-emerald-600">{budgetTiers[selectedTier].fcsBonus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Individual Cap:</span>
                  <span className="font-bold">{formatCurrency(budgetTiers[selectedTier].maxIndividual)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-emerald-700">Value Optimization</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Target Value/$ Ratio:</span>
                  <span className="font-bold">
                    {selectedTier.includes('Group5') ? '4.0+' : '2.0+'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>FCS Transfer Priority:</span>
                  <span className="font-bold">
                    {selectedTier.includes('Group5') ? 'Very High' : 'Medium'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Roster Depth Target:</span>
                  <span className="font-bold">22-25 players</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-emerald-700">Expected Outcomes</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Strength per $1M:</span>
                  <span className="font-bold">
                    {selectedTier === 'Group5_Low' ? '1,800+' :
                     selectedTier === 'Group5_High' ? '1,600+' :
                     selectedTier === 'Power4_Standard' ? '600+' : '400+'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Competitive Balance:</span>
                  <span className="font-bold text-emerald-600">
                    {selectedTier.includes('Group5') ? 'High Efficiency' : 'Elite Talent'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ROI Category:</span>
                  <span className="font-bold">
                    {budgetTiers[selectedTier].strategy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Allocation by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocation by Position Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allocations.map((allocation, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{allocation.category}</h4>
                  <span className={`text-sm px-2 py-1 rounded ${
                    allocation.utilization >= 90 ? 'bg-red-100 text-red-800' :
                    allocation.utilization >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {allocation.utilization}% utilized
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700">
                      {formatCurrency(allocation.allocated)}
                    </div>
                    <div className="text-xs text-blue-600">Allocated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-700">
                      {formatCurrency(allocation.spent)}
                    </div>
                    <div className="text-xs text-red-600">Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-700">
                      {formatCurrency(allocation.remaining)}
                    </div>
                    <div className="text-xs text-green-600">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-700">
                      {allocation.utilization}%
                    </div>
                    <div className="text-xs text-purple-600">Utilization</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      allocation.utilization >= 90 ? 'bg-red-500' :
                      allocation.utilization >= 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(allocation.utilization, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Budget Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedTier.includes('Group5') ? (
              <>
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Award className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-emerald-800">Focus on FCS Transfers</h5>
                    <p className="text-sm text-emerald-700">
                      Prioritize FCS transfers with {budgetTiers[selectedTier].fcsBonus} value multiplier. 
                      Target linebackers and skill positions with production scores above 80.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-800">Maximize Value per Dollar</h5>
                    <p className="text-sm text-blue-700">
                      Target players with value/dollar ratios above 4.0. Consider Group5 transfers 
                      from lower conferences with strong production metrics.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-purple-800">Elite Talent Focus</h5>
                    <p className="text-sm text-purple-700">
                      With higher budget capacity, pursue top-tier transfers from Power4 schools. 
                      Focus on immediate impact players and position group leaders.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <DollarSign className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-orange-800">Strategic Spending</h5>
                    <p className="text-sm text-orange-700">
                      Allocate larger portions to QB and key skill positions. Use remaining budget 
                      for depth pieces and special teams contributors.
                    </p>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800">Budget Utilization Alert</h5>
                <p className="text-sm text-yellow-700">
                  Current utilization at {overallUtilization.toFixed(1)}%. 
                  {overallUtilization < 70 ? 
                    'Consider accelerating recruitment to maximize budget efficiency.' :
                    overallUtilization > 85 ?
                    'Monitor remaining budget closely to avoid overruns.' :
                    'Budget utilization is within optimal range.'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetManagement;