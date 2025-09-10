const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
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
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP error! status: ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
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

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }

  // Athletes endpoints
  async getAthletes(): Promise<ApiResponse<any[]>> {
    return this.get('/athletes');
  }

  async createAthlete(athlete: any): Promise<ApiResponse<{ message: string; id: number }>> {
    return this.post('/athletes', athlete);
  }

  // Moneyball endpoints
  async optimizeRoster(data: {
    budgetTier: string;
    positionRequirements: Record<string, number>;
  }): Promise<ApiResponse<any>> {
    return this.post('/moneyball/optimize', data);
  }

  async evaluatePlayer(athleteId: number, budgetTier: string): Promise<ApiResponse<any>> {
    return this.post(`/moneyball/evaluate/${athleteId}`, { budgetTier });
  }

  async baronHopsonAnalysis(data: {
    position?: string;
    totalTackles?: number;
    soloTackles?: number;
    gamesPlayed?: number;
    marketValue?: number;
    transferFrom?: string;
    previousSchool?: string;
    conference?: string;
  }): Promise<ApiResponse<any>> {
    return this.post('/moneyball/baron-hopson-analysis', data);
  }

  // Market intelligence endpoints
  async getMarketOpportunityMatrix(budgetTier?: string): Promise<ApiResponse<any>> {
    const params = budgetTier ? `?budgetTier=${budgetTier}` : '';
    return this.get(`/market/opportunity-matrix${params}`);
  }

  async getPriceAlerts(): Promise<ApiResponse<any[]>> {
    return this.get('/market/price-alerts');
  }

  async getCompetitiveIntelligence(): Promise<ApiResponse<any>> {
    return this.get('/market/competitive-intelligence');
  }
}

export const apiClient = new ApiClient();