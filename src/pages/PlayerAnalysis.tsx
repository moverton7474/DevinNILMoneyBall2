import React, { useState } from 'react';
import { useBaronHopsonAnalysis } from '../hooks/useMoneyballData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  TrendingUp, 
  Target, 
  Calculator, 
  Award,
  BarChart3,
  Users,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PlayerAnalysis: React.FC = () => {
  const [playerStats, setPlayerStats] = useState({
    name: '',
    position: 'LB',
    totalTackles: 11,
    soloTackles: 6,
    assistedTackles: 5,
    gamesPlayed: 1,
    marketValue: 15000,
    previousSchool: 'Tennessee State',
    conference: 'OVC',
    transferFrom: 'FCS' as const
  });

  const baronAnalysis = useBaronHopsonAnalysis();

  const handleAnalyze = () => {
    baronAnalysis.mutate(playerStats);
  };

  const handleInputChange = (field: string, value: any) => {
    setPlayerStats(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetToBaronBaseline = () => {
    setPlayerStats({
      name: 'Baron Hopson',
      position: 'LB',
      totalTackles: 11,
      soloTackles: 6,
      assistedTackles: 5,
      gamesPlayed: 1,
      marketValue: 15000,
      previousSchool: 'Tennessee State',
      conference: 'OVC',
      transferFrom: 'FCS'
    });
  };

  return (
    <div className="space-y-6">
      {/* Baron Hopson Reference */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Award className="w-5 h-5" />
            Baron Hopson Case Study: The Original Moneyball Discovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">Tennessee State → KSU</div>
              <div className="text-sm text-emerald-600">FCS Transfer Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">11 Tackles</div>
              <div className="text-sm text-emerald-600">vs Wake Forest (P5)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">$15K NIL</div>
              <div className="text-sm text-emerald-600">vs $165K SEC Comparable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">6.57 Ratio</div>
              <div className="text-sm text-emerald-600">Value per $1000</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={resetToBaronBaseline} variant="outline" className="text-emerald-700">
              <Target className="w-4 h-4 mr-2" />
              Use Baron Hopson Baseline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Player Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Player Evaluation Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Name
              </label>
              <input
                type="text"
                value={playerStats.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter player name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                value={playerStats.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="QB">Quarterback</option>
                <option value="RB">Running Back</option>
                <option value="WR">Wide Receiver</option>
                <option value="TE">Tight End</option>
                <option value="OL">Offensive Line</option>
                <option value="DL">Defensive Line</option>
                <option value="LB">Linebacker</option>
                <option value="DB">Defensive Back</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer From
              </label>
              <select
                value={playerStats.transferFrom}
                onChange={(e) => handleInputChange('transferFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FCS">FCS</option>
                <option value="Group5">Group5</option>
                <option value="Power4">Power4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous School
              </label>
              <input
                type="text"
                value={playerStats.previousSchool}
                onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Value ($)
              </label>
              <input
                type="number"
                value={playerStats.marketValue}
                onChange={(e) => handleInputChange('marketValue', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Games Played
              </label>
              <input
                type="number"
                value={playerStats.gamesPlayed}
                onChange={(e) => handleInputChange('gamesPlayed', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Position-Specific Stats */}
          {playerStats.position === 'LB' && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-4">Linebacker Stats</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Tackles
                  </label>
                  <input
                    type="number"
                    value={playerStats.totalTackles}
                    onChange={(e) => handleInputChange('totalTackles', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solo Tackles
                  </label>
                  <input
                    type="number"
                    value={playerStats.soloTackles}
                    onChange={(e) => handleInputChange('soloTackles', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assisted Tackles
                  </label>
                  <input
                    type="number"
                    value={playerStats.assistedTackles}
                    onChange={(e) => handleInputChange('assistedTackles', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleAnalyze}
              disabled={baronAnalysis.isPending}
              size="lg"
              className="px-8 py-3"
            >
              {baronAnalysis.isPending ? (
                <>
                  <Calculator className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Player...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Run Baron Hopson Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Loading */}
      {baronAnalysis.isPending && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <div className="ml-4">
              <p className="text-lg font-medium">Running Moneyball Analysis...</p>
              <p className="text-sm text-gray-600">Comparing to Baron Hopson baseline</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {baronAnalysis.data && (
        <div className="space-y-6">
          {/* Similarity Score */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Target className="w-5 h-5" />
                Baron Hopson Similarity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-emerald-700 mb-2">
                  {baronAnalysis.data.similarity.toFixed(0)}%
                </div>
                <div className="text-emerald-600">Similarity to Baron Hopson Profile</div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-emerald-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${baronAnalysis.data.similarity}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-emerald-800 mb-2">Player Profile</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Value/Dollar Ratio:</span>
                      <span className="font-bold">{baronAnalysis.data.playerValueRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Value:</span>
                      <span className="font-bold">${playerStats.marketValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer Type:</span>
                      <span className="font-bold">{playerStats.transferFrom}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-emerald-800 mb-2">Baron Hopson Baseline</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Value/Dollar Ratio:</span>
                      <span className="font-bold">{baronAnalysis.data.baronBaselineRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Value:</span>
                      <span className="font-bold">$15,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer Type:</span>
                      <span className="font-bold">FCS</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Moneyball Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border-l-4 ${
                baronAnalysis.data.recommendation === 'STRONG_RECOMMENDATION'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {baronAnalysis.data.recommendation === 'STRONG_RECOMMENDATION' ? (
                    <Award className="w-5 h-5 text-green-600" />
                  ) : (
                    <Users className="w-5 h-5 text-blue-600" />
                  )}
                  <span className={`font-bold ${
                    baronAnalysis.data.recommendation === 'STRONG_RECOMMENDATION'
                      ? 'text-green-800'
                      : 'text-blue-800'
                  }`}>
                    {baronAnalysis.data.recommendation === 'STRONG_RECOMMENDATION'
                      ? 'Strong Recommendation - Prime Target'
                      : 'Moderate Interest - Worth Monitoring'
                    }
                  </span>
                </div>
                
                <p className={`text-sm ${
                  baronAnalysis.data.recommendation === 'STRONG_RECOMMENDATION'
                    ? 'text-green-700'
                    : 'text-blue-700'
                }`}>
                  {baronAnalysis.data.recommendation === 'STRONG_RECOMMENDATION'
                    ? `This player exhibits similar high-value characteristics to Baron Hopson. The value-per-dollar ratio suggests exceptional ROI potential for ${playerStats.transferFrom} to Group5 programs.`
                    : 'Player shows some positive indicators but may not reach Baron Hopson-level value efficiency. Consider as depth option or monitor for price movement.'
                  }
                </p>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-2 bg-white rounded">
                    <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <div className="text-sm font-medium">Value Advantage</div>
                    <div className="text-lg font-bold text-green-700">
                      {baronAnalysis.data.advantageMultiplier.toFixed(1)}x
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-white rounded">
                    <BarChart3 className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-medium">Similarity Score</div>
                    <div className="text-lg font-bold text-blue-700">
                      {baronAnalysis.data.similarity.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-white rounded">
                    <Target className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-sm font-medium">Player V/$ Ratio</div>
                    <div className="text-lg font-bold text-purple-700">
                      {baronAnalysis.data.playerValueRatio.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {baronAnalysis.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">
              Analysis failed: {baronAnalysis.error.message}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerAnalysis;