'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { organizationAPI } from '@/lib/api'
import { Button } from '@/components/ui/Button'
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

interface Employee {
  id: string
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
  emergency_contact_name: string
  emergency_contact_phone: string
  notes: string
}

export default function CreateLeaveRequestPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    employee: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
  })

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', days: 21 },
    { value: 'sick', label: 'Sick Leave', days: 10 },
    { value: 'personal', label: 'Personal Leave', days: 5 },
    { value: 'maternity', label: 'Maternity Leave', days: 90 },
    { value: 'paternity', label: 'Paternity Leave', days: 14 },
    { value: 'unpaid', label: 'Unpaid Leave', days: 0 },
    { value: 'compassionate', label: 'Compassionate Leave', days: 3 },
    { value: 'study', label: 'Study Leave', days: 10 },
  ]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await organizationAPI.getEmployees()
      setEmployees(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Use mock data for now
      setEmployees([
        { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', department_name: 'Engineering' },
        { id: '2', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah@example.com', department_name: 'Marketing' },
        { id: '3', first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com', department_name: 'Engineering' },
      ])
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
    if (!formData.emergency_contact_name.trim()) {
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
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      // For now, simulate the API call since we don't have a create leave request endpoint
      // const response = await resourcesAPI.createLeaveRequest(formData);
      
      // Simulate successful creation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Leave request submitted successfully!')
      
      // Redirect to leave requests list
      window.location.href = '/resources/leave-requests'
    } catch (error) {
      console.error('Error creating leave request:', error)
      toast.error('Failed to submit leave request')
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
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                      <option key={employee.id} value={employee.id}>
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
                  <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
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
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
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
