import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
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
  onEvaluationComplete?: (evaluation: any) => void;
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('KSU evaluation saved successfully!');
      
      if (onEvaluationComplete) {
        onEvaluationComplete(evaluation);
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evaluator Information */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Information</CardTitle>
          </CardHeader>
          <CardContent>
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