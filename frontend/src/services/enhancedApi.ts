// Enhanced API Client for NIL Moneyball Platform
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Enhanced Type Definitions
export interface EnhancedAthlete {
  id: number;
  external_id: string;
  name: string;
  position: string;
  height?: number;
  weight?: number;
  hometown?: string;
  home_state?: string;
  high_school?: string;
  previous_school: string;
  conference: string;
  transfer_from: 'FCS' | 'Group5' | 'Power4';
  years_eligibility_remaining: number;
  market_value: number;
  portal_entry_date: string;
  days_in_portal: number;
  committed_to?: string;
  academic_info: {
    gpa?: number;
    sat_score?: number;
    act_score?: number;
    academic_major?: string;
    core_course_gpa?: number;
  };
  performance_stats: {
    games_played: number;
    games_started: number;
    total_tackles: number;
    solo_tackles: number;
    assisted_tackles: number;
    tackles_for_loss: number;
    sacks: number;
    interceptions: number;
    pass_breakups: number;
    forced_fumbles: number;
    fumble_recoveries: number;
    passing_yards: number;
    passing_tds: number;
    passing_completions: number;
    passing_attempts: number;
    passing_interceptions: number;
    rushing_yards: number;
    rushing_tds: number;
    rushing_attempts: number;
    receptions: number;
    receiving_yards: number;
    receiving_tds: number;
  };
  nil_metrics: {
    twitter_followers: number;
    instagram_followers: number;
    tiktok_followers: number;
    nil_engagement_score: number;
    estimated_nil_value: number;
  };
}

export interface EnhancedPlayerEvaluation {
  evaluation_id: number;
  production_score: number;
  efficiency_rating: number;
  positional_impact: number;
  adjusted_value: number;
  value_per_dollar: number;
  transfer_multiplier: number;
  baron_hopson_similarity: number;
  marketability_score: number;
  nil_roi_projection: number;
  ksu_specific_score?: number;
  recommendation: string;
  confidence_level: number;
  evaluation_date: string;
}

export interface KSUPlayerEvaluation {
  ksu_evaluation_id: number;
  final_ksu_score: number;
  recommendation: string;
  academic_fit_score: number;
  geographic_preference_score: number;
  culture_fit_score: number;
  development_potential_score: number;
  scheme_fit_score: number;
  immediate_impact_score: number;
  recruiting_priority: string;
  ksu_interest_level: string;
  likelihood_to_commit: number;
  evaluation_date: string;
}

export interface OptimizationResult {
  success: boolean;
  optimization_id: number;
  selected_players: Array<{
    athlete_id: number;
    external_id: string;
    name: string;
    position: string;
    previous_school: string;
    transfer_from: string;
    market_value: number;
    home_state?: string;
    gpa?: number;
    evaluation: EnhancedPlayerEvaluation;
  }>;
  optimization_summary: {
    total_cost: number;
    total_value: number;
    budget_utilization: number;
    competitive_advantage_score: number;
    avg_value_per_dollar: number;
    baron_hopson_profiles: number;
    fcs_transfers: number;
    roster_balance_score: number;
    nil_efficiency_rating: number;
  };
  position_breakdown: Record<string, number>;
  algorithm_details: {
    algorithm_used: string;
    total_players_evaluated: number;
    budget_tier: string;
    tier_config: any;
  };
}

export interface NILOpportunity {
  id: number;
  title: string;
  brand_name: string;
  opportunity_type: string;
  description?: string;
  compensation_amount: number;
  payment_structure: string;
  duration_months: number;
  position_requirements?: string[];
  follower_requirement: number;
  geographic_requirements?: string[];
  academic_requirements: number;
  applications_count: number;
  max_participants: number;
  application_deadline?: string;
  opportunity_start_date?: string;
  opportunity_end_date?: string;
  created_at: string;
}

export interface NILOpportunityMatch {
  opportunity_id: number;
  opportunity_title: string;
  brand_name: string;
  compensation_amount: number;
  matching_athletes: Array<{
    athlete_id: number;
    name: string;
    position: string;
    match_score: number;
    marketability_score: number;
    total_followers: number;
    gpa?: number;
    estimated_nil_value: number;
  }>;
  total_matches: number;
}

export interface BaronHopsonAnalysis {
  subject_profile: {
    name: string;
    position: string;
    transfer_from: string;
    market_value: number;
    production_score: number;
    value_per_dollar: number;
  };
  baron_hopson_baseline: {
    position: string;
    transfer_from: string;
    market_value: number;
    production_score: number;
    value_per_dollar: number;
  };
  similarity_analysis: {
    overall_similarity: number;
    position_match: boolean;
    transfer_type_match: boolean;
    value_efficiency_ratio: number;
    production_comparison: number;
    market_value_advantage: number;
  };
  detailed_breakdown: {
    tackles_per_game: number;
    baron_tackles_per_game: number;
    solo_percentage: number;
    baron_solo_percentage: number;
    transfer_multiplier: number;
    baron_transfer_multiplier: number;
  };
  investment_analysis: {
    cost_savings: number;
    roi_multiple: number;
    value_advantage: number;
    baron_advantage_baseline: number;
  };
  recommendations: {
    overall_recommendation: string;
    confidence_level: number;
    priority_ranking: string;
    action_items: string[];
  };
}

export interface ComplianceAudit {
  id: number;
  transaction_type: string;
  athlete_id?: number;
  institution_id?: number;
  action_description: string;
  financial_amount: number;
  compliance_status: string;
  pay_for_play_risk: string;
  recruiting_inducement_risk: string;
  market_value_variance: number;
  created_at: string;
  created_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface Institution {
  id: number;
  name: string;
  short_name: string;
  conference: string;
  division: string;
  budget_tier: string;
  academic_gpa_requirement: number;
  geographic_preference?: string;
  culture_weight: number;
  created_at: string;
}

export interface AnalyticsDashboard {
  overview: {
    total_athletes: number;
    total_evaluations: number;
    total_optimizations: number;
    baron_hopson_prospects: number;
  };
  position_breakdown: Array<{
    position: string;
    count: number;
    avg_market_value: number;
  }>;
  transfer_breakdown: Array<{
    transfer_from: string;
    count: number;
    avg_market_value: number;
  }>;
  baron_hopson_prospects: Array<{
    athlete_id: number;
    athlete_name: string;
    position: string;
    similarity_score: number;
    value_per_dollar: number;
    market_value: number;
  }>;
  budget_utilization: Array<{
    budget_tier: string;
    avg_utilization: number;
    avg_advantage_score: number;
  }>;
}

class EnhancedAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          error: errorData.error || `HTTP error! status: ${response.status}`,
          message: errorData.message 
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Enhanced API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; version: string; features: string[] }>> {
    return this.get('/health');
  }

  // Enhanced Athletes API
  async getAthletes(filters?: {
    page?: number;
    per_page?: number;
    position?: string;
    transfer_from?: string;
    min_market_value?: number;
    max_market_value?: number;
    home_state?: string;
  }): Promise<ApiResponse<{ athletes: EnhancedAthlete[]; pagination: any }>> {
    return this.get('/athletes', filters);
  }

  async createAthlete(athlete: Partial<EnhancedAthlete>): Promise<ApiResponse<{ message: string; athlete_id: number; external_id: string }>> {
    return this.post('/athletes', athlete);
  }

  async evaluateAthlete(
    athleteId: number, 
    params: { 
      budget_tier: string; 
      institution_id?: number; 
      evaluated_by?: string; 
    }
  ): Promise<ApiResponse<EnhancedPlayerEvaluation>> {
    return this.post(`/athletes/${athleteId}/evaluate`, params);
  }

  // KSU Integration API
  async ksuEvaluateAthlete(
    athleteId: number,
    evaluation: {
      academic_fit_score?: number;
      geographic_preference_score?: number;
      culture_fit_score?: number;
      development_potential_score?: number;
      scheme_fit_score?: number;
      immediate_impact_score?: number;
      depth_chart_position?: string;
      competition_for_position?: number;
      recruiting_priority?: string;
      ksu_interest_level?: string;
      likelihood_to_commit?: number;
      position_coach_notes?: string;
      coordinator_notes?: string;
      head_coach_notes?: string;
      evaluated_by: string;
    }
  ): Promise<ApiResponse<KSUPlayerEvaluation>> {
    return this.post(`/ksu/athletes/${athleteId}/evaluate`, evaluation);
  }

  // Enhanced Roster Optimization
  async optimizeRoster(params: {
    budget_tier: string;
    position_requirements: Record<string, number>;
    institution_id?: number;
    max_players?: number;
    academic_minimum?: number;
    geographic_preferences?: string[];
    optimized_by?: string;
  }): Promise<ApiResponse<OptimizationResult>> {
    return this.post('/roster/optimize', params);
  }

  // NIL Opportunities API
  async getNILOpportunities(filters?: {
    position?: string;
    min_compensation?: number;
    max_compensation?: number;
    opportunity_type?: string;
    status?: string;
  }): Promise<ApiResponse<{ opportunities: NILOpportunity[]; count: number }>> {
    return this.get('/nil/opportunities', filters);
  }

  async matchNILOpportunity(opportunityId: number): Promise<ApiResponse<NILOpportunityMatch>> {
    return this.post(`/nil/opportunities/${opportunityId}/match`);
  }

  // Baron Hopson Analysis
  async baronHopsonAnalysis(playerData: {
    name?: string;
    position?: string;
    transfer_from?: string;
    market_value?: number;
    previous_school?: string;
    conference?: string;
    games_played?: number;
    total_tackles?: number;
    solo_tackles?: number;
    assisted_tackles?: number;
    tackles_for_loss?: number;
    sacks?: number;
    home_state?: string;
    gpa?: number;
  }): Promise<ApiResponse<BaronHopsonAnalysis>> {
    return this.post('/baron-hopson/analysis', playerData);
  }

  // Compliance & Audit
  async getComplianceAudit(filters?: {
    page?: number;
    per_page?: number;
    transaction_type?: string;
    compliance_status?: string;
    athlete_id?: number;
  }): Promise<ApiResponse<{ audits: ComplianceAudit[]; pagination: any }>> {
    return this.get('/compliance/audit', filters);
  }

  // Institutions API
  async getInstitutions(): Promise<ApiResponse<{ institutions: Institution[]; count: number }>> {
    return this.get('/institutions');
  }

  // Analytics Dashboard
  async getAnalyticsDashboard(): Promise<ApiResponse<AnalyticsDashboard>> {
    return this.get('/analytics/dashboard');
  }
}

export const enhancedApiClient = new EnhancedAPIClient();