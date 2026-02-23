'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import api, { organizationAPI } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { resourcesAPI } from '@/lib/api' // <-- use this, not axios instance


import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface EmployeeUser {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
}

interface Employee {
  id: string
  employee_id: string
  user: EmployeeUser
  first_name: string
  last_name: string
  email: string
  department_name?: string
}

interface LeaveRequestFormData {
  employee: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  attachment?: File
  emergency_contact: string
  emergency_contact_phone: string
  handover_notes: string
}

export default function CreateLeaveRequestPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<LeaveRequestFormData>({
    employee: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact: '',
    emergency_contact_phone: '',
    handover_notes: '',
  })

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', days: 21 },
  { value: 'sick', label: 'Sick Leave', days: 10 },
  { value: 'personal', label: 'Personal Leave', days: 5 },
  { value: 'maternity', label: 'Maternity Leave', days: 90 },
  { value: 'paternity', label: 'Paternity Leave', days: 14 },
  { value: 'unpaid', label: 'Unpaid Leave', days: 0 },
  { value: 'other', label: 'Other', days: 0 },
]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await organizationAPI.getEmployees()
      let data = response.data.results || response.data
      setEmployees(data.map((e: any) => ({ ...e, id: e.user.id })))
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Use mock data for now
      // setEmployees([
      //   { employee_id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', department_name: 'Engineering' },
      //   { employee_id: '2', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah@example.com', department_name: 'Marketing' },
      //   { employee_id: '3', first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com', department_name: 'Engineering' },
      // ])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, attachment: file }))
    }
  }

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0
    
    const start = new Date(formData.start_date)
    const end = new Date(formData.end_date)
    
    if (end < start) return 0
    
    // Calculate business days (excluding weekends)
    let days = 0
    const current = new Date(start)
    
    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday or Sunday
        days++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const validateForm = () => {
    if (!formData.employee) {
      toast.error('Please select an employee')
      return false
    }
    if (!formData.leave_type) {
      toast.error('Please select a leave type')
      return false
    }
    if (!formData.start_date) {
      toast.error('Please select a start date')
      return false
    }
    if (!formData.end_date) {
      toast.error('Please select an end date')
      return false
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('End date must be after start date')
      return false
    }
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the leave')
      return false
    }
    if (!formData.emergency_contact.trim()) {
      toast.error('Emergency contact name is required')
      return false
    }
    if (!formData.emergency_contact_phone.trim()) {
      toast.error('Emergency contact phone is required')
      return false
    }
    return true
  }



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) return

  setSubmitting(true)

  try {
    const fd = new FormData()

    // ✅ send employee too (your flow)
    fd.append('employee', formData.employee)

    // ✅ send all fields that exist in your page/state
    fd.append('leave_type', formData.leave_type)
    fd.append('start_date', formData.start_date)
    fd.append('end_date', formData.end_date)
    fd.append('reason', formData.reason)
    fd.append('emergency_contact', formData.emergency_contact)
    fd.append('emergency_contact_phone', formData.emergency_contact_phone)
    fd.append('handover_notes', formData.handover_notes || '')

    // ✅ file upload (optional)
    if (formData.attachment) {
      fd.append('attachment', formData.attachment)
    }

    // ❌ remove this: it doesn't exist in your formData type
    // fd.append('handover_notes', formData.handover_notes)

    await resourcesAPI.createLeaveRequest(fd)

    toast.success('Leave request submitted successfully!')
    router.push('/resources/leave-requests')
    router.refresh()
  } catch (error: any) {
    console.error('Error creating leave request:', error)
    toast.error(
      error?.response?.data?.detail ||
        error?.response?.data?.error ||
        'Failed to submit leave request'
    )
  } finally {
    setSubmitting(false)
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
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/resources/leave-requests">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Leave Requests
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Leave Request</h1>
                <p className="text-gray-600">Submit a new leave request for review and approval</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6 space-y-6">
              {/* Employee and Leave Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
                    Employee *
                  </label>
                  <select
                    id="employee"
                    name="employee"
                    value={formData.employee}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select an employee</option>
                    {employees.map(employee => (
                      <option key={employee.employee_id} value={employee.user.id}>
                        {employee.first_name} {employee.last_name} - {employee.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type *
                  </label>
                  <select
                    id="leave_type"
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    {leaveTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} {type.days > 0 && `(${type.days} days)`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    min={formData.start_date}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Days Calculation */}
              {formData.start_date && formData.end_date && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Total Business Days: {calculateDays()}
                      </p>
                      <p className="text-xs text-blue-700">
                        Weekends are excluded from the calculation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Leave *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Please provide a detailed reason for your leave request"
                  required
                />
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    id="emergency_contact"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Full name of emergency contact"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>

              {/* Attachment */}
              <div>
                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Document (optional)
                </label>
                <input
                  type="file"
                  id="attachment"
                  name="attachment"
                  onChange={handleFileChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG. Maximum file size: 5MB
                </p>
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="handover_notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="handover_notes"
                  name="handover_notes"
                  value={formData.handover_notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Any additional information (optional)"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Link href="/resources/leave-requests">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Submit Leave Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
