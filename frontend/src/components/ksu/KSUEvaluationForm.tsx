import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { enhancedApiClient, type KSUPlayerEvaluation } from '../../services/enhancedApi';
import { 
  GraduationCap, 
  MapPin, 
  Heart, 
  TrendingUp, 
  Target, 
  Zap,
  FileText,
  Save,
  AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface KSUEvaluationFormProps {
  athleteId: number;
  athleteName: string;
  onEvaluationComplete?: (evaluation: KSUPlayerEvaluation) => void;
}

const KSUEvaluationForm: React.FC<KSUEvaluationFormProps> = ({
  athleteId,
  athleteName,
  onEvaluationComplete
}) => {
  const [evaluation, setEvaluation] = useState({
    academic_fit_score: 50,
    geographic_preference_score: 50,
    culture_fit_score: 50,
    development_potential_score: 50,
    scheme_fit_score: 50,
    immediate_impact_score: 50,
    depth_chart_position: '',
    competition_for_position: 1,
    recruiting_priority: 'MEDIUM',
    ksu_interest_level: 'EVALUATING',
    likelihood_to_commit: 0.5,
    position_coach_notes: '',
    coordinator_notes: '',
    head_coach_notes: '',
    evaluated_by: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreChange = (field: string, value: number) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: Math.max(0, Math.min(100, value))
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTextChange = (field: string, value: string) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const calculateOverallScore = () => {
    return (
      (evaluation.academic_fit_score * 0.25) +
      (evaluation.geographic_preference_score * 0.15) +
      (evaluation.culture_fit_score * 0.20) +
      (evaluation.development_potential_score * 0.15) +
      (evaluation.scheme_fit_score * 0.25)
    ).toFixed(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evaluation.evaluated_by.trim()) {
      toast.error('Please enter evaluator name');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await enhancedApiClient.ksuEvaluateAthlete(athleteId, evaluation);
      
      if (response.error) {
        toast.error(`Evaluation failed: ${response.error}`);
        return;
      }

      toast.success('KSU evaluation saved successfully!');
      
      if (response.data && onEvaluationComplete) {
        onEvaluationComplete(response.data);
      }
    } catch (error) {
      console.error('Error submitting KSU evaluation:', error);
      toast.error('Failed to save evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <GraduationCap className="w-6 h-6" />
            Kennesaw State University Player Evaluation
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-blue-600">Evaluating: <strong>{athleteName}</strong></p>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">{calculateOverallScore()}</div>
              <div className="text-sm text-blue-600">Projected KSU Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Evaluation Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Fit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Academic Fit (25% weight)
              </CardTitle>
              <p className="text-sm text-gray-600">
                GPA, core courses, academic major alignment with KSU standards
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Academic Fit Score</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evaluation.academic_fit_score}
                      onChange={(e) => handleScoreChange('academic_fit_score', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className={`px-3 py-2 rounded-lg border font-bold min-w-16 text-center ${getScoreColor(evaluation.academic_fit_score)}`}>
                      {evaluation.academic_fit_score}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Below KSU Standards</span>
                    <span>Exceeds Requirements</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Preference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Geographic Preference (15% weight)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Georgia resident priority, Southeast regional recruiting focus
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Geographic Fit Score</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evaluation.geographic_preference_score}
                      onChange={(e) => handleScoreChange('geographic_preference_score', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className={`px-3 py-2 rounded-lg border font-bold min-w-16 text-center ${getScoreColor(evaluation.geographic_preference_score)}`}>
                      {evaluation.geographic_preference_score}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Out of Region</span>
                    <span>Georgia Resident</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Culture Fit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Culture Fit (20% weight)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Work ethic, character, leadership qualities, team-first mentality
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Culture Fit Score</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evaluation.culture_fit_score}
                      onChange={(e) => handleScoreChange('culture_fit_score', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className={`px-3 py-2 rounded-lg border font-bold min-w-16 text-center ${getScoreColor(evaluation.culture_fit_score)}`}>
                      {evaluation.culture_fit_score}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor Character Fit</span>
                    <span>Perfect KSU Culture</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Potential */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Development Potential (15% weight)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Coaching staff assessment of improvement trajectory and ceiling
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Development Potential Score</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evaluation.development_potential_score}
                      onChange={(e) => handleScoreChange('development_potential_score', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className={`px-3 py-2 rounded-lg border font-bold min-w-16 text-center ${getScoreColor(evaluation.development_potential_score)}`}>
                      {evaluation.development_potential_score}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Limited Upside</span>
                    <span>High Ceiling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheme Fit - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Scheme Fit (25% weight)
            </CardTitle>
            <p className="text-sm text-gray-600">
              How well the player fits KSU's offensive/defensive schemes and system requirements
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Scheme Fit Score</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluation.scheme_fit_score}
                    onChange={(e) => handleScoreChange('scheme_fit_score', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className={`px-3 py-2 rounded-lg border font-bold min-w-16 text-center ${getScoreColor(evaluation.scheme_fit_score)}`}>
                    {evaluation.scheme_fit_score}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor System Fit</span>
                  <span>Perfect Scheme Match</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Assessment Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Immediate Impact Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Immediate Impact Score</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluation.immediate_impact_score}
                    onChange={(e) => handleScoreChange('immediate_impact_score', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className={`px-3 py-2 rounded-lg border font-bold min-w-16 text-center ${getScoreColor(evaluation.immediate_impact_score)}`}>
                    {evaluation.immediate_impact_score}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Depth Chart Position</label>
                <select
                  value={evaluation.depth_chart_position}
                  onChange={(e) => handleSelectChange('depth_chart_position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Position</option>
                  <option value="STARTER">Immediate Starter</option>
                  <option value="BACKUP">Quality Backup</option>
                  <option value="DEPTH">Depth Piece</option>
                  <option value="SPECIAL_TEAMS">Special Teams Contributor</option>
                  <option value="DEVELOPMENTAL">Developmental Player</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recruiting Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recruiting Priority</label>
                <select
                  value={evaluation.recruiting_priority}
                  onChange={(e) => handleSelectChange('recruiting_priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">KSU Interest Level</label>
                <select
                  value={evaluation.ksu_interest_level}
                  onChange={(e) => handleSelectChange('ksu_interest_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OFFER">Extended Offer</option>
                  <option value="STRONG_INTEREST">Strong Interest</option>
                  <option value="EVALUATING">Currently Evaluating</option>
                  <option value="PASS">Pass on Player</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Likelihood to Commit (%)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={evaluation.likelihood_to_commit}
                    onChange={(e) => handleTextChange('likelihood_to_commit', e.target.value)}
                    className="flex-1"
                  />
                  <div className="px-3 py-2 bg-gray-100 rounded font-bold min-w-16 text-center">
                    {(evaluation.likelihood_to_commit * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coaching Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Coaching Staff Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Position Coach Notes</label>
              <textarea
                value={evaluation.position_coach_notes}
                onChange={(e) => handleTextChange('position_coach_notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Position coach evaluation and observations..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Coordinator Notes</label>
              <textarea
                value={evaluation.coordinator_notes}
                onChange={(e) => handleTextChange('coordinator_notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Offensive/Defensive coordinator input..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Head Coach Notes</label>
              <textarea
                value={evaluation.head_coach_notes}
                onChange={(e) => handleTextChange('head_coach_notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Head coach final assessment..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Evaluator Information */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Evaluated By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={evaluation.evaluated_by}
                  onChange={(e) => handleTextChange('evaluated_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Coach name or staff member"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Competition for Position</label>
                <select
                  value={evaluation.competition_for_position}
                  onChange={(e) => handleSelectChange('competition_for_position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 - No Competition</option>
                  <option value={2}>2 - Minimal Competition</option>
                  <option value={3}>3 - Moderate Competition</option>
                  <option value={4}>4 - High Competition</option>
                  <option value={5}>5 - Extreme Competition</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Projected KSU Score: {calculateOverallScore()}/100</span>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Saving Evaluation...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save KSU Evaluation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KSUEvaluationForm;