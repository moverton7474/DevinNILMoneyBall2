import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  enhancedApiClient, 
  type NILOpportunity, 
  type NILOpportunityMatch 
} from '../../services/enhancedApi';
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  MapPin,
  GraduationCap,
  Calendar,
  Zap,
  Star,
  Award
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const NILOpportunityMatcher: React.FC = () => {
  const [opportunities, setOpportunities] = useState<NILOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<NILOpportunity | null>(null);
  const [matches, setMatches] = useState<NILOpportunityMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [filters, setFilters] = useState({
    position: '',
    min_compensation: '',
    max_compensation: '',
    opportunity_type: '',
  });

  useEffect(() => {
    loadOpportunities();
  }, [filters]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const response = await enhancedApiClient.getNILOpportunities(filters);
      
      if (response.error) {
        toast.error('Failed to load opportunities');
        return;
      }
      
      if (response.data) {
        setOpportunities(response.data.opportunities);
      }
    } catch (error) {
      console.error('Error loading opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchOpportunity = async (opportunity: NILOpportunity) => {
    setSelectedOpportunity(opportunity);
    setMatching(true);
    setMatches(null);

    try {
      const response = await enhancedApiClient.matchNILOpportunity(opportunity.id);
      
      if (response.error) {
        toast.error('Failed to match opportunity');
        return;
      }
      
      if (response.data) {
        setMatches(response.data);
        toast.success(`Found ${response.data.total_matches} potential matches`);
      }
    } catch (error) {
      console.error('Error matching opportunity:', error);
      toast.error('Failed to match opportunity');
    } finally {
      setMatching(false);
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

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 55) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            NIL Opportunity Matcher
          </CardTitle>
          <p className="text-gray-600">
            Match college athletes to NIL opportunities based on marketability, performance, and brand alignment
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <select
                value={filters.position}
                onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Positions</option>
                <option value="QB">Quarterback</option>
                <option value="RB">Running Back</option>
                <option value="WR">Wide Receiver</option>
                <option value="TE">Tight End</option>
                <option value="LB">Linebacker</option>
                <option value="DB">Defensive Back</option>
                <option value="DL">Defensive Line</option>
                <option value="OL">Offensive Line</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Opportunity Type</label>
              <select
                value={filters.opportunity_type}
                onChange={(e) => setFilters(prev => ({ ...prev, opportunity_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="SOCIAL_POST">Social Media Post</option>
                <option value="APPEARANCE">Personal Appearance</option>
                <option value="ENDORSEMENT">Product Endorsement</option>
                <option value="CAMP_CLINIC">Camp/Clinic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Min Compensation</label>
              <input
                type="number"
                value={filters.min_compensation}
                onChange={(e) => setFilters(prev => ({ ...prev, min_compensation: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Compensation</label>
              <input
                type="number"
                value={filters.max_compensation}
                onChange={(e) => setFilters(prev => ({ ...prev, max_compensation: e.target.value }))}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunities List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Opportunities ({opportunities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedOpportunity?.id === opportunity.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOpportunity(opportunity)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      opportunity.opportunity_type === 'ENDORSEMENT'
                        ? 'bg-purple-100 text-purple-800'
                        : opportunity.opportunity_type === 'SOCIAL_POST'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {opportunity.opportunity_type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(opportunity.compensation_amount)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {opportunity.duration_months} months
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {opportunity.applications_count}/{opportunity.max_participants}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{opportunity.brand_name}</p>
                  
                  {opportunity.position_requirements && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {opportunity.position_requirements.map((pos, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {opportunity.follower_requirement > 0 && (
                        <span>{opportunity.follower_requirement.toLocaleString()} followers min</span>
                      )}
                      {opportunity.academic_requirements > 0 && (
                        <span>{opportunity.academic_requirements} GPA min</span>
                      )}
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMatchOpportunity(opportunity);
                      }}
                      disabled={matching}
                      size="sm"
                      variant="outline"
                    >
                      {matching && selectedOpportunity?.id === opportunity.id ? (
                        <>
                          <Zap className="w-4 h-4 mr-1 animate-spin" />
                          Matching...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-1" />
                          Match Athletes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              
              {opportunities.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No NIL opportunities found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Matches Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Athlete Matches
              {matches && (
                <span className="text-sm font-normal text-gray-600">
                  ({matches.matching_athletes.length} shown of {matches.total_matches} total)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!matches && !matching ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select an opportunity to see matching athletes</p>
              </div>
            ) : matching ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Analyzing athlete matches...</p>
              </div>
            ) : matches ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Opportunity Summary */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <h4 className="font-medium text-blue-900">{matches.opportunity_title}</h4>
                  <div className="flex items-center gap-4 text-sm text-blue-700 mt-1">
                    <span>{matches.brand_name}</span>
                    <span>•</span>
                    <span>{formatCurrency(matches.compensation_amount)}</span>
                  </div>
                </div>

                {/* Matched Athletes */}
                {matches.matching_athletes.map((match, idx) => (
                  <div
                    key={match.athlete_id}
                    className="p-4 border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-500">#{idx + 1}</span>
                          <h4 className="font-medium text-gray-900">{match.name}</h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {match.position}
                          </span>
                        </div>
                        {match.gpa && (
                          <div className="flex items-center gap-1 mt-1">
                            <GraduationCap className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{match.gpa} GPA</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`px-3 py-1 rounded-lg font-bold ${getMatchScoreColor(match.match_score)}`}>
                        {match.match_score}% Match
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <TrendingUp className="w-3 h-3" />
                          <span>Marketability: {match.marketability_score}/100</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-3 h-3" />
                          <span>Followers: {match.total_followers.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <DollarSign className="w-3 h-3" />
                          <span>Est. NIL Value: {formatCurrency(match.estimated_nil_value)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Match Indicators */}
                    <div className="flex items-center gap-2 mt-3">
                      {match.match_score >= 90 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          <Award className="w-3 h-3" />
                          Perfect Match
                        </div>
                      )}
                      {match.match_score >= 80 && match.match_score < 90 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          <Star className="w-3 h-3" />
                          Excellent Fit
                        </div>
                      )}
                      {match.marketability_score >= 80 && (
                        <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          High Marketability
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <Button size="sm" className="w-full">
                        Connect with Brand
                      </Button>
                    </div>
                  </div>
                ))}
                
                {matches.matching_athletes.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No matching athletes found for this opportunity</p>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NILOpportunityMatcher;