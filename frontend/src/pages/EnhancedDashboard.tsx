import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  enhancedApiClient, 
  type AnalyticsDashboard as DashboardData 
} from '../services/enhancedApi';
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

const EnhancedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await enhancedApiClient.getAnalyticsDashboard();
      
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Baron Hopson Showcase */}
      <Card className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 text-2xl">
            <Award className="w-8 h-8" />
            NIL Moneyball Platform - Enhanced Analytics Dashboard
          </CardTitle>
          <p className="text-emerald-700 text-lg">
            Powered by Baron Hopson methodology for data-driven roster optimization
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-emerald-100 rounded-lg">
              <div className="text-3xl font-bold text-emerald-700">11 → 92</div>
              <div className="text-sm text-emerald-600">Baron Hopson Formula</div>
              <div className="text-xs text-emerald-500 mt-1">Tackles to Production Score</div>
            </div>
            <div className="text-center p-4 bg-emerald-100 rounded-lg">
              <div className="text-3xl font-bold text-emerald-700">3.5x</div>
              <div className="text-sm text-emerald-600">FCS Transfer Multiplier</div>
              <div className="text-xs text-emerald-500 mt-1">Group5 Advantage</div>
            </div>
            <div className="text-center p-4 bg-emerald-100 rounded-lg">
              <div className="text-3xl font-bold text-emerald-700">6.57</div>
              <div className="text-sm text-emerald-600">Value per $1000</div>
              <div className="text-xs text-emerald-500 mt-1">KSU Baseline Ratio</div>
            </div>
            <div className="text-center p-4 bg-emerald-100 rounded-lg">
              <div className="text-3xl font-bold text-emerald-700">{dashboardData.overview.baron_hopson_prospects}</div>
              <div className="text-sm text-emerald-600">Baron-Level Prospects</div>
              <div className="text-xs text-emerald-500 mt-1">Currently Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Athletes</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.total_athletes.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">In transfer portal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Evaluations Complete</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.total_evaluations.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Baron Hopson analysis</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Roster Optimizations</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.total_optimizations.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Budget tier scenarios</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High-Value Prospects</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.baron_hopson_prospects}</p>
              <p className="text-xs text-gray-500 mt-1">70%+ Baron similarity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Position Market Breakdown
            </CardTitle>
            <p className="text-sm text-gray-600">
              Available players and average market values by position
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.position_breakdown.map((position, idx) => (
                <div key={position.position} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {position.position}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{position.position}</p>
                      <p className="text-sm text-gray-600">{position.count} available</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(position.avg_market_value)}</p>
                    <p className="text-xs text-gray-500">Avg market value</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Transfer Market Analysis
            </CardTitle>
            <p className="text-sm text-gray-600">
              Distribution by transfer origin with average costs
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.transfer_breakdown.map((transfer, idx) => {
                const getTransferColor = (type: string) => {
                  switch (type) {
                    case 'FCS': return 'bg-green-600';
                    case 'Group5': return 'bg-blue-600';
                    case 'Power4': return 'bg-purple-600';
                    default: return 'bg-gray-600';
                  }
                };

                const getMultiplier = (type: string) => {
                  switch (type) {
                    case 'FCS': return '3.5x multiplier';
                    case 'Group5': return '1.5x multiplier';
                    case 'Power4': return '1.0x multiplier';
                    default: return '';
                  }
                };

                return (
                  <div key={transfer.transfer_from} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${getTransferColor(transfer.transfer_from)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                        {transfer.transfer_from.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transfer.transfer_from}</p>
                        <p className="text-xs text-gray-500">{getMultiplier(transfer.transfer_from)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{transfer.count} players</p>
                      <p className="text-xs text-gray-600">{formatCurrency(transfer.avg_market_value)} avg</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baron Hopson Prospects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Baron Hopson Profile Prospects
          </CardTitle>
          <p className="text-sm text-gray-600">
            Players with 70%+ similarity to the Baron Hopson case study - high-value transfer targets
          </p>
        </CardHeader>
        <CardContent>
          {dashboardData.baron_hopson_prospects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dashboardData.baron_hopson_prospects.slice(0, 6).map((prospect) => (
                <div key={prospect.athlete_id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-green-900">{prospect.athlete_name}</h4>
                      <p className="text-sm text-green-700">{prospect.position}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-700">{prospect.similarity_score.toFixed(0)}%</div>
                      <div className="text-xs text-green-600">Baron Similarity</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-2 rounded">
                      <p className="text-gray-600">Value/$ Ratio</p>
                      <p className="font-bold text-green-700">{prospect.value_per_dollar.toFixed(1)}</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-gray-600">Market Value</p>
                      <p className="font-bold text-green-700">{formatCurrency(prospect.market_value)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      {prospect.value_per_dollar >= 5.0 ? 'Immediate Pursuit' : 
                       prospect.value_per_dollar >= 3.0 ? 'Strong Interest' : 'Monitor Closely'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No high-similarity Baron Hopson prospects currently available</p>
              <p className="text-sm text-gray-500 mt-2">
                New evaluations are needed to identify potential value opportunities
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Tier Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget Tier Optimization Performance
          </CardTitle>
          <p className="text-sm text-gray-600">
            Average budget utilization and competitive advantage by tier
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.budget_utilization.map((tier) => {
              const getTierColor = (tierName: string) => {
                if (tierName.includes('Group5')) return 'from-green-500 to-emerald-600';
                if (tierName.includes('Power4')) return 'from-blue-500 to-purple-600';
                return 'from-gray-500 to-gray-600';
              };

              return (
                <div key={tier.budget_tier} className="p-4 bg-white border rounded-lg">
                  <div className={`w-full h-2 bg-gradient-to-r ${getTierColor(tier.budget_tier)} rounded-full mb-3`}></div>
                  
                  <h4 className="font-medium text-gray-900 mb-2">
                    {tier.budget_tier.replace('_', ' ')}
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget Used:</span>
                      <span className="font-bold">{(tier.avg_utilization * 100).toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Advantage Score:</span>
                      <span className="font-bold">{tier.avg_advantage_score.toFixed(1)}/100</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      {tier.avg_utilization >= 0.8 && tier.avg_advantage_score >= 70 ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Optimal Performance</span>
                        </>
                      ) : tier.avg_advantage_score >= 60 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-600 font-medium">Good Efficiency</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs text-yellow-600 font-medium">Room for Improvement</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* KSU Integration Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <GraduationCap className="w-6 h-6" />
            Kennesaw State University Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">Group5 High</div>
              <div className="text-sm text-blue-600">Budget Tier</div>
              <div className="text-xs text-blue-500 mt-1">$1.3M Total Budget</div>
            </div>
            
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">Georgia Focus</div>
              <div className="text-sm text-blue-600">Geographic Priority</div>
              <div className="text-xs text-blue-500 mt-1">25% evaluation weight</div>
            </div>
            
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">3.0x Multiplier</div>
              <div className="text-sm text-blue-600">FCS Transfer Bonus</div>
              <div className="text-xs text-blue-500 mt-1">Competitive advantage</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>KSU Competitive Strategy:</strong> Focus on undervalued FCS transfers with strong academic 
              profiles and Georgia/Southeast ties. Emphasize culture fit and development potential within 
              Group5 High budget constraints.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;