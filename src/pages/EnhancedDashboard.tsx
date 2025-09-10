import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Target,
  DollarSign,
  MapPin,
  GraduationCap,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Mock data for demo purposes
const mockDashboardData = {
  overview: {
    total_athletes: 1847,
    total_evaluations: 3245,
    total_optimizations: 67,
    baron_hopson_prospects: 23
  },
  position_breakdown: [
    { position: 'LB', count: 312, avg_market_value: 35000 },
    { position: 'QB', count: 89, avg_market_value: 125000 },
    { position: 'WR', count: 445, avg_market_value: 65000 },
    { position: 'RB', count: 201, avg_market_value: 45000 },
    { position: 'DB', count: 387, avg_market_value: 42000 },
    { position: 'OL', count: 298, avg_market_value: 38000 },
    { position: 'DL', count: 267, avg_market_value: 48000 },
    { position: 'TE', count: 156, avg_market_value: 32000 }
  ],
  transfer_breakdown: [
    { transfer_from: 'FCS', count: 523, avg_market_value: 28000 },
    { transfer_from: 'Group5', count: 789, avg_market_value: 52000 },
    { transfer_from: 'Power4', count: 201, avg_market_value: 145000 }
  ],
  baron_hopson_prospects: [
    { athlete_id: 1, athlete_name: 'Marcus Thompson', position: 'LB', similarity_score: 87.5, value_per_dollar: 5.8, market_value: 18000 },
    { athlete_id: 2, athlete_name: 'Jerome Williams', position: 'LB', similarity_score: 82.1, value_per_dollar: 6.2, market_value: 15000 },
    { athlete_id: 3, athlete_name: 'Alex Rodriguez', position: 'LB', similarity_score: 78.9, value_per_dollar: 4.7, market_value: 22000 },
    { athlete_id: 4, athlete_name: 'David Chen', position: 'LB', similarity_score: 76.3, value_per_dollar: 5.1, market_value: 19000 },
    { athlete_id: 5, athlete_name: 'Antonio Martinez', position: 'LB', similarity_score: 74.8, value_per_dollar: 4.9, market_value: 20000 },
    { athlete_id: 6, athlete_name: 'Robert Taylor', position: 'LB', similarity_score: 72.4, value_per_dollar: 4.3, market_value: 25000 }
  ],
  budget_utilization: [
    { budget_tier: 'Group5 Low', avg_utilization: 0.78, avg_advantage_score: 76.3 },
    { budget_tier: 'Group5 High', avg_utilization: 0.82, avg_advantage_score: 78.9 },
    { budget_tier: 'Power4 Standard', avg_utilization: 0.71, avg_advantage_score: 65.2 },
    { budget_tier: 'Power4 Elite', avg_utilization: 0.85, avg_advantage_score: 58.7 }
  ]
};

const EnhancedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Unable to load dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into athlete performance and market trends</p>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Data Updated</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Athletes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.total_athletes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.total_evaluations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Performance assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimizations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.total_optimizations}</div>
            <p className="text-xs text-muted-foreground">
              Strategy improvements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baron Hopson Prospects</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.baron_hopson_prospects}</div>
            <p className="text-xs text-muted-foreground">
              High-potential matches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Position Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Position Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.position_breakdown.map((position) => (
              <div key={position.position} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">{position.position}</span>
                  <span className="text-sm text-gray-600">{position.count} athletes</span>
                </div>
                <div className="text-sm text-gray-700">
                  Avg Market Value: {formatCurrency(position.avg_market_value)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Transfer Portal Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.transfer_breakdown.map((transfer) => (
              <div key={transfer.transfer_from} className="text-center">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{transfer.transfer_from}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {transfer.count}
                  </div>
                  <div className="text-sm text-gray-600">
                    Avg: {formatCurrency(transfer.avg_market_value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Baron Hopson Prospects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Top Baron Hopson Prospects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Athlete</th>
                  <th className="text-left py-2">Position</th>
                  <th className="text-right py-2">Similarity Score</th>
                  <th className="text-right py-2">Value/Dollar</th>
                  <th className="text-right py-2">Market Value</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.baron_hopson_prospects.map((prospect) => (
                  <tr key={prospect.athlete_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{prospect.athlete_name}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {prospect.position}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-semibold text-green-600">
                        {prospect.similarity_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right">{prospect.value_per_dollar.toFixed(1)}</td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(prospect.market_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Budget Utilization Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.budget_utilization.map((budget) => (
              <div key={budget.budget_tier} className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">{budget.budget_tier}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Utilization:</span>
                    <span className="font-medium">{(budget.avg_utilization * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Advantage Score:</span>
                    <span className="font-medium">{budget.avg_advantage_score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;