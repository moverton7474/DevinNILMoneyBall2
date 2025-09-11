import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface OptimizationResult {
  total_budget: number
  total_allocated: number
  athlete_allocations: any[]
  optimization_summary: {
    top_performers: any[]
    average_score: number
    budget_efficiency: number
  }
}

const Analytics = () => {
  const [budget, setBudget] = useState('20500000')
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const optimizeRoster = async () => {
    setIsOptimizing(true)
    try {
      const response = await axios.post(`${API_URL}/analytics/optimize-roster/1?budget=${budget}`)
      setOptimizationResult(response.data)
    } catch (error) {
      console.error('Failed to optimize roster:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const allocationData = optimizationResult?.athlete_allocations?.slice(0, 10).map(athlete => ({
    name: athlete.athlete_name,
    score: athlete.baron_hopson_score,
    allocation: athlete.recommended_allocation,
    position: athlete.position
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Baron Hopson Analytics</h1>
      </div>

      {/* Roster Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Roster Budget Optimization
          </CardTitle>
          <CardDescription>
            Optimize budget allocation using Baron Hopson methodology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Budget ($)
              </label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter total budget"
              />
            </div>
            <Button onClick={optimizeRoster} disabled={isOptimizing}>
              {isOptimizing ? 'Optimizing...' : 'Optimize Roster'}
            </Button>
          </div>

          {optimizationResult && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Budget</p>
                        <p className="text-2xl font-bold">
                          ${optimizationResult.total_budget.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Allocated</p>
                        <p className="text-2xl font-bold">
                          ${optimizationResult.total_allocated.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Budget Efficiency</p>
                        <p className="text-2xl font-bold">
                          {optimizationResult.optimization_summary.budget_efficiency.toFixed(2)}
                        </p>
                      </div>
                      <Calculator className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Allocation Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Allocation Recommendations</CardTitle>
                  <CardDescription>
                    Budget allocation based on Baron Hopson scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={allocationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          name === 'allocation' ? `$${value.toLocaleString()}` : value,
                          name === 'allocation' ? 'Allocation' : 'Baron Hopson Score'
                        ]}
                      />
                      <Bar dataKey="allocation" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Allocations Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Allocation Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Rank</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Athlete</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Position</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Baron Hopson Score</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Recommended Allocation</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">NIL Value</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Revenue Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optimizationResult.athlete_allocations.slice(0, 15).map((athlete, index) => (
                          <tr key={athlete.athlete_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {athlete.athlete_name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{athlete.position}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              {athlete.baron_hopson_score.toFixed(1)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">
                              ${athlete.recommended_allocation.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              ${athlete.nil_value.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              ${athlete.revenue_share_value.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Baron Hopson Methodology Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Baron Hopson Methodology</CardTitle>
          <CardDescription>
            Understanding the valuation framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Scoring Components</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Performance (40%):</strong> Position-specific stats and achievements</li>
                <li><strong>Potential (25%):</strong> Age, physical attributes, trajectory</li>
                <li><strong>Marketability (20%):</strong> Position appeal, performance visibility</li>
                <li><strong>Leadership (10%):</strong> Team role, experience, character</li>
                <li><strong>Academic (5%):</strong> GPA, academic honors, eligibility</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Position Multipliers</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>QB:</strong> 1.5x (highest impact)</li>
                <li><strong>RB, WR:</strong> 1.2x (skill positions)</li>
                <li><strong>LB, DB:</strong> 1.1x (defensive playmakers)</li>
                <li><strong>TE, DL:</strong> 1.0x (standard)</li>
                <li><strong>OL:</strong> 0.9x (less visible impact)</li>
                <li><strong>K, P:</strong> 0.6-0.7x (specialists)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics
