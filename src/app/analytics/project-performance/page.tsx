'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { analyticsAPI } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  MoreVertical,
  Award,
  Zap,
  Activity,
  Search,
  Eye
} from 'lucide-react'

interface ProjectPerformance {
  id: string
  name: string
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed'
  progress_percentage: number
  budget_utilization: number
  schedule_variance: number
  quality_score: number
  team_performance: number
  stakeholder_satisfaction: number
  start_date: string
  end_date: string
  actual_end_date?: string
  team_size: number
  budget: number
  actual_cost: number
  milestones_completed: number
  total_milestones: number
}

interface PerformanceMetrics {
  total_projects: number
  on_track_projects: number
  at_risk_projects: number
  delayed_projects: number
  completed_projects: number
  average_progress: number
  average_budget_utilization: number
  average_quality_score: number
  on_time_delivery_rate: number
  budget_variance_rate: number
}

const ProjectPerformancePage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectPerformance[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchProjectPerformanceData = async () => {
    try {
      setLoading(true)
      console.log('Fetching project performance data...')
      
      // Fetch project performance data
      const performanceResponse = await analyticsAPI.getProjectPerformance()
      console.log('Project performance response:', performanceResponse.data)
      setProjects(performanceResponse.data.results || performanceResponse.data)
      
      // Calculate metrics
      const data = performanceResponse.data.results || performanceResponse.data
      const calculatedMetrics: PerformanceMetrics = {
        total_projects: data.length,
        on_track_projects: data.filter((p: ProjectPerformance) => p.status === 'on_track').length,
        at_risk_projects: data.filter((p: ProjectPerformance) => p.status === 'at_risk').length,
        delayed_projects: data.filter((p: ProjectPerformance) => p.status === 'delayed').length,
        completed_projects: data.filter((p: ProjectPerformance) => p.status === 'completed').length,
        average_progress: data.reduce((sum: number, p: ProjectPerformance) => sum + p.progress_percentage, 0) / data.length,
        average_budget_utilization: data.reduce((sum: number, p: ProjectPerformance) => sum + p.budget_utilization, 0) / data.length,
        average_quality_score: data.reduce((sum: number, p: ProjectPerformance) => sum + p.quality_score, 0) / data.length,
        on_time_delivery_rate: (data.filter((p: ProjectPerformance) => p.status === 'completed' && !p.actual_end_date).length / data.filter((p: ProjectPerformance) => p.status === 'completed').length) * 100,
        budget_variance_rate: data.reduce((sum: number, p: ProjectPerformance) => sum + ((p.actual_cost - p.budget) / p.budget * 100), 0) / data.length
      }
      setMetrics(calculatedMetrics)
      
    } catch (error: any) {
      console.error('Error fetching project performance data:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      // Handle 404 errors specifically
      if (error.response?.status === 404) {
        console.log('Project performance endpoints not found, using mock data')
        
        // Mock data for development
        const mockData: ProjectPerformance[] = [
          {
            id: '1',
            name: 'E-commerce Platform',
            status: 'on_track',
            progress_percentage: 75,
            budget_utilization: 68,
            schedule_variance: 5,
            quality_score: 85,
            team_performance: 88,
            stakeholder_satisfaction: 82,
            start_date: '2024-01-15',
            end_date: '2024-06-30',
            team_size: 8,
            budget: 250000,
            actual_cost: 170000,
            milestones_completed: 6,
            total_milestones: 8
          },
          {
            id: '2',
            name: 'Mobile Banking App',
            status: 'at_risk',
            progress_percentage: 45,
            budget_utilization: 78,
            schedule_variance: 15,
            quality_score: 72,
            team_performance: 75,
            stakeholder_satisfaction: 68,
            start_date: '2024-02-01',
            end_date: '2024-08-15',
            team_size: 6,
            budget: 180000,
            actual_cost: 140000,
            milestones_completed: 3,
            total_milestones: 7
          },
          {
            id: '3',
            name: 'Data Migration',
            status: 'delayed',
            progress_percentage: 60,
            budget_utilization: 95,
            schedule_variance: 25,
            quality_score: 78,
            team_performance: 70,
            stakeholder_satisfaction: 65,
            start_date: '2023-11-01',
            end_date: '2024-03-31',
            actual_end_date: '2024-05-15',
            team_size: 4,
            budget: 120000,
            actual_cost: 114000,
            milestones_completed: 4,
            total_milestones: 6
          },
          {
            id: '4',
            name: 'CRM System',
            status: 'completed',
            progress_percentage: 100,
            budget_utilization: 92,
            schedule_variance: -5,
            quality_score: 92,
            team_performance: 95,
            stakeholder_satisfaction: 90,
            start_date: '2023-09-01',
            end_date: '2024-01-31',
            team_size: 5,
            budget: 150000,
            actual_cost: 138000,
            milestones_completed: 10,
            total_milestones: 10
          }
        ]
        
        setProjects(mockData)
        
        const calculatedMetrics: PerformanceMetrics = {
          total_projects: mockData.length,
          on_track_projects: mockData.filter(p => p.status === 'on_track').length,
          at_risk_projects: mockData.filter(p => p.status === 'at_risk').length,
          delayed_projects: mockData.filter(p => p.status === 'delayed').length,
          completed_projects: mockData.filter(p => p.status === 'completed').length,
          average_progress: mockData.reduce((sum, p) => sum + p.progress_percentage, 0) / mockData.length,
          average_budget_utilization: mockData.reduce((sum, p) => sum + p.budget_utilization, 0) / mockData.length,
          average_quality_score: mockData.reduce((sum, p) => sum + p.quality_score, 0) / mockData.length,
          on_time_delivery_rate: 75,
          budget_variance_rate: -8
        }
        setMetrics(calculatedMetrics)
        
        return
      }
      
      toast.error('Failed to fetch project performance data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchProjectPerformanceData()
    setRefreshing(false)
    toast.success('Project performance data refreshed')
  }

  useEffect(() => {
    fetchProjectPerformanceData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600 bg-green-100'
      case 'at_risk': return 'text-yellow-600 bg-yellow-100'
      case 'delayed': return 'text-red-600 bg-red-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'at_risk': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'delayed': return <Clock className="w-5 h-5 text-red-600" />
      case 'completed': return <Award className="w-5 h-5 text-blue-600" />
      default: return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredProjects = projects.filter(project => {
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
              <h1 className="text-3xl font-bold text-gray-900">Project Performance</h1>
              <p className="text-gray-600 mt-2">Track and analyze project performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none outline-none text-sm"
                />
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border-none outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="on_track">On Track</option>
                  <option value="at_risk">At Risk</option>
                  <option value="delayed">Delayed</option>
                  <option value="completed">Completed</option>
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

          {/* Performance Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.total_projects}</p>
                    <p className="text-sm text-gray-500 mt-1">{metrics.on_track_projects} on track</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{Math.round(metrics.average_progress)}%</p>
                    <p className="text-sm text-gray-500 mt-1">{metrics.completed_projects} completed</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{Math.round(metrics.average_budget_utilization)}%</p>
                    <p className="text-sm text-gray-500 mt-1">{metrics.budget_variance_rate > 0 ? '+' : ''}{metrics.budget_variance_rate.toFixed(1)}% variance</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{Math.round(metrics.average_quality_score)}</p>
                    <p className="text-sm text-gray-500 mt-1">{metrics.on_time_delivery_rate}% on-time</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Distribution */}
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">On Track</span>
                      <span className="text-sm font-medium text-green-600">{metrics.on_track_projects} projects</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(metrics.on_track_projects / metrics.total_projects) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">At Risk</span>
                      <span className="text-sm font-medium text-yellow-600">{metrics.at_risk_projects} projects</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(metrics.at_risk_projects / metrics.total_projects) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Delayed</span>
                      <span className="text-sm font-medium text-red-600">{metrics.delayed_projects} projects</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(metrics.delayed_projects / metrics.total_projects) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-sm font-medium text-blue-600">{metrics.completed_projects} projects</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(metrics.completed_projects / metrics.total_projects) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-900">Team Performance</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(projects.reduce((sum, p) => sum + p.team_performance, 0) / projects.length)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Stakeholder Satisfaction</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(projects.reduce((sum, p) => sum + p.stakeholder_satisfaction, 0) / projects.length)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Milestone Completion</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round((projects.reduce((sum, p) => sum + p.milestones_completed, 0) / projects.reduce((sum, p) => sum + p.total_milestones, 0)) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Schedule Variance</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(projects.reduce((sum, p) => sum + p.schedule_variance, 0) / projects.length)} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Milestones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(project.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">
                              {project.start_date} - {project.actual_end_date || project.end_date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                project.progress_percentage >= 80 ? 'bg-green-500' : 
                                project.progress_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${project.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{project.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{formatCurrency(project.budget)}</div>
                          <div className={`text-sm ${getPerformanceColor(project.budget_utilization)}`}>
                            {project.budget_utilization}% used
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                project.quality_score >= 80 ? 'bg-green-500' : 
                                project.quality_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${project.quality_score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{project.quality_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{project.team_size} members</div>
                        <div className={`text-sm ${getPerformanceColor(project.team_performance)}`}>
                          {project.team_performance}% performance
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(project.milestones_completed / project.total_milestones) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {project.milestones_completed}/{project.total_milestones}
                          </span>
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
                  <p className="font-medium text-gray-900">Export Performance Report</p>
                  <p className="text-sm text-gray-500">Download detailed metrics</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Performance Analytics</p>
                  <p className="text-sm text-gray-500">Deep dive into trends</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                <Target className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Set Performance Goals</p>
                  <p className="text-sm text-gray-500">Define target metrics</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default ProjectPerformancePage
