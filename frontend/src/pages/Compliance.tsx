import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Shield, FileText, AlertTriangle, CheckCircle, Download, Calendar } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ComplianceReport {
  id: number
  team_id: number
  report_type: string
  report_data: any
  generated_by: number
  generated_at: string
  status: string
}

interface TitleIXData {
  team_id: number
  total_nil_value: number
  total_revenue_share: number
  title_ix_compliant: boolean
  compliance_notes: string
}

const Compliance = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [titleIXData, setTitleIXData] = useState<TitleIXData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      const [reportsResponse, titleIXResponse] = await Promise.all([
        axios.get(`${API_URL}/compliance/reports`),
        axios.get(`${API_URL}/compliance/title-ix/1`)
      ])
      
      setReports(reportsResponse.data)
      setTitleIXData(titleIXResponse.data)
    } catch (error) {
      console.error('Failed to fetch compliance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getReportTypeBadge = (type: string) => {
    const typeColors = {
      nil_disclosure: 'bg-blue-100 text-blue-800',
      revenue_share: 'bg-green-100 text-green-800',
      title_ix: 'bg-purple-100 text-purple-800'
    }
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Title IX Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {titleIXData?.title_ix_compliant ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <div className="text-2xl font-bold">
                {titleIXData?.title_ix_compliant ? 'Compliant' : 'Non-Compliant'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total NIL Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(titleIXData?.total_nil_value || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Share Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(titleIXData?.total_revenue_share || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Title IX Compliance Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Title IX Compliance Analysis
          </CardTitle>
          <CardDescription>
            Detailed analysis of Title IX compliance across NIL and revenue share programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Overall Compliance Status</h4>
                <p className="text-sm text-gray-600">
                  {titleIXData?.compliance_notes || 'All deals and allocations reviewed for Title IX compliance'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {titleIXData?.title_ix_compliant ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-semibold">Compliant</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-semibold">Needs Review</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">NIL Program Compliance</h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Equal opportunity policies in place</li>
                  <li>• Gender-neutral deal structures</li>
                  <li>• Fair market value assessments</li>
                  <li>• Regular compliance audits</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">Revenue Share Compliance</h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Proportional allocation methodology</li>
                  <li>• Gender equity considerations</li>
                  <li>• Performance-based distributions</li>
                  <li>• Transparent reporting processes</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
          <CardDescription>
            Generated compliance reports and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">
                        {report.report_type.replace('_', ' ').toUpperCase()} Report
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Generated: {new Date(report.generated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getReportTypeBadge(report.report_type)}>
                      {report.report_type}
                    </Badge>
                    <Badge className={getStatusBadge(report.status)}>
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No compliance reports generated yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Generate your first compliance report to track NIL and revenue share compliance
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Checklist</CardTitle>
          <CardDescription>
            Essential compliance requirements and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">NIL Compliance</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">All NIL deals disclosed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Fair market value verified</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Title IX compliance reviewed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Tax implications documented</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Revenue Share Compliance</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Under $20.5M cap</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Allocation methodology documented</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Gender equity analysis complete</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Quarterly reporting submitted</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Compliance
