import React, { useState, useEffect } from 'react';
import RosterUploadModal from '../components/roster/RosterUploadModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { moneyballApi } from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Search, 
  Filter, 
  Target,
  Star,
  Clock,
  Upload,
  Download,
  Settings,
  PlayCircle,
  CheckCircle,
  BarChart3,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const TransferPortal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('All');
  const [sortBy, setSortBy] = useState('valuePerDollar');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [uploadedPlayers, setUploadedPlayers] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const displayPlayers = uploadedPlayers.length > 0 ? uploadedPlayers : players;

  useEffect(() => {
    loadPlayers();
    // Check for recent upload session
    const sessionId = sessionStorage.getItem('lastUploadSession');
    if (sessionId) {
      loadSessionPlayers(sessionId);
    }
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const players = await moneyballApi.getTransferPortalPlayers();
      setPlayers(players);
    } catch (error) {
      console.error('Failed to load players:', error);
      toast.error('Failed to load transfer portal players');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionPlayers = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/v1/roster/session/${sessionId}`);
      const data = await response.json();
      
      if (data.players) {
        setUploadedPlayers(data.players);
        setCurrentSessionId(sessionId);
        
        toast.success(`Loaded ${data.players.length} uploaded players`, {
          icon: '📊',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Failed to load session players:', error);
    }
  };

  const handleRosterUpload = (sessionId: string, players: any[]) => {
    setCurrentSessionId(sessionId);
    setUploadedPlayers(players);
    
    // Refresh to get the actual imported data
    setTimeout(() => {
      loadSessionPlayers(sessionId);
      loadPlayers();
    }, 1000);
    
    // Close modal after short delay
    setTimeout(() => {
      setShowUploadModal(false);
    }, 2500);
  };

  const runBulkBaronAnalysis = async () => {
    if (!currentSessionId) {
      toast.error('No uploaded players to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/roster/bulk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          budget_tier: 'Group5_High'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(
          `🎯 Baron Hopson Analysis Complete!
          Analyzed ${result.analyzed} players successfully.
          Results are now available below.`,
          { duration: 5000 }
        );
        
        // Reload session data to show updated scores
        loadSessionPlayers(currentSessionId);
        loadPlayers();
      } else {
        toast.error(`Analysis failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Bulk analysis error:', error);
      toast.error('Failed to run bulk analysis - check network connection');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportAnalysisResults = async () => {
    if (!currentSessionId) {
      toast.error('No session to export');
      return;
    }

    try {
      const response = await fetch(`/api/roster/export/${currentSessionId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `roster_analysis_${currentSessionId.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Analysis results exported successfully!');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed - check network connection');
    }
  };

  const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB'];
  
  const filteredPlayers = (displayPlayers || []).filter(player => {
    const matchesSearch = player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.previous_school?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'All' || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    switch (sortBy) {
      case 'valuePerDollar':
        return (b.value_per_dollar || 0) - (a.value_per_dollar || 0);
      case 'marketValue':
        return (a.market_value || 0) - (b.market_value || 0);
      case 'productionScore':
        return (b.baron_hopson_score || 0) - (a.baron_hopson_score || 0);
      case 'baronSimilarity':
        return (b.baron_similarity || 0) - (a.baron_similarity || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return <LoadingSpinner />;
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
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Players</p>
              <p className="text-2xl font-bold text-gray-900">{displayPlayers?.length?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uploaded Players</p>
              <p className="text-2xl font-bold text-gray-900">
                {uploadedPlayers?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Analyzed Players</p>
              <p className="text-2xl font-bold text-gray-900">
                {(uploadedPlayers || []).filter(p => p.baron_hopson_score).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Success Banner */}
      {(uploadedPlayers?.length || 0) > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {uploadedPlayers?.length || 0} Players Successfully Imported
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    {(uploadedPlayers || []).filter(p => p.baron_hopson_score).length} analyzed • {' '}
                    {(uploadedPlayers || []).filter(p => !p.baron_hopson_score).length} pending analysis
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {(uploadedPlayers || []).filter(p => !p.baron_hopson_score).length > 0 && (
                  <Button
                    onClick={runBulkBaronAnalysis}
                    disabled={isAnalyzing}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Run Baron Hopson Analysis
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={exportAnalysisResults}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Transfer Portal Management</h3>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Roster
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Player Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Players
              </label>
              <input
                type="text"
                placeholder="Player name or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {positions.map(position => (
                  <option key={position} value={position}>
                    {position === 'All' ? 'All Positions' : position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="valuePerDollar">Value per Dollar</option>
                <option value="marketValue">Market Value (Low to High)</option>
                <option value="productionScore">Production Score</option>
                <option value="baronSimilarity">Baron Hopson Similarity</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setPositionFilter('All');
                  setSortBy('valuePerDollar');
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {(uploadedPlayers?.length || 0) > 0 ? 'Uploaded Players' : 'Transfer Portal Players'} 
              ({sortedPlayers.length})
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4" />
              Sorted by {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPlayers.map((player) => (
              <div key={player.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-gray-900">{player.name}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                        {player.position}
                      </span>
                      {player.transfer_from === 'FCS' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          FCS Transfer 3.0x
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">
                      {player.previous_school} 
                      {player.conference && ` • ${player.conference}`}
                      {player.market_value && ` • ${formatCurrency(player.market_value)}`}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {player.baron_hopson_score ? (
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(player.baron_hopson_score)}/100
                        </div>
                        <div className="text-sm text-gray-500">Baron Hopson Score</div>
                        {player.value_per_dollar && (
                          <div className="text-xs text-blue-600 mt-1">
                            Ratio: {player.value_per_dollar.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg text-gray-400">Not Analyzed</div>
                        <div className="text-xs text-gray-500">Pending Analysis</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {player.recommendation && (
                  <div className="mt-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className={`text-sm font-medium ${
                      player.recommendation === 'IMMEDIATE_PURSUIT' ? 'text-green-700' :
                      player.recommendation === 'STRONG_INTEREST' ? 'text-blue-700' :
                      player.recommendation === 'MODERATE_INTEREST' ? 'text-yellow-700' :
                      'text-gray-700'
                    }`}>
                      {player.recommendation.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {sortedPlayers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {(displayPlayers?.length || 0) === 0 
                  ? 'No players available. Upload a roster to get started.'
                  : 'No players found matching your criteria'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <RosterUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleRosterUpload}
      />
    </div>
  );
};

export default TransferPortal;
