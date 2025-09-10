import React from 'react';
import { useTransferPortalPlayers, usePriceAlerts, useCompetitiveIntelligence } from '../hooks/useMoneyballData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { data: players, isLoading: playersLoading } = useTransferPortalPlayers();
  const { data: alerts, isLoading: alertsLoading } = usePriceAlerts();
  const { data: intelligence, isLoading: intelligenceLoading } = useCompetitiveIntelligence();

  if (playersLoading || alertsLoading || intelligenceLoading) {
    return <LoadingSpinner />;
  }

  const stats = {
    totalPlayers: players?.length || 0,
    averageValue: players ? Math.round(players.reduce((sum, p) => sum + p.marketValue, 0) / players.length) : 0,
    urgentAlerts: alerts?.filter(a => a.alertType === 'URGENT_ACTION').length || 0,
    hotMarkets: intelligence?.marketTrends.hotPositions.length || 0
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transfer Portal Players</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlayers.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Market Value</p>
              <p className="text-2xl font-bold text-gray-900">${stats.averageValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgentAlerts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hot Markets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.hotMarkets}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baron Hopson Case Study Spotlight */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Target className="w-5 h-5" />
            Baron Hopson Success Story: The Moneyball Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">11</div>
              <div className="text-sm text-gray-600">Total Tackles vs Wake Forest</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">92/100</div>
              <div className="text-sm text-gray-600">Production Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">$15K</div>
              <div className="text-sm text-gray-600">Kennesaw State NIL Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">6.57x</div>
              <div className="text-sm text-gray-600">Value-per-Dollar Ratio</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>FCS Transfer Success:</strong> Baron delivered 80% of SEC-level production at 8% of the cost. 
              This model demonstrates how Group5 schools can compete through analytical roster construction.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Price Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            High-Priority Price Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts?.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  alert.alertType === 'URGENT_ACTION'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{alert.playerName}</h4>
                    <span className="text-sm text-gray-600">({alert.position})</span>
                    {alert.alertType === 'URGENT_ACTION' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.recommendation}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">${alert.newPrice.toLocaleString()}</div>
                  <div className="text-sm text-red-600">{alert.percentageChange.toFixed(1)}% ↓</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Position Market Inflation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {intelligence?.marketTrends.positionInflation && 
                Object.entries(intelligence.marketTrends.positionInflation).map(([position, inflation]) => (
                <div key={position} className="flex items-center justify-between">
                  <span className="font-medium">{position}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${inflation > 10 ? 'text-red-600' : 'text-yellow-600'}`}>
                      +{inflation.toFixed(1)}%
                    </span>
                    {inflation > 10 ? (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Undervalued Market Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {intelligence?.marketTrends.undervaluedSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">{segment}</span>
                  <span className="text-sm text-green-600">Opportunity</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;