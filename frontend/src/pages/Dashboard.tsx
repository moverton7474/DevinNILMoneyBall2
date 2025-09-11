import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface DashboardData {
  total_athletes: number
  average_baron_hopson_score: number
  total_nil_value: number
  total_revenue_share_value: number
  revenue_share_cap_remaining: number
  position_breakdown: Record<string, any>
  top_performers: any[]
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/team-dashboard/1`)
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const positionData = dashboardData?.position_breakdown 
    ? Object.entries(dashboardData.position_breakdown).map(([position, data]: [string, any]) => ({
        position,
        count: data.count,
        avgScore: data.avg_score,
        totalValue: data.total_value
      }))
    : []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Athletes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_athletes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Baron Hopson Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.average_baron_hopson_score?.toFixed(1) || '0.0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total NIL Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(dashboardData?.total_nil_value || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Share Remaining</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(dashboardData?.revenue_share_cap_remaining || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Position Breakdown</CardTitle>
            <CardDescription>Athletes by position</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="position" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Value Distribution</CardTitle>
            <CardDescription>Total value by position</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={positionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ position, totalValue }) => `${position}: $${totalValue?.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalValue"
                >
                  {positionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Highest Baron Hopson scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.top_performers?.slice(0, 5).map((athlete, index) => (
              <div key={athlete.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{athlete.name}</p>
                    <p className="text-sm text-gray-600">{athlete.position} • {athlete.year}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{athlete.baron_hopson_score?.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Baron Hopson Score</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No athlete data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
