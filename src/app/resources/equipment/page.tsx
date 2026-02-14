'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { resourcesAPI } from '@/lib/api'
import { Equipment } from '@/types/resources'
import { toast } from 'react-hot-toast'
import { 
  Laptop, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Server, 
  Network, 
  Printer, 
  Settings,
  CheckCircle, 
  Clock, 
  XCircle,
  Wrench,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react'

const EquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await resourcesAPI.getEquipment()
      setEquipment(response.data.results || response.data)
    } catch (error: any) {
      console.error('Error fetching equipment:', error)
      toast.error('Failed to fetch equipment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = typeFilter === 'all' || item.equipment_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'retired': return 'bg-gray-100 text-gray-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />
      case 'assigned': return <CheckCircle className="w-4 h-4" />
      case 'maintenance': return <Wrench className="w-4 h-4" />
      case 'retired': return <XCircle className="w-4 h-4" />
      case 'lost': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-5 h-5" />
      case 'desktop': return <Monitor className="w-5 h-5" />
      case 'mobile': return <Smartphone className="w-5 h-5" />
      case 'tablet': return <Tablet className="w-5 h-5" />
      case 'server': return <Server className="w-5 h-5" />
      case 'network': return <Network className="w-5 h-5" />
      case 'printer': return <Printer className="w-5 h-5" />
      default: return <Settings className="w-5 h-5" />
    }
  }

  const getEquipmentStats = () => {
    const stats = {
      total: equipment.length,
      available: equipment.filter(e => e.status === 'available').length,
      assigned: equipment.filter(e => e.status === 'assigned').length,
      maintenance: equipment.filter(e => e.status === 'maintenance').length,
      needsMaintenance: equipment.filter(e => e.needs_maintenance).length
    }
    return stats
  }

  const stats = getEquipmentStats()

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-2">Track and manage equipment inventory and assignments</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Equipment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <Settings className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenance}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Needs Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.needsMaintenance}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-500">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
              <option value="lost">Lost</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="server">Server</option>
              <option value="network">Network</option>
              <option value="printer">Printer</option>
              <option value="other">Other</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipment.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getEquipmentIcon(item.equipment_type)}
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  {item.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Brand:</span> {item.brand}</p>
                <p><span className="font-medium">Model:</span> {item.model_number}</p>
                {item.serial_number && (
                  <p><span className="font-medium">Serial:</span> {item.serial_number}</p>
                )}
                {item.assigned_to_name && (
                  <p><span className="font-medium">Assigned to:</span> {item.assigned_to_name}</p>
                )}
                {item.purchase_cost && (
                  <p><span className="font-medium">Cost:</span> ${item.purchase_cost}</p>
                )}
              </div>

              {item.needs_maintenance && (
                <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Needs maintenance</span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1 text-sm">
                  <Eye className="w-3 h-3" />
                  View
                </button>
                <button className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 flex items-center justify-center gap-1 text-sm">
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Laptop className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by adding new equipment'}
          </p>
        </div>
      )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default EquipmentPage
