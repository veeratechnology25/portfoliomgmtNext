'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { analyticsAPI } from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react'

interface DashboardSummary {
  total_projects: number
  active_projects: number
  total_budget: number
  budget_utilization: number
  total_employees: number
  resource_utilization: number
  portfolio_health_score: number
  risk_count: number
}
interface DashboardSummaryAPI {
  total_kpis: number
  active_dashboards: number
  scheduled_reports: number
  portfolio_health_score: number
  recent_metrics: any[]
  top_kpis: any[]
  critical_alerts: number
  warning_alerts: number
  last_data_update: string
  data_freshness_score: number
}
interface KPIMetric {
  id: string
  name: string
  value: number
  target: number
  trend: 'up' | 'down' | 'stable'
  unit: string
  status: 'good' | 'warning' | 'critical'
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
  }[]
}

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null)
  const [kpis, setKpis] = useState<KPIMetric[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [portfolioHealth, setPortfolioHealth] = useState<any>(null)
  const [financialForecast, setFinancialForecast] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Fetching analytics dashboard data...')

      // Fetch dashboard summary
      const summaryResponse = await analyticsAPI.getDashboardSummary()
      console.log('Dashboard summary response:', summaryResponse.data)
      setDashboardSummary(summaryResponse.data)

      // Fetch KPIs
      const kpisResponse = await analyticsAPI.getKPIs()
      console.log('KPIs response:', kpisResponse.data)
      setKpis(kpisResponse.data?.results || kpisResponse.data)

      // Fetch portfolio health
      const healthResponse = await analyticsAPI.getPortfolioHealth()
      console.log('Portfolio health response:', healthResponse.data)
      setPortfolioHealth(healthResponse.data?.results || healthResponse.data)

      // Fetch financial forecast
      const forecastResponse = await analyticsAPI.getFinancialForecast()
      console.log('Financial forecast response:', forecastResponse.data)

      const forecastData = forecastResponse.data?.results ?? forecastResponse.data ?? []
      setFinancialForecast(Array.isArray(forecastData) ? forecastData : [])

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)

      // Handle 404 errors specifically
      if (error.response?.status === 404) {
        console.log('Analytics endpoints not found, using mock data')
        // Set mock data for development
        setDashboardSummary({
          total_projects: 24,
          active_projects: 18,
          total_budget: 2500000,
          budget_utilization: 68,
          total_employees: 45,
          resource_utilization: 72,
          portfolio_health_score: 85,
          risk_count: 3
        })

        setKpis([
          { id: '1', name: 'Project Completion Rate', value: 75, target: 80, trend: 'up', unit: '%', status: 'warning' },
          { id: '2', name: 'Budget Efficiency', value: 82, target: 85, trend: 'up', unit: '%', status: 'good' },
          { id: '3', name: 'Resource Utilization', value: 72, target: 75, trend: 'stable', unit: '%', status: 'good' },
          { id: '4', name: 'On-Time Delivery', value: 68, target: 90, trend: 'down', unit: '%', status: 'critical' }
        ])

        setPortfolioHealth({
          overall_health: 85,
          project_health: 78,
          financial_health: 92,
          resource_health: 71
        })

        setFinancialForecast({
          next_quarter: 1250000,
          ytd_revenue: 2100000,
          projected_annual: 4200000,
          growth_rate: 15.5
        })

        return
      }

      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

const exportAnalytics = async () => {
  try {
    const res = await analyticsAPI.exportAnalytics()
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "analytics_export.csv"
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    toast.success("Export downloaded")
  } catch (e) {
    toast.error("Export failed")
  }
}

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
    toast.success('Data refreshed successfully')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStartDateFromRange = (range: string) => {
    const now = new Date()
    const d = new Date(now)

    if (range === "7d") d.setDate(now.getDate() - 7)
    else if (range === "30d") d.setDate(now.getDate() - 30)
    else if (range === "90d") d.setDate(now.getDate() - 90)
    else if (range === "1y") d.setFullYear(now.getFullYear() - 1)
    else d.setDate(now.getDate() - 30)

    // zero time for stable comparisons
    d.setHours(0, 0, 0, 0)
    return d
  }

  const filterForecastRows = (rows: any[], range: string) => {
    if (!Array.isArray(rows)) return []
    const start = getStartDateFromRange(range)
    return rows.filter(r => {
      const p = new Date(r.period)
      return p >= start
    })
  }

  const filterKPIs = (rows: KPIMetric[], term: string) => {
    const t = term.trim().toLowerCase()
    if (!t) return rows
    return rows.filter(k => (k.name ?? "").toLowerCase().includes(t))
  }

  const toNumber = (v: any) => {
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string") {
      const n = Number(v.replace(/,/g, "").trim());
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };
  type ForecastRow = {
    period: string; // "YYYY-MM-DD"
    revenue_forecast: number | string;
    expense_forecast: number | string;
    profit_forecast: number | string;
    confidence_interval_low?: number | string;
    confidence_interval_high?: number | string;
  };

  const buildFinancialSummary = (rows: any) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        next_quarter: 0,
        ytd_revenue: 0,
        projected_annual: 0,
        growth_rate: 0,
      };
    }

    const sorted = [...rows].sort(
      (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime()
    );

    const sum = (vals: any[]) =>
      vals.reduce((acc, v) => acc + (toNumber(v) ?? 0), 0);

    const next_quarter = sum(sorted.slice(0, 3).map(r => r.revenue_forecast));
    const projected_annual = sum(sorted.slice(0, 12).map(r => r.revenue_forecast));

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const ytd_revenue = sum(
      sorted
        .filter(r => {
          const d = new Date(r.period);
          return d >= yearStart && d <= now;
        })
        .map(r => r.revenue_forecast)
    );

    // ✅ Growth Rate Calculation
    const firstRevenue = toNumber(sorted[0].revenue_forecast) ?? 0;
    const lastRevenue =
      toNumber(sorted[sorted.length - 1].revenue_forecast) ?? 0;

    const growth_rate =
      firstRevenue > 0
        ? ((lastRevenue - firstRevenue) / firstRevenue) * 100
        : 0;

    return {
      next_quarter,
      ytd_revenue,
      projected_annual,
      growth_rate: Number(growth_rate.toFixed(2)),
    };
  };

  const formatCurrency = (value: any, currency = "USD") => {
    const n = toNumber(value);
    if (n === null) return "—"; // avoid NaN in UI
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-600" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(amount)
  // }
  const financialSummary = buildFinancialSummary(financialForecast);
  const filteredForecastRows = filterForecastRows(financialForecast ?? [], dateRange)

  const filteredKpis = filterKPIs(kpis, searchTerm)

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
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
            </div>

            <div className="flex items-center gap-4">

              {/* 🔎 Search KPIs */}
              <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search KPIs..."
                  className="outline-none text-sm w-56"
                />
              </div>

              {/* 📅 Date Filter */}
              <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border-none outline-none text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              {/* 🔄 Refresh Button */}
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

          {/* Summary Cards */}
          {dashboardSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardSummary.total_projects}</p>
                    <p className="text-sm text-gray-500 mt-1">{dashboardSummary.active_projects} active</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(dashboardSummary.total_budget)}</p>
                    <p className="text-sm text-gray-500 mt-1">{dashboardSummary.budget_utilization}% utilized</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Size</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardSummary.total_employees}</p>
                    <p className="text-sm text-gray-500 mt-1">{dashboardSummary.resource_utilization}% utilization</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Portfolio Health</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardSummary.portfolio_health_score}%</p>
                    <p className="text-sm text-gray-500 mt-1">{dashboardSummary.risk_count} risks</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KPIs Section */}
          {kpis.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All KPIs
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                        {kpi.status}
                      </span>
                      {getTrendIcon(kpi.trend)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{kpi.name}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {kpi.value}{kpi.unit}
                      </p>
                      <p className="text-sm text-gray-500">
                        / {kpi.target}{kpi.unit}
                      </p>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${kpi.status === 'good' ? 'bg-green-500' :
                          kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Health Chart */}
            {portfolioHealth && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Health</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Health</span>
                      <span className="text-sm font-medium">{portfolioHealth.overall_health}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${portfolioHealth.overall_health}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Project Health</span>
                      <span className="text-sm font-medium">{portfolioHealth.project_health}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${portfolioHealth.project_health}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Financial Health</span>
                      <span className="text-sm font-medium">{portfolioHealth.financial_health}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${portfolioHealth.financial_health}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Resource Health</span>
                      <span className="text-sm font-medium">{portfolioHealth.resource_health}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${portfolioHealth.resource_health}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Forecast */}
            {financialSummary && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Forecast</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Next Quarter</p>
                      <p className="text-xl font-bold text-blue-900">{formatCurrency(financialSummary.next_quarter)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600 font-medium">YTD Revenue</p>
                      <p className="text-xl font-bold text-green-900">{formatCurrency(financialSummary.ytd_revenue)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Projected Annual</p>
                      <p className="text-xl font-bold text-purple-900">{formatCurrency(financialSummary.projected_annual)}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Growth Rate</p>
                      <p className="text-xl font-bold text-orange-900">{financialSummary.growth_rate}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
  onClick={exportAnalytics}
  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50"
>
  <Download className="w-5 h-5 text-gray-600" />
  <div className="text-left">
    <p className="font-medium text-gray-900">Export Report</p>
    <p className="text-sm text-gray-500">Download analytics data</p>
  </div>
</button>
              <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                <Settings className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Configure KPIs</p>
                  <p className="text-sm text-gray-500">Manage performance metrics</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                <Eye className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Details</p>
                  <p className="text-sm text-gray-500">Deep dive analytics</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default AnalyticsPage
