'use client'

import React, { useState, useEffect } from 'react'
import { resourcesAPI } from '@/lib/api'
import { ResourceUtilization, EquipmentInventory, Equipment } from '@/types/resources'
import { toast } from 'react-hot-toast'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Laptop, 
  Calendar, 
  DollarSign,
  Download,
  Filter,
  Search,
  PieChart,
  Activity,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const ResourcesReportsPage: React.FC = () => {
  const [utilizationData, setUtilizationData] = useState<ResourceUtilization[]>([])
  const [equipmentData, setEquipmentData] = useState<EquipmentInventory | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<string>('utilization')
  const [dateRange, setDateRange] = useState<string>('30')

  const fetchUtilizationData = async () => {
    try {
      const response = await resourcesAPI.getUtilizationReport()
      setUtilizationData(response.data.results || response.data)
    } catch (error: any) {
      console.error('Error fetching utilization data:', error)
      toast.error('Failed to fetch utilization data')
    }
  }

  const fetchEquipmentData = async () => {
    try {
      const response = await resourcesAPI.getEquipment()
      const equipment = response.data.results || response.data
      
      // Process equipment data for inventory stats
      const inventory: EquipmentInventory = {
        total_count: equipment.length,
        by_type: equipment.reduce((acc: any, item: Equipment) => {
          acc[item.equipment_type] = (acc[item.equipment_type] || 0) + 1
          return acc
        }, {}),
        by_status: equipment.reduce((acc: any, item: Equipment) => {
          acc[item.status] = (acc[item.status] || 0) + 1
          return acc
        }, {}),
        by_brand: equipment.reduce((acc: any, item: Equipment) => {
          acc[item.brand] = (acc[item.brand] || 0) + 1
          return acc
        }, {}),
        maintenance_due: equipment.filter((item: Equipment) => item.needs_maintenance),
        recently_assigned: equipment.filter((item: Equipment) => item.status === 'assigned').slice(0, 10),
        total_value: equipment.reduce((sum: number, item: Equipment) => sum + (parseFloat(item.purchase_cost || '0')), 0)
      }
      
      setEquipmentData(inventory)
    } catch (error: any) {
      console.error('Error fetching equipment data:', error)
      toast.error('Failed to fetch equipment data')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      if (selectedReport === 'utilization') {
        await fetchUtilizationData()
      } else if (selectedReport === 'equipment') {
        await fetchEquipmentData()
      }
      setLoading(false)
    }
    
    fetchData()
  }, [selectedReport])

  const reportTypes = [
    { id: 'utilization', name: 'Resource Utilization', icon: Users },
    { id: 'equipment', name: 'Equipment Inventory', icon: Laptop },
    { id: 'timesheets', name: 'Timesheet Analysis', icon: Calendar },
    { id: 'leave', name: 'Leave Analytics', icon: Calendar },
    { id: 'requests', name: 'Request Trends', icon: TrendingUp }
  ]

  const renderUtilizationReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overall Utilization</h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Allocation</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overallocated</span>
                <span className="font-medium text-orange-600">12%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Underutilized</span>
                <span className="font-medium text-green-600">13%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '13%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <Target className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {utilizationData.slice(0, 5).map((util, index) => (
              <div key={util.employee_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-700">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{util.employee_name}</p>
                    <p className="text-xs text-gray-500">{util.active_projects.length} projects</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{util.total_allocation_percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Utilization Trends</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This Week</span>
              <span className="font-medium text-green-600">+5%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Week</span>
              <span className="font-medium text-red-600">-2%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Monthly Average</span>
              <span className="font-medium text-blue-600">72%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Target</span>
              <span className="font-medium text-gray-600">80%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Utilization Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Utilization Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Allocation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {utilizationData.map((util) => (
                <tr key={util.employee_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {util.employee_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{util.total_allocation_percentage}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            util.total_allocation_percentage > 100 ? 'bg-red-500' :
                            util.total_allocation_percentage > 80 ? 'bg-orange-500' :
                            util.total_allocation_percentage > 60 ? 'bg-green-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(util.total_allocation_percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {util.active_projects.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      util.total_allocation_percentage > 100 ? 'bg-red-100 text-red-800' :
                      util.total_allocation_percentage > 80 ? 'bg-orange-100 text-orange-800' :
                      util.total_allocation_percentage > 60 ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {util.total_allocation_percentage > 100 ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {util.total_allocation_percentage > 100 ? 'Overallocated' :
                       util.total_allocation_percentage > 80 ? 'Optimal' :
                       util.total_allocation_percentage > 60 ? 'Balanced' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      {util.utilization_trend.length > 0 && (
                        <>
                          {util.utilization_trend[util.utilization_trend.length - 1].allocation_percentage > 
                           util.utilization_trend[0].allocation_percentage ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
                          )}
                          <span>{util.utilization_trend[util.utilization_trend.length - 1].allocation_percentage}%</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderEquipmentReport = () => (
    <div className="space-y-6">
      {equipmentData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">{equipmentData.total_count}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500">
                  <Laptop className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${equipmentData.total_value.toFixed(0)}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{equipmentData.by_status.available || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance Due</p>
                  <p className="text-2xl font-bold text-gray-900">{equipmentData.maintenance_due.length}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-500">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment by Type</h3>
              <div className="space-y-3">
                {Object.entries(equipmentData.by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / equipmentData.total_count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment by Status</h3>
              <div className="space-y-3">
                {Object.entries(equipmentData.by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 capitalize">{status}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            status === 'available' ? 'bg-green-500' :
                            status === 'assigned' ? 'bg-blue-500' :
                            status === 'maintenance' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${(count / equipmentData.total_count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Due</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Maintenance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {equipmentData.maintenance_due.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.equipment_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.assigned_to_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.last_maintenance_date ? new Date(item.last_maintenance_date).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">Schedule Maintenance</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Reports</h1>
          <p className="text-gray-600 mt-2">Analytics and insights for resource management</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedReport === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  selectedReport === type.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  selectedReport === type.id ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {type.name}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'utilization' && renderUtilizationReport()}
      {selectedReport === 'equipment' && renderEquipmentReport()}
      {selectedReport === 'timesheets' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Timesheet Analysis</h3>
            <p className="mt-1 text-sm text-gray-500">Timesheet reports coming soon</p>
          </div>
        </div>
      )}
      {selectedReport === 'leave' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Leave Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">Leave analytics coming soon</p>
          </div>
        </div>
      )}
      {selectedReport === 'requests' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Request Trends</h3>
            <p className="mt-1 text-sm text-gray-500">Request trend analysis coming soon</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourcesReportsPage
