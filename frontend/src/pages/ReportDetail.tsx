import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Download, 
  RefreshCw, 
  ArrowLeft,
  Calendar
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ReportDetail = () => {
  const { reportId } = useParams()
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    fetchReportData()
  }, [reportId])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_URL}/api/reports/${reportId}`)
      setReportData(response.data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/reports/export`, {
        type: reportId,
        format: format,
        filters: {}
      })
      console.log('Export response:', response.data)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const renderBaronROIReport = () => {
    if (!reportData?.data) return null

    const chartData = reportData.data.slice(0, 10).map((item: any) => ({
      name: item.name,
      roi: item.roi_ratio,
      investment: item.nil_investment
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{reportData.summary.total_athletes}</p>
                <p className="text-sm text-gray-600">Total Athletes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{reportData.summary.baron_gems_count}</p>
                <p className="text-sm text-gray-600">Baron Gems (6.0x+)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{reportData.summary.average_roi.toFixed(2)}x</p>
                <p className="text-sm text-gray-600">Average ROI</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 ROI Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="roi" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed ROI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Athlete</th>
                    <th className="text-left p-2">Position</th>
                    <th className="text-left p-2">Baron Score</th>
                    <th className="text-left p-2">NIL Investment</th>
                    <th className="text-left p-2">Market Value</th>
                    <th className="text-left p-2">ROI Ratio</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.slice(0, 20).map((item: any) => (
                    <tr key={item.athlete_id} className="border-b">
                      <td className="p-2 font-medium">{item.name}</td>
                      <td className="p-2">{item.position}</td>
                      <td className="p-2">{item.baron_hopson_score.toFixed(1)}</td>
                      <td className="p-2">${item.nil_investment.toLocaleString()}</td>
                      <td className="p-2">${item.market_value.toLocaleString()}</td>
                      <td className="p-2">{item.roi_ratio.toFixed(2)}x</td>
                      <td className="p-2">
                        {item.is_baron_gem ? (
                          <Badge className="bg-green-100 text-green-800">Baron Gem</Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderGenericReport = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getReportTitle = () => {
    const titles: { [key: string]: string } = {
      'baron-roi': 'Baron Hopson ROI Analysis',
      'recruiting-pipeline': 'Weekly Recruiting Pipeline',
      'budget-forecast': 'Budget Utilization & Forecast',
      'position-performance': 'Position Group Performance',
      'compliance-academic': 'Compliance & Academic',
      'social-roi': 'Social Media ROI',
      'competitive-intel': 'Competitive Intelligence',
      'executive-summary': 'Monthly Executive Summary'
    }
    return titles[reportId || ''] || 'Report Detail'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{getReportTitle()}</h1>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              Last updated: {lastRefresh.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReportData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {reportId === 'baron-roi' ? renderBaronROIReport() : renderGenericReport()}
    </div>
  )
}

export default ReportDetail
