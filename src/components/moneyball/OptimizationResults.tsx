import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { OptimizationResults as Results, BudgetTier } from '../../types/moneyball';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Target, 
  Award,
  CheckCircle 
} from 'lucide-react';

interface OptimizationResultsProps {
  results: Results;
  budgetTier: BudgetTier;
  tierConfig: {
    budget: number;
    label: string;
    strategy: string;
    fcsBonus: string;
  };
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  results,
  budgetTier,
  tierConfig
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getOptimizationGrade = (efficiency: number) => {
    if (efficiency >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (efficiency >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (efficiency >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (efficiency >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  };

  const grade = getOptimizationGrade(results.budgetEfficiency);

  return (
    <div className="space-y-6">
      {/* Optimization Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Optimization Complete - {tierConfig.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{results.selectedPlayers.length}</div>
              <div className="text-sm text-green-600">Players Selected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{formatCurrency(results.totalCost)}</div>
              <div className="text-sm text-green-600">Total Investment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{(results.budgetUtilization * 100).toFixed(1)}%</div>
              <div className="text-sm text-green-600">Budget Utilized</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${grade.color}`}>{grade.grade}</div>
              <div className="text-sm text-green-600">Efficiency Grade</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Competitive Advantage</span>
              </div>
              <div className="text-xl font-bold text-blue-700">{results.competitiveAdvantageScore.toFixed(1)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Budget Efficiency</span>
              </div>
              <div className="text-xl font-bold text-green-700">{results.budgetEfficiency.toFixed(1)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Optimization Time</span>
              </div>
              <div className="text-xl font-bold text-purple-700">{results.optimizationTime.toFixed(2)}s</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Optimized Roster ({results.selectedPlayers.length} players)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.selectedPlayers.slice(0, 10).map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{player.name}</h4>
                      <p className="text-sm text-gray-600">
                        {player.position} • {player.previousSchool} 
                        {player.transferFrom === 'FCS' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            FCS Transfer {tierConfig.fcsBonus}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(player.marketValue)}</div>
                  {player.evaluation && (
                    <div className="text-sm text-blue-600">
                      Value/$ Ratio: {player.evaluation.valuePerDollar.toFixed(1)}
                    </div>
                  )}
                </div>
                
                <div className="ml-4 text-center">
                  {player.evaluation && (
                    <>
                      <div className="text-lg font-bold text-green-600">
                        {player.evaluation.productionScore}/100
                      </div>
                      <div className="text-xs text-gray-500">Production</div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {results.selectedPlayers.length > 10 && (
              <div className="text-center py-4">
                <span className="text-gray-500">
                  + {results.selectedPlayers.length - 10} more players
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Position Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Position Group Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const positionStats = results.selectedPlayers.reduce((acc, player) => {
              if (!acc[player.position]) {
                acc[player.position] = { count: 0, totalCost: 0, totalValue: 0 };
              }
              acc[player.position].count += 1;
              acc[player.position].totalCost += player.marketValue;
              acc[player.position].totalValue += player.evaluation?.adjustedValue || 0;
              return acc;
            }, {} as Record<string, { count: number; totalCost: number; totalValue: number }>);

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(positionStats).map(([position, stats]) => (
                  <div key={position} className="p-4 border rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">{position}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Players:</span>
                        <span className="font-medium">{stats.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-medium">{formatCurrency(stats.totalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Value:</span>
                        <span className="font-medium">{(stats.totalValue / stats.count).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost/Player:</span>
                        <span className="font-medium">{formatCurrency(stats.totalCost / stats.count)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Baron Hopson Analysis */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Award className="w-5 h-5" />
            Baron Hopson Value Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const fcsTransfers = results.selectedPlayers.filter(p => p.transferFrom === 'FCS');
            const highValuePlayers = results.selectedPlayers.filter(p => 
              p.evaluation && p.evaluation.valuePerDollar > 4.0
            );
            const totalValuePerDollar = results.selectedPlayers.reduce((sum, p) => 
              sum + (p.evaluation?.valuePerDollar || 0), 0
            ) / results.selectedPlayers.length;

            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-emerald-100 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-700">{fcsTransfers.length}</div>
                  <div className="text-sm text-emerald-600">FCS Transfers</div>
                  <div className="text-xs text-emerald-500 mt-1">{tierConfig.fcsBonus} multiplier</div>
                </div>
                <div className="text-center p-3 bg-emerald-100 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-700">{highValuePlayers.length}</div>
                  <div className="text-sm text-emerald-600">Baron-Level Values</div>
                  <div className="text-xs text-emerald-500 mt-1">&gt;4.0 value/dollar</div>
                </div>
                <div className="text-center p-3 bg-emerald-100 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-700">{totalValuePerDollar.toFixed(1)}</div>
                  <div className="text-sm text-emerald-600">Avg Value/Dollar</div>
                  <div className="text-xs text-emerald-500 mt-1">Baron baseline: 6.57</div>
                </div>
                <div className="text-center p-3 bg-emerald-100 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-700">
                    ${Math.round((results.totalValue / results.selectedPlayers.length) * 1000).toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-600">Value per $1M</div>
                  <div className="text-xs text-emerald-500 mt-1">Competitive strength</div>
                </div>
              </div>
            );
          })()}
          
          <div className="mt-4 p-3 bg-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800">
              <strong>Analysis:</strong> This optimized roster achieves{' '}
              <span className="font-bold">
                {((results.totalValue / results.selectedPlayers.length) / (tierConfig.budget / 1000000) * 1000).toFixed(0)} 
                strength points per $1M
              </span>
              {budgetTier.includes('Group5') && ', following the Baron Hopson model of extracting maximum value from undervalued FCS transfers and Group5 players'}
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizationResults;