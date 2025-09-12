import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Plus, Search, Edit, TrendingUp } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Athlete {
  id: number
  name: string
  position: string
  year: string
  height?: string
  weight?: number
  baron_hopson_score: number
  market_value: number
  nil_value: number
  revenue_share_value: number
  is_active: boolean
  transfer_portal_status: string
}

const Athletes = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAthletes()
  }, [])

  useEffect(() => {
    filterAthletes()
  }, [athletes, searchTerm, selectedPosition])

  const fetchAthletes = async () => {
    try {
      const response = await axios.get(`${API_URL}/athletes`)
      setAthletes(response.data)
    } catch (error) {
      console.error('Failed to fetch athletes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAthletes = () => {
    let filtered = athletes

    if (searchTerm) {
      filtered = filtered.filter(athlete =>
        athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.position.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedPosition !== 'all') {
      filtered = filtered.filter(athlete => athlete.position === selectedPosition)
    }

    setFilteredAthletes(filtered)
  }

  const evaluateAthlete = async (athleteId: number) => {
    try {
      await axios.post(`${API_URL}/analytics/evaluate-athlete/${athleteId}`)
      fetchAthletes() // Refresh the list
    } catch (error) {
      console.error('Failed to evaluate athlete:', error)
    }
  }

  const getPositions = () => {
    const positions = [...new Set(athletes.map(a => a.position))]
    return positions.sort()
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      enrolled: 'bg-green-100 text-green-800',
      portal: 'bg-yellow-100 text-yellow-800',
      transferred: 'bg-red-100 text-red-800'
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
        <h1 className="text-3xl font-bold text-gray-900">Athletes</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Athlete
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search athletes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Positions</option>
                {getPositions().map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Athletes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAthletes.map((athlete) => (
          <Card key={athlete.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{athlete.name}</CardTitle>
                  <CardDescription>
                    {athlete.position} • {athlete.year}
                  </CardDescription>
                </div>
                <Badge className={getStatusBadge(athlete.transfer_portal_status)}>
                  {athlete.transfer_portal_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Baron Hopson Score</span>
                  <span className="font-bold text-lg text-blue-600">
                    {athlete.baron_hopson_score.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Market Value</span>
                  <span className="font-semibold">
                    ${athlete.market_value.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">NIL Value</span>
                  <span className="font-semibold">
                    ${athlete.nil_value.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue Share</span>
                  <span className="font-semibold">
                    ${athlete.revenue_share_value.toLocaleString()}
                  </span>
                </div>

                {athlete.height && athlete.weight && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Physical</span>
                    <span className="text-sm">
                      {athlete.height}, {athlete.weight} lbs
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => evaluateAthlete(athlete.id)}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Evaluate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAthletes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">No athletes found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search criteria or add new athletes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Athletes
