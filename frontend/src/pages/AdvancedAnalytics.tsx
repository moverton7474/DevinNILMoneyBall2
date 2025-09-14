import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, Users, DollarSign } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Athlete {
  id: number
  name: string
  position: string
  baron_hopson_score: number
}

interface Prediction {
  predicted_score: number
  trend: string
  confidence_interval: [number, number]
  risk_factors: string[]
}

interface Trends {
  trends: {
    overall_trend: number
    performance_trend: number
    potential_trend: number
    marketability_trend: number
  }
  stability_rating: string
  strongest_dimension: {
    area: string
    score: number
  }
  weakest_dimension: {
    area: string
    score: number
  }
}

interface Benchmark {
  comparison_scope: string
  percentiles: {
    baron_hopson_score: number
  }
  performance_tier: string
  score_gap_to_top: number
}

interface ROIProjections {
  investment_projections: Array<{
    investment: number
    roi_percentage: number
    projected_value: number
  }>
  optimal_investment: {
    investment: number
    roi_percentage: number
  }
}

export default function AdvancedAnalytics() {
  const [selectedAthlete, setSelectedAthlete] = useState<number | null>(null)
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [trends, setTrends] = useState<Trends | null>(null)
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null)
  const [roiProjections, setRoiProjections] = useState<ROIProjections | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAthletes()
  }, [])

  const fetchAthletes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/athletes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAthletes(response.data)
    } catch (error) {
      console.error('Failed to fetch athletes:', error)
    }
  }

  const fetchAdvancedAnalytics = async (athleteId: number) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      
      const [predictionRes, trendsRes, benchmarkRes, roiRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/predict-performance/${athleteId}`, { headers }),
        axios.get(`${API_URL}/api/analytics/performance-trends/${athleteId}`, { headers }),
        axios.get(`${API_URL}/api/analytics/comparative-benchmark/${athleteId}?scope=position`, { headers }),
        axios.get(`${API_URL}/api/analytics/roi-projections/${athleteId}`, { headers })
      ])
      
      setPrediction(predictionRes.data)
      setTrends(trendsRes.data)
      setBenchmark(benchmarkRes.data)
      setRoiProjections(roiRes.data)
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Baron Hopson Analytics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Athlete for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(value) => {
            const athleteId = parseInt(value)
            setSelectedAthlete(athleteId)
            fetchAdvancedAnalytics(athleteId)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an athlete..." />
            </SelectTrigger>
            <SelectContent>
              {athletes.map((athlete) => (
                <SelectItem key={athlete.id} value={athlete.id.toString()}>
                  {athlete.name} - {athlete.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAthlete && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Prediction
                </CardTitle>
                <CardDescription>12-month forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">{prediction.predicted_score}</p>
                    <p className="text-sm text-gray-600">Predicted Baron Hopson Score</p>
                  </div>
                  <div>
                    <p className="text-lg">Trend: <span className="font-semibold capitalize">{prediction.trend}</span></p>
                    <p className="text-sm text-gray-600">
                      Confidence: {prediction.confidence_interval[0].toFixed(1)} - {prediction.confidence_interval[1].toFixed(1)}
                    </p>
                  </div>
                  {prediction.risk_factors.length > 0 && (
                    <div>
                      <p className="font-semibold text-red-600">Risk Factors:</p>
                      <ul className="text-sm text-red-600">
                        {prediction.risk_factors.map((risk, idx) => (
                          <li key={idx}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {benchmark && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Peer Comparison
                </CardTitle>
                <CardDescription>{benchmark.comparison_scope}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">{benchmark.percentiles.baron_hopson_score}%</p>
                    <p className="text-sm text-gray-600">Percentile Ranking</p>
                  </div>
                  <div>
                    <p className="font-semibold">{benchmark.performance_tier}</p>
                    <p className="text-sm text-gray-600">Performance Tier</p>
                  </div>
                  <div>
                    <p className="text-lg">Gap to #1: {benchmark.score_gap_to_top.toFixed(1)} points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {trends && trends.trends && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends Analysis</CardTitle>
                <CardDescription>Historical performance across dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-lg font-bold">{trends.trends.overall_trend > 0 ? '+' : ''}{trends.trends.overall_trend.toFixed(3)}</p>
                    <p className="text-sm text-gray-600">Overall</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{trends.trends.performance_trend > 0 ? '+' : ''}{trends.trends.performance_trend.toFixed(3)}</p>
                    <p className="text-sm text-gray-600">Performance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{trends.trends.potential_trend > 0 ? '+' : ''}{trends.trends.potential_trend.toFixed(3)}</p>
                    <p className="text-sm text-gray-600">Potential</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{trends.trends.marketability_trend > 0 ? '+' : ''}{trends.trends.marketability_trend.toFixed(3)}</p>
                    <p className="text-sm text-gray-600">Marketability</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{trends.stability_rating}</p>
                    <p className="text-sm text-gray-600">Stability</p>
                  </div>
                </div>
                <div>
                  <p><strong>Strongest Area:</strong> {trends.strongest_dimension.area} ({trends.strongest_dimension.score})</p>
                  <p><strong>Development Area:</strong> {trends.weakest_dimension.area} ({trends.weakest_dimension.score})</p>
                </div>
              </CardContent>
            </Card>
          )}

          {roiProjections && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Investment ROI Projections
                </CardTitle>
                <CardDescription>Projected returns for different investment levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roiProjections.investment_projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="investment" tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                    <YAxis />
                    <Tooltip formatter={(value: any, name) => [
                      name === 'roi_percentage' ? `${Number(value).toFixed(1)}%` : `$${Number(value).toLocaleString()}`,
                      name === 'roi_percentage' ? 'ROI %' : 'Projected Value'
                    ]} />
                    <Bar dataKey="roi_percentage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4">
                  <p><strong>Optimal Investment:</strong> ${roiProjections.optimal_investment.investment.toLocaleString()} 
                     (ROI: {roiProjections.optimal_investment.roi_percentage.toFixed(1)}%)</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading advanced analytics...</p>
        </div>
      )}
    </div>
  )
}
