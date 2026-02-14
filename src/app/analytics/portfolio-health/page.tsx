'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { analyticsAPI } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  MoreVertical
} from 'lucide-react'

interface PortfolioHealthData {
  id: string
  name: string
  health_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  status: 'healthy' | 'warning' | 'critical'
  last_updated: string
  metrics: {
    budget_variance: number
    schedule_variance: number
    resource_utilization: number
    quality_score: number
    stakeholder_satisfaction: number
  }
}

interface HealthTrend {
  date: string
  overall_health: number
  project_health: number
  financial_health: number
  resource_health: number
}

const PortfolioHealthPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [healthData, setHealthData] = useState<PortfolioHealthData[]>([])
  const [trends, setTrends] = useState<HealthTrend[]>([])
  const [overallStats, setOverallStats] = useState<any>(null)
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchPortfolioHealthData = async () => {
    try {
      setLoading(true)
      console.log('Fetching portfolio health data...')
      
      // Fetch portfolio health data
      const healthResponse = await analyticsAPI.getPortfolioHealthData()
      console.log('Portfolio health response:', healthResponse.data)
      setHealthData(healthResponse.data.results || healthResponse.data)
      
      // Fetch portfolio health trends
      const trendsResponse = await analyticsAPI.getPortfolioHealth()
      console.log('Portfolio health trends response:', trendsResponse.data)
      setTrends(trendsResponse.data.results || trendsResponse.data)
      
      // Calculate overall stats
      const data = healthResponse.data.results || healthResponse.data
      const stats = {
        total_projects: data.length,
        healthy_projects: data.filter((p: PortfolioHealthData) => p.status === 'healthy').length,
        warning_projects: data.filter((p: PortfolioHealthData) => p.status === 'warning').length,
        critical_projects: data.filter((p: PortfolioHealthData) => p.status === 'critical').length,
        average_health_score: data.reduce((sum: number, p: PortfolioHealthData) => sum + p.health_score, 0) / data.length
      }
      setOverallStats(stats)
      
    } catch (error: any) {
      console.error('Error fetching portfolio health data:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      // Handle 404 errors specifically
      if (error.response?.status === 404) {
        console.log('Portfolio health endpoints not found, using mock data')
        
        // Mock data for development
        const mockData: PortfolioHealthData[] = [
          {
            id: '1',
            name: 'Website Redesign',
            health_score: 92,
            risk_level: 'low',
            status: 'healthy',
            last_updated: '2024-12-20',
            metrics: {
              budget_variance: 5,
              schedule_variance: 2,
              resource_utilization: 85,
              quality_score: 90,
              stakeholder_satisfaction: 88
            }
          },
          {
            id: '2',
            name: 'Mobile App Development',
            health_score: 78,
            risk_level: 'medium',
            status: 'warning',
            last_updated: '2024-12-19',
            metrics: {
              budget_variance: 15,
              schedule_variance: 8,
              resource_utilization: 92,
              quality_score: 75,
              stakeholder_satisfaction: 80
            }
          },
          {
            id: '3',
            name: 'Database Migration',
            health_score: 45,
            risk_level: 'high',
            status: 'critical',
            last_updated: '2024-12-18',
            metrics: {
              budget_variance: 25,
              schedule_variance: 20,
              resource_utilization: 110,
              quality_score: 60,
              stakeholder_satisfaction: 55
            }
          },
          {
            id: '4',
            name: 'Security Audit',
            health_score: 88,
            risk_level: 'low',
            status: 'healthy',
            last_updated: '2024-12-20',
            metrics: {
              budget_variance: 3,
              schedule_variance: -5,
              resource_utilization: 78,
              quality_score: 92,
              stakeholder_satisfaction: 90
            }
          }
        ]
        
        setHealthData(mockData)
        
        const mockTrends: HealthTrend[] = [
          { date: '2024-11-01', overall_health: 82, project_health: 78, financial_health: 85, resource_health: 83 },
          { date: '2024-11-15', overall_health: 80, project_health: 75, financial_health: 83, resource_health: 82 },
          { date: '2024-12-01', overall_health: 78, project_health: 73, financial_health: 81, resource_health: 80 },
          { date: '2024-12-15', overall_health: 76, project_health: 71, financial_health: 79, resource_health: 78 }
        ]
        setTrends(mockTrends)
        
        const stats = {
          total_projects: mockData.length,
          healthy_projects: mockData.filter(p => p.status === 'healthy').length,
          warning_projects: mockData.filter(p => p.status === 'warning').length,
          critical_projects: mockData.filter(p => p.status === 'critical').length,
          average_health_score: mockData.reduce((sum, p) => sum + p.health_score, 0) / mockData.length
        }
        setOverallStats(stats)
        
        return
      }
      
      toast.error('Failed to fetch portfolio health data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchPortfolioHealthData()
    setRefreshing(false)
    toast.success('Portfolio health data refreshed')
  }

  useEffect(() => {
    fetchPortfolioHealthData()
  }, [])

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />
      default: return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const filteredHealthData = healthData.filter(item => 
    selectedRiskLevel === 'all' || item.risk_level === selectedRiskLevel
  )

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Health</h1>
              <p className="text-gray-600 mt-2">Monitor and analyze project portfolio health metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select 
                  value={selectedRiskLevel} 
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="border-none outline-none text-sm"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          {overallStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{overallStats.total_projects}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Healthy</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{overallStats.healthy_projects}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Warning</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">{overallStats.warning_projects}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">{overallStats.critical_projects}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{Math.round(overallStats.average_health_score)}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Health Trends */}
          {trends.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Trends</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Overall Health</span>
                    <span className="text-sm font-medium">
                      {trends[trends.length - 1]?.overall_health}%
                      {trends.length > 1 && (
                        <span className={`ml-2 ${
                          trends[trends.length - 1].overall_health > trends[0].overall_health 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trends[trends.length - 1].overall_health > trends[0].overall_health ? '↑' : '↓'}
                          {Math.abs(trends[trends.length - 1].overall_health - trends[0].overall_health)}%
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {trends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gray-200 rounded-full h-2"
                        style={{ marginLeft: index === 0 ? '0' : '2px' }}
                      >
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${trend.overall_health}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Project Health</span>
                    <span className="text-sm font-medium">{trends[trends.length - 1]?.project_health}%</span>
                  </div>
                  <div className="flex gap-1">
                    {trends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gray-200 rounded-full h-2"
                        style={{ marginLeft: index === 0 ? '0' : '2px' }}
                      >
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${trend.project_health}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Financial Health</span>
                    <span className="text-sm font-medium">{trends[trends.length - 1]?.financial_health}%</span>
                  </div>
                  <div className="flex gap-1">
                    {trends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gray-200 rounded-full h-2"
                        style={{ marginLeft: index === 0 ? '0' : '2px' }}
                      >
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${trend.financial_health}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Resource Health</span>
                    <span className="text-sm font-medium">{trends[trends.length - 1]?.resource_health}%</span>
                  </div>
                  <div className="flex gap-1">
                    {trends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-gray-200 rounded-full h-2"
                        style={{ marginLeft: index === 0 ? '0' : '2px' }}
                      >
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${trend.resource_health}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Health Details */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Project Health Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget Variance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule Variance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quality Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHealthData.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(project.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">Updated {project.last_updated}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(project.health_score)}`}>
                          {project.health_score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(project.risk_level)}`}>
                          {project.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className={project.metrics.budget_variance > 10 ? 'text-red-600' : 'text-green-600'}>
                            {project.metrics.budget_variance > 0 ? '+' : ''}{project.metrics.budget_variance}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className={project.metrics.schedule_variance > 10 ? 'text-red-600' : 'text-green-600'}>
                            {project.metrics.schedule_variance > 0 ? '+' : ''}{project.metrics.schedule_variance}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                project.metrics.resource_utilization > 100 ? 'bg-red-500' : 
                                project.metrics.resource_utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(project.metrics.resource_utilization, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{project.metrics.resource_utilization}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                project.metrics.quality_score >= 80 ? 'bg-green-500' : 
                                project.metrics.quality_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${project.metrics.quality_score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{project.metrics.quality_score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                <Download className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Export Health Report</p>
                  <p className="text-sm text-gray-500">Download portfolio health data</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Risk Assessment</p>
                  <p className="text-sm text-gray-500">Analyze project risks</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Health Analytics</p>
                  <p className="text-sm text-gray-500">Deep dive into metrics</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default PortfolioHealthPage
