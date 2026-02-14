'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { resourcesAPI } from '@/lib/api'
import { ResourcesStats } from '@/types/resources'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Filter,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Laptop,
  FileText,
  Settings,
  BarChart3,
  UserCheck,
  Wrench
} from 'lucide-react'

const ResourcesPage: React.FC = () => {
  const [stats, setStats] = useState<ResourcesStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await resourcesAPI.getUtilizationSummary()
      setStats(response.data)
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to fetch resource statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, href }: { 
    title: string
    value: number | string
    icon: any
    color: string
    href?: string
  }) => {
    if (href) {
      return (
        <Link 
          href={href}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>
      )
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    )
  }

  const NavigationCard = ({ title, description, icon: Icon, href, color }: {
    title: string
    description: string
    icon: any
    href: string
    color: string
  }) => (
    <Link href={href} className="group">
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:scale-105">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600 mt-2">Manage human resources, equipment, and allocations</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Action
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Allocations"
            value={stats.total_allocations}
            icon={Users}
            color="bg-blue-500"
            href="/resources/allocations"
          />
          <StatCard
            title="Active Allocations"
            value={stats.active_allocations}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pending_resource_requests}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Equipment Items"
            value={stats.total_equipment}
            icon={Laptop}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NavigationCard
          title="Resource Allocations"
          description="View and manage resource allocations across projects"
          icon={Users}
          href="/resources/allocations"
          color="bg-blue-500"
        />
        <NavigationCard
          title="Equipment Management"
          description="Track and manage equipment inventory and assignments"
          icon={Laptop}
          href="/resources/equipment"
          color="bg-purple-500"
        />
        <NavigationCard
          title="Timesheets"
          description="Manage employee timesheets and time tracking"
          icon={Clock}
          href="/resources/timesheets"
          color="bg-green-500"
        />
        <NavigationCard
          title="Leave Requests"
          description="Handle employee leave requests and approvals"
          icon={Calendar}
          href="/resources/leave-requests"
          color="bg-yellow-500"
        />
        <NavigationCard
          title="Resource Requests"
          description="Process new resource requests and approvals"
          icon={FileText}
          href="/resources/resource-requests"
          color="bg-indigo-500"
        />
        <NavigationCard
          title="Utilization Reports"
          description="View resource utilization analytics and reports"
          icon={BarChart3}
          href="/resources/reports"
          color="bg-red-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/resources/allocations/create">
            <button className="w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              New Allocation
            </button>
          </Link>
          <Link href="/resources/equipment/create">
            <button className="w-full bg-purple-50 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-2 transition-colors">
              <Laptop className="w-4 h-4" />
              Add Equipment
            </button>
          </Link>
          <Link href="/resources/leave-requests/create">
            <button className="w-full bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg hover:bg-yellow-100 flex items-center justify-center gap-2 transition-colors">
              <Calendar className="w-4 h-4" />
              Request Leave
            </button>
          </Link>
          <Link href="/resources/resource-requests/create">
            <button className="w-full bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg hover:bg-indigo-100 flex items-center justify-center gap-2 transition-colors">
              <FileText className="w-4 h-4" />
              Resource Request
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <UserCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New resource allocation created</p>
              <p className="text-xs text-gray-500">John Doe assigned to Project Alpha - 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-full">
              <Laptop className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Equipment assigned</p>
              <p className="text-xs text-gray-500">Laptop assigned to Sarah Smith - 4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Calendar className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Leave request approved</p>
              <p className="text-xs text-gray-500">Mike Johnson's annual leave approved - 6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default ResourcesPage
