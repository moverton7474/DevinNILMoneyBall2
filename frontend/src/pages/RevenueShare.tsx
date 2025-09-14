import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { DollarSign, Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

interface RevenueShareData {
  team: {
    id: number
    name: string
    revenue_share_cap: number
    current_revenue_share: number
  }
  revenue_share_cap: number
  total_allocated: number
  remaining_cap: number
  allocations: any[]
  compliance_status: string
}

const RevenueShare = () => {
  const [revenueShareData, setRevenueShareData] = useState<RevenueShareData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRevenueShareData()
  }, [])

  const fetchRevenueShareData = async () => {
    try {
      const response = await axios.get(`${API_URL}/revenue-share/team/1`)
      setRevenueShareData(response.data)
    } catch (error) {
      console.error('Failed to fetch revenue share data:', error)
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

  const capUtilization = revenueShareData
    ? (revenueShareData.total_allocated / revenueShareData.revenue_share_cap) * 100
    : 0

  const isOverCap = revenueShareData?.compliance_status === 'over_cap'

  const pieData = [
    { name: 'Allocated', value: revenueShareData?.total_allocated || 0, color: '#8884d8' },
    { name: 'Remaining', value: revenueShareData?.remaining_cap || 0, color: '#82ca9d' }
  ]

  const allocationsByPosition = revenueShareData?.allocations?.reduce((acc: any, allocation: any) => {
    const position = allocation.athlete?.position || 'Unknown'
    if (!acc[position]) {
      acc[position] = { position, total: 0, count: 0 }
    }
    acc[position].total += allocation.allocation_amount
    acc[position].count += 1
    return acc
  }, {}) || {}

  const positionData = Object.values(allocationsByPosition)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Revenue Share Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Allocation
        </Button>
      </div>

      {/* Revenue Share Cap Overview */}
      <Card className={isOverCap ? 'border-red-500' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Share Cap Status
              </CardTitle>
              <CardDescription>
                {revenueShareData?.team?.name || 'Team'} - 2024-25 Academic Year
              </CardDescription>
            </div>
            <Badge
              className={isOverCap ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
            >
              {isOverCap ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Over Cap
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Compliant
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Revenue Share Cap</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(revenueShareData?.revenue_share_cap || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Total Allocated</p>
                <p className={`text-2xl font-bold ${isOverCap ? 'text-red-600' : 'text-green-600'}`}>
                  ${(revenueShareData?.total_allocated || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Remaining Cap</p>
                <p className={`text-2xl font-bold ${isOverCap ? 'text-red-600' : 'text-green-600'}`}>
                  ${(revenueShareData?.remaining_cap || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cap Utilization</span>
                <span className={isOverCap ? 'text-red-600' : 'text-green-600'}>
                  {capUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(capUtilization, 100)}
                className={`h-3 ${isOverCap ? 'bg-red-100' : ''}`}
              />
              {isOverCap && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Team is over the revenue share cap by ${Math.abs(revenueShareData?.remaining_cap || 0).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cap Allocation</CardTitle>
            <CardDescription>Visual breakdown of revenue share usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocations by Position</CardTitle>
            <CardDescription>Revenue share distribution across positions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="position" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Allocations</CardTitle>
          <CardDescription>Detailed breakdown of revenue share allocations</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueShareData?.allocations && revenueShareData.allocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Athlete</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Position</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Allocation Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Percentage</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Academic Year</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Title IX</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueShareData.allocations.map((allocation, index) => (
                    <tr key={allocation.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {allocation.athlete?.name || 'Unknown'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {allocation.athlete?.position || 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-semibold">
                        ${allocation.allocation_amount.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {allocation.allocation_percentage?.toFixed(2)}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {allocation.academic_year}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge className={
                          allocation.status === 'approved' ? 'bg-green-100 text-green-800' :
                          allocation.status === 'proposed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {allocation.status}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {allocation.title_ix_compliant ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No revenue share allocations found</p>
              <p className="text-gray-400 text-sm mt-2">
                Start by creating revenue share allocations for your athletes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Share Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Share Guidelines</CardTitle>
          <CardDescription>Key information about revenue sharing compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">2024-25 Revenue Share Rules</h4>
              <ul className="space-y-2 text-sm">
                <li>• Maximum cap: $20.5 million per school</li>
                <li>• Must comply with Title IX requirements</li>
                <li>• Back-pay eligible for certain athletes</li>
                <li>• Quarterly reporting required</li>
                <li>• No minimum allocation required</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Compliance Checklist</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Under revenue share cap
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Title IX compliance verified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Academic eligibility confirmed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Tax implications documented
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RevenueShare
