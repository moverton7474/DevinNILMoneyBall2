import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { MarketOpportunityMatrix as Matrix } from '../../types/moneyball';
import { TrendingUp, DollarSign, Target, AlertTriangle } from 'lucide-react';

interface MarketOpportunityMatrixProps {
  matrix: Matrix;
}

const MarketOpportunityMatrix: React.FC<MarketOpportunityMatrixProps> = ({ matrix }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Portal Market Opportunity Matrix</CardTitle>
        <p className="text-sm text-gray-600">
          Players categorized by value and cost to identify optimal opportunities
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 h-96">
          {/* High Value, Low Cost - Best Opportunities */}
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-green-800">Prime Targets</h3>
              <span className="text-sm text-green-600">({matrix.highValueLowCost.length})</span>
            </div>
            <p className="text-xs text-green-700 mb-3">High Value • Low Cost</p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {matrix.highValueLowCost.slice(0, 5).map((player, idx) => (
                <div key={player.id} className="bg-white p-3 rounded border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-gray-600">
                        {player.position} • {player.previousSchool}
                      </p>
                      {player.transferFrom === 'FCS' && (
                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          FCS Transfer 3.5x
                        </span>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(player.marketValue)}
                      </p>
                      {player.evaluation && (
                        <p className="text-xs text-gray-500">
                          Ratio: {player.evaluation.valuePerDollar.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {matrix.highValueLowCost.length > 5 && (
                <p className="text-xs text-center text-green-600 py-2">
                  +{matrix.highValueLowCost.length - 5} more opportunities
                </p>
              )}
            </div>
          </div>

          {/* High Value, High Cost - Elite Talent */}
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-800">Elite Talent</h3>
              <span className="text-sm text-blue-600">({matrix.highValueHighCost.length})</span>
            </div>
            <p className="text-xs text-blue-700 mb-3">High Value • High Cost</p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {matrix.highValueHighCost.slice(0, 5).map((player, idx) => (
                <div key={player.id} className="bg-white p-3 rounded border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-gray-600">
                        {player.position} • {player.previousSchool}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-blue-600">
                        {formatCurrency(player.marketValue)}
                      </p>
                      {player.evaluation && (
                        <p className="text-xs text-gray-500">
                          Ratio: {player.evaluation.valuePerDollar.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {matrix.highValueHighCost.length > 5 && (
                <p className="text-xs text-center text-blue-600 py-2">
                  +{matrix.highValueHighCost.length - 5} more players
                </p>
              )}
            </div>
          </div>

          {/* Low Value, Low Cost - Depth Options */}
          <div className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-yellow-800">Depth Options</h3>
              <span className="text-sm text-yellow-600">({matrix.lowValueLowCost.length})</span>
            </div>
            <p className="text-xs text-yellow-700 mb-3">Low Value • Low Cost</p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {matrix.lowValueLowCost.slice(0, 3).map((player, idx) => (
                <div key={player.id} className="bg-white p-3 rounded border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-gray-600">
                        {player.position} • {player.previousSchool}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm">{formatCurrency(player.marketValue)}</p>
                      {player.evaluation && (
                        <p className="text-xs text-gray-500">
                          Ratio: {player.evaluation.valuePerDollar.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {matrix.lowValueLowCost.length > 3 && (
                <p className="text-xs text-center text-yellow-600 py-2">
                  +{matrix.lowValueLowCost.length - 3} more players
                </p>
              )}
            </div>
          </div>

          {/* Low Value, High Cost - Avoid */}
          <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-800">Avoid</h3>
              <span className="text-sm text-red-600">({matrix.lowValueHighCost.length})</span>
            </div>
            <p className="text-xs text-red-700 mb-3">Low Value • High Cost</p>
            
            {matrix.lowValueHighCost.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {matrix.lowValueHighCost.slice(0, 3).map((player, idx) => (
                  <div key={player.id} className="bg-white p-3 rounded border shadow-sm opacity-75">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-700">{player.name}</p>
                        <p className="text-xs text-gray-500">
                          {player.position} • {player.previousSchool}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm text-red-600">{formatCurrency(player.marketValue)}</p>
                        {player.evaluation && (
                          <p className="text-xs text-gray-500">
                            Ratio: {player.evaluation.valuePerDollar.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">No players in this category</p>
                <p className="text-xs text-gray-500 mt-1">Good market conditions!</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Matrix Insights:</strong> Focus on the green quadrant for Baron Hopson-style value discoveries. 
            Elite talent (blue) requires significant budget allocation. Avoid red quadrant players entirely.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOpportunityMatrix;