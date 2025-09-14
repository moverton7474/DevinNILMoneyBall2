import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  BarChart3,
  Eye,
  Star
} from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

interface ReportCard {
  id: string
  title: string
  description: string
  icon: any
  access_roles: string[]
  last_generated?: string
  is_favorite?: boolean
}

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30')
  const [isLoading, setIsLoading] = useState(false)

  const reportCards: ReportCard[] = [
    {
      id: 'baron-roi',
      title: 'Baron Hopson ROI Analysis',
      description: 'Rank players by value-per-dollar with 6.57x target analysis',
      icon: TrendingUp,
      access_roles: ['admin', 'coach']
    },
    {
      id: 'recruiting-pipeline',
      title: 'Weekly Recruiting Pipeline',
      description: 'New portal entries, competition tracking, and recommendations',
      icon: Users,
      access_roles: ['coach', 'admin']
    },
    {
      id: 'budget-forecast',
      title: 'Budget Utilization & Forecast',
      description: 'Current allocation, burn rate, and year-end projections',
      icon: DollarSign,
      access_roles: ['admin', 'finance']
    },
    {
      id: 'position-performance',
      title: 'Position Group Performance',
      description: 'Average NIL cost, performance metrics, and depth analysis',
      icon: BarChart3,
      access_roles: ['coach', 'admin']
    },
    {
      id: 'compliance-academic',
      title: 'Compliance & Academic',
      description: 'NIL compliance, academic eligibility, and NCAA risk indicators',
      icon: Shield,
      access_roles: ['admin', 'compliance']
    },
    {
      id: 'social-roi',
      title: 'Social Media ROI',
      description: 'Follower growth, engagement, and social NIL value analysis',
      icon: TrendingUp,
      access_roles: ['admin', 'marketing']
    },
    {
      id: 'competitive-intel',
      title: 'Competitive Intelligence',
      description: 'Conference NIL spend, recruiting wins/losses, market share',
      icon: Eye,
      access_roles: ['admin']
    },
    {
      id: 'executive-summary',
      title: 'Monthly Executive Summary',
      description: 'KPIs, success metrics, and executive recommendations',
      icon: FileText,
      access_roles: ['admin']
    }
  ]

  const filteredReports = reportCards.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewReport = (reportId: string) => {
    window.location.href = `/reports/${reportId}`
  }

  const handleExportReport = async (reportId: string, format: string) => {
    try {
      setIsLoading(true)
      const response = await axios.post(`${API_URL}/api/reports/export`, {
        type: reportId,
        format: format,
        filters: { date_range: dateRange }
      })
      console.log('Export response:', response.data)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Icon className="w-8 h-8 text-blue-600" />
                  {report.is_favorite && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {report.access_roles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewReport(report.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportReport(report.id, 'pdf')}
                      disabled={isLoading}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default Reports
