import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { DollarSign, Plus, Calendar, Building, CheckCircle, XCircle, Clock } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface NILDeal {
  id: number
  athlete_id: number
  deal_type: string
  brand_name: string
  deal_value: number
  deal_length_months: number
  status: string
  compliance_status: string
  title_ix_compliant: boolean
  created_at: string
  athlete?: {
    name: string
    position: string
    year: string
  }
}

const NILDeals = () => {
  const [deals, setDeals] = useState<NILDeal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchNILDeals()
  }, [])

  const fetchNILDeals = async () => {
    try {
      const response = await axios.get(`${API_URL}/nil-deals`)
      setDeals(response.data)
    } catch (error) {
      console.error('Failed to fetch NIL deals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      terminated: 'bg-red-100 text-red-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getDealTypeColor = (type: string) => {
    const colors = {
      endorsement: 'bg-purple-100 text-purple-800',
      appearance: 'bg-blue-100 text-blue-800',
      social_media: 'bg-pink-100 text-pink-800',
      merchandise: 'bg-green-100 text-green-800',
      autograph: 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredDeals = selectedStatus === 'all' 
    ? deals 
    : deals.filter(deal => deal.status === selectedStatus)

  const totalDealValue = deals.reduce((sum, deal) => sum + deal.deal_value, 0)
  const activeDealValue = deals.filter(d => d.status === 'active').reduce((sum, deal) => sum + deal.deal_value, 0)

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
        <h1 className="text-3xl font-bold text-gray-900">NIL Deals</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add NIL Deal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold">{deals.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${totalDealValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Value</p>
                <p className="text-2xl font-bold">${activeDealValue.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Deal Value</p>
                <p className="text-2xl font-bold">
                  ${deals.length > 0 ? Math.round(totalDealValue / deals.length).toLocaleString() : '0'}
                </p>
              </div>
              <Building className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              All
            </Button>
            <Button
              variant={selectedStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={selectedStatus === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('completed')}
            >
              Completed
            </Button>
            <Button
              variant={selectedStatus === 'terminated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('terminated')}
            >
              Terminated
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NIL Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{deal.athlete?.name || 'Unknown Athlete'}</CardTitle>
                  <CardDescription>
                    {deal.athlete?.position} • {deal.athlete?.year}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusBadge(deal.status)}>
                    {deal.status}
                  </Badge>
                  <Badge className={getDealTypeColor(deal.deal_type)}>
                    {deal.deal_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">{deal.brand_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Deal Value</p>
                    <p className="text-xl font-bold text-green-600">
                      ${deal.deal_value.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-lg font-semibold">
                      {deal.deal_length_months} months
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {getComplianceIcon(deal.compliance_status)}
                    <span className="text-sm text-gray-600">
                      {deal.compliance_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {deal.title_ix_compliant ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-600">Title IX</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(deal.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No NIL deals found</p>
            <p className="text-gray-400 text-sm mt-2">
              {selectedStatus === 'all' 
                ? 'No NIL deals have been created yet'
                : `No ${selectedStatus} deals found`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NILDeals
