import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ArrowRightLeft, TrendingUp, Calendar, School } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface TransferPortalEntry {
  id: number
  athlete_id: number
  entry_date: string
  reason: string
  status: string
  target_schools: string[]
  baron_hopson_score_at_entry: number
  market_value_at_entry: number
  athlete: {
    name: string
    position: string
    year: string
  }
}

const TransferPortal = () => {
  const [entries, setEntries] = useState<TransferPortalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchTransferPortalEntries()
  }, [])

  const fetchTransferPortalEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/transfer-portal`)
      setEntries(response.data)
    } catch (error) {
      console.error('Failed to fetch transfer portal entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-yellow-100 text-yellow-800',
      committed: 'bg-green-100 text-green-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const filteredEntries = selectedStatus === 'all' 
    ? entries 
    : entries.filter(entry => entry.status === selectedStatus)

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
        <h1 className="text-3xl font-bold text-gray-900">Transfer Portal</h1>
        <Button>
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Add Portal Entry
        </Button>
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
              variant={selectedStatus === 'committed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('committed')}
            >
              Committed
            </Button>
            <Button
              variant={selectedStatus === 'withdrawn' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('withdrawn')}
            >
              Withdrawn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Portal Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{entry.athlete?.name || 'Unknown Athlete'}</CardTitle>
                  <CardDescription>
                    {entry.athlete?.position} • {entry.athlete?.year}
                  </CardDescription>
                </div>
                <Badge className={getStatusBadge(entry.status)}>
                  {entry.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Entered: {new Date(entry.entry_date).toLocaleDateString()}</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                  <p className="text-sm text-gray-600">{entry.reason}</p>
                </div>

                {entry.target_schools && entry.target_schools.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <School className="w-4 h-4" />
                      Target Schools:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {entry.target_schools.map((school, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {school}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Baron Hopson Score</p>
                    <p className="font-bold text-lg text-blue-600">
                      {entry.baron_hopson_score_at_entry?.toFixed(1) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Market Value</p>
                    <p className="font-semibold">
                      ${(entry.market_value_at_entry || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No transfer portal entries found</p>
            <p className="text-gray-400 text-sm mt-2">
              {selectedStatus === 'all' 
                ? 'No athletes have entered the transfer portal yet'
                : `No ${selectedStatus} entries found`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transfer Portal Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Portal Analytics</CardTitle>
          <CardDescription>
            Insights and trends from transfer portal activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{entries.length}</p>
              <p className="text-sm text-gray-600">Total Entries</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {entries.filter(e => e.status === 'committed').length}
              </p>
              <p className="text-sm text-gray-600">Committed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {entries.filter(e => e.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Still Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TransferPortal
