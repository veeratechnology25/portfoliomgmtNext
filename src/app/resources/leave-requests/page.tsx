'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useRouter } from 'next/navigation'
import { resourcesAPI } from '@/lib/api'
import { LeaveRequest } from '@/types/resources'
import { toast } from 'react-hot-toast'
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
} from 'lucide-react'

function toCSV(rows: any[]) {
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(escape).join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ]
  return lines.join('\n')
}

function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const LeaveRequestsPage: React.FC = () => {
  const router = useRouter()

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await resourcesAPI.getLeaveRequests()
      setLeaveRequests(response.data.results || response.data || [])
    } catch (error: any) {
      console.error('Error fetching leave requests:', error)
      toast.error('Failed to fetch leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter(request => {
      const matchesSearch =
        request.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      const matchesType = typeFilter === 'all' || request.leave_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [leaveRequests, searchTerm, statusFilter, typeFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-800'
      case 'sick': return 'bg-red-100 text-red-800'
      case 'personal': return 'bg-purple-100 text-purple-800'
      case 'maternity': return 'bg-pink-100 text-pink-800'
      case 'paternity': return 'bg-indigo-100 text-indigo-800'
      case 'unpaid': return 'bg-gray-100 text-gray-800'
      case 'other': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const onExport = async () => {
    try {
      const response = await resourcesAPI.getLeaveRequests({
        params: { page_size: 1000 } // adjust if needed
      })

      const allData = response.data.results || response.data

      const rows = allData.map((r: any) => ({
        ID: r.id,
        Employee: r.employee_name,
        Approved_By: r.approved_by_name,
        Leave_Type: r.leave_type,
        Start_Date: r.start_date,
        End_Date: r.end_date,
        Total_Days: r.total_days,
        Status: r.status,
        Approved_Date: r.approved_date,
        Reason: r.reason,
        Emergency_Contact: r.emergency_contact,
        Attachment_URL: r.attachment,
        Handover_Notes: r.handover_notes,
        Created_At: r.created_at,
        Updated_At: r.updated_at,
      }))

    const csv = toCSV(rows)
    downloadTextFile(`leave-requests-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    } catch (error) {
      console.error(error)
      toast.error('Export failed')
    }
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(field => `"${String(row[field] ?? '').replace(/"/g, '""')}"`).join(',')
      )
    ]

    return csvRows.join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }
  const onExportOld = () => {
    const rows = filteredLeaveRequests.map(r => ({
      id: r.id,
      employee_name: r.employee_name,
      employee_email: r.employee_email,
      leave_type: r.leave_type,
      start_date: r.start_date,
      end_date: r.end_date,
      total_days: r.total_days,
      status: r.status,
      reason: r.reason,
      created_at: r.created_at,
    }))
    const csv = toCSV(rows)
    downloadTextFile(`leave-requests-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    toast.success('Exported CSV')
  }

  const onApprove = async (id: string) => {
    try {
      setActionLoadingId(id)
      await resourcesAPI.approveLeaveRequest(id)
      toast.success('Leave request approved')
      await fetchLeaveRequests()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.response?.data?.error || 'Failed to approve request')
    } finally {
      setActionLoadingId(null)
    }
  }

  const onReject = async (id: string) => {
    try {
      setActionLoadingId(id)
      await resourcesAPI.rejectLeaveRequest(id)
      toast.success('Leave request rejected')
      await fetchLeaveRequests()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.response?.data?.error || 'Failed to reject request')
    } finally {
      setActionLoadingId(null)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </ProtectedRoute >
    )
  }

  return (
    <ProtectedRoute>
      <Layout>


        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
              <p className="text-gray-600 mt-2">Handle employee leave requests and approvals</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push('/resources/leave-requests/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Leave Request
              </button>

              <button
                onClick={onExport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
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
                    placeholder="Search leave requests..."
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="other">Other</option>
                </select>

                <button
                  onClick={onExport}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeaveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.employee_name}</div>
                          <div className="text-sm text-gray-500">{request.employee_email}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leave_type)}`}>
                          {request.leave_type}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.total_days} days
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => router.push(`/resources/leave-requests/${request.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => router.push(`/resources/leave-requests/${request.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {request.status === 'pending' && (
                            <>
                              <button
                                disabled={actionLoadingId === request.id}
                                onClick={() => onApprove(request.id)}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>

                              <button
                                disabled={actionLoadingId === request.id}
                                onClick={() => onReject(request.id)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeaveRequests.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new leave request'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default LeaveRequestsPage