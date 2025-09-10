import React from 'react';
import { useCompetitiveIntelligence } from '../hooks/useMoneyballData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  AlertTriangle,
  Target,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CompetitiveIntelligence: React.FC = () => {
  const { data: intelligence, isLoading } = useCompetitiveIntelligence();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!intelligence) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">No competitive intelligence data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tracked Schools</p>
              <p className="text-2xl font-bold text-gray-900">{intelligence.rivalActivity.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hot Positions</p>
              <p className="text-2xl font-bold text-gray-900">{intelligence.marketTrends.hotPositions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Opportunity Windows</p>
              <p className="text-2xl font-bold text-gray-900">{intelligence.opportunityWindows.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Price Movement</p>
              <p className="text-2xl font-bold text-gray-900">+{intelligence.marketTrends.averagePriceMovement.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Windows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Clock className="w-5 h-5" />
            Immediate Opportunity Windows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {intelligence.opportunityWindows.map((opportunity, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  opportunity.urgency === 'High'
                    ? 'bg-red-50 border-red-500'
                    : opportunity.urgency === 'Medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{opportunity.description}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        opportunity.urgency === 'High'
                          ? 'bg-red-100 text-red-800'
                          : opportunity.urgency === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {opportunity.urgency} Urgency
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{opportunity.actionRequired}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Timeframe: {opportunity.timeframe}</span>
                      <span>•</span>
                      <span>Est. Savings: {formatCurrency(opportunity.estimatedSavings)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rival Activity Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Rival School Activity (7-Day Window)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {intelligence.rivalActivity.map((rival) => (
              <div key={rival.school} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-gray-900">{rival.school}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rival.activityLevel === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : rival.activityLevel === 'High'
                        ? 'bg-orange-100 text-orange-800'
                        : rival.activityLevel === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {rival.activityLevel} Activity
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-700">{rival.recentSignings}</div>
                    <div className="text-xs text-blue-600">Recent Signings</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-700">{formatCurrency(rival.estimatedSpent)}</div>
                    <div className="text-xs text-red-600">Estimated Spent</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-700">{formatCurrency(rival.estimatedRemaining)}</div>
                    <div className="text-xs text-green-600">Estimated Remaining</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-700">
                      {((rival.estimatedSpent / (rival.estimatedSpent + rival.estimatedRemaining)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-purple-600">Budget Used</div>
                  </div>
                </div>

                {rival.targetPositions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Target Positions:</div>
                    <div className="flex flex-wrap gap-2">
                      {rival.targetPositions.map((position, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Position Market Inflation (7-day)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(intelligence.marketTrends.positionInflation).map(([position, inflation]) => (
                <div key={position} className="flex items-center justify-between">
                  <span className="font-medium">{position}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          inflation > 15 
                            ? 'bg-red-500' 
                            : inflation > 10 
                            ? 'bg-orange-500' 
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(inflation * 5, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold min-w-12 ${
                      inflation > 15 ? 'text-red-600' : inflation > 10 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      +{inflation.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Undervalued Market Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {intelligence.marketTrends.undervaluedSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">{segment}</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Value Opportunity</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Hot Positions (High Demand)</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence.marketTrends.hotPositions.map((position, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {position}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            AI-Generated Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {intelligence.recommendedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-800">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitiveIntelligence;