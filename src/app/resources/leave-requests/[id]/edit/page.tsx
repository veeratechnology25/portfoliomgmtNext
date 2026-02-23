'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { useParams, useRouter } from 'next/navigation'
import { resourcesAPI, organizationAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface EmployeeUser {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
}

interface Employee {
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

export default function EditLeaveRequestPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState<string>('')

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
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' },
    { value: 'other', label: 'Other' },
  ]

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)

        // Fetch employees for dropdown
        const empRes = await organizationAPI.getEmployees()
        const empData = empRes.data.results || empRes.data
        setEmployees(empData)

        // Fetch leave request
        const res = await resourcesAPI.getLeaveRequest(id)
        const lr = res.data

        // IMPORTANT: If backend returns employee as a nested object, adjust accordingly.
        // Common cases:
        // - lr.employee is User UUID
        // - lr.employee is Employee UUID
        // Your backend error earlier suggests leave request expects User PK.
        const employeeUserId =
          typeof lr.employee === 'string'
            ? lr.employee
            : lr.employee?.id || lr.employee?.user?.id || ''

        setFormData({
          employee: employeeUserId,
          leave_type: lr.leave_type || 'annual',
          start_date: (lr.start_date || '').slice(0, 10),
          end_date: (lr.end_date || '').slice(0, 10),
          reason: lr.reason || '',
          emergency_contact: lr.emergency_contact || '',
          emergency_contact_phone: lr.emergency_contact_phone || '',
          handover_notes: lr.handover_notes || '',
        })

        setExistingAttachmentUrl(lr.attachment || '')
      } catch (e: any) {
        console.error(e)
        toast.error('Failed to load leave request')
      } finally {
        setLoading(false)
      }
    }

    if (id) run()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }
    setFormData(prev => ({ ...prev, attachment: file }))
  }

  const validateForm = () => {
    if (!formData.employee) return toast.error('Please select an employee'), false
    if (!formData.leave_type) return toast.error('Please select a leave type'), false
    if (!formData.start_date) return toast.error('Please select a start date'), false
    if (!formData.end_date) return toast.error('Please select an end date'), false
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('End date must be after start date')
      return false
    }
    if (!formData.reason.trim()) return toast.error('Please provide a reason'), false
    if (!formData.emergency_contact.trim()) return toast.error('Emergency contact name is required'), false
    if (!formData.emergency_contact_phone.trim()) return toast.error('Emergency contact phone is required'), false
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const fd = new FormData()

      // Send all fields
      fd.append('employee', formData.employee)
      fd.append('leave_type', formData.leave_type)
      fd.append('start_date', formData.start_date)
      fd.append('end_date', formData.end_date)
      fd.append('reason', formData.reason)
      fd.append('emergency_contact', formData.emergency_contact)
      fd.append('emergency_contact_phone', formData.emergency_contact_phone)
      fd.append('handover_notes', formData.handover_notes || '')

      // Only send attachment if user picked a new file
      if (formData.attachment instanceof File) {
        fd.append('attachment', formData.attachment, formData.attachment.name)
      }

      await resourcesAPI.updateLeaveRequest(id, fd)

      toast.success('Leave request updated successfully!')
      router.push(`/resources/leave-requests/${id}`)
      router.refresh()
    } catch (e: any) {
      console.error(e)
      toast.error(
        e?.response?.data?.detail ||
          JSON.stringify(e?.response?.data) ||
          'Failed to update leave request'
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/resources/leave-requests/${id}`}>
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Leave Request</h1>
                <p className="text-gray-600">Update the leave request details</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    name="employee"
                    value={formData.employee}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select an employee</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.user.id}>
                        {emp.first_name} {emp.last_name} - {emp.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                  <select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    {leaveTypes.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    min={formData.start_date}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (optional)</label>
                <input
                  type="file"
                  name="attachment"
                  onChange={handleFileChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {existingAttachmentUrl && (
                  <p className="text-xs text-gray-600 mt-2">
                    Current file:{' '}
                    <a className="text-blue-600 underline" href={existingAttachmentUrl} target="_blank" rel="noreferrer">
                      View attachment
                    </a>
                  </p>
                )}
                {formData.attachment && (
                  <p className="text-xs text-green-600 mt-2">
                    New file selected: {formData.attachment.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  name="handover_notes"
                  value={formData.handover_notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Link href={`/resources/leave-requests/${id}`}>
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={submitting} className="flex items-center">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Save Changes
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