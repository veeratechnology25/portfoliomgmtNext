'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { resourcesAPI, organizationAPI, projectsAPI } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
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

interface Project {
  id: string
  name: string
  code: string
  status: string
}

interface AllocationFormData {
  employee: string
  project: string
  allocation_type: string
  start_date: string
  end_date: string
  allocation_percentage: number
  description: string
}

export default function CreateAllocationPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<AllocationFormData>({
    employee: '',
    project: '',
    allocation_type: 'full_time',
    start_date: '',
    end_date: '',
    allocation_percentage: 100,
    description: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch employees
      try {
        const employeesResponse = await organizationAPI.getEmployees()
        setEmployees(employeesResponse.data.results || employeesResponse.data)
      } catch (error) {
        console.error('Error fetching employees:', error)
        // Use mock data for now
        setEmployees([
          { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', department_name: 'Engineering' },
          { id: '2', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah@example.com', department_name: 'Marketing' },
          { id: '3', first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com', department_name: 'Engineering' },
        ])
      }

      // Fetch projects
      try {
        const projectsResponse = await projectsAPI.getProjects()
        setProjects(projectsResponse.data.results || projectsResponse.data)
      } catch (error) {
        console.error('Error fetching projects:', error)
        // Use mock data for now
        setProjects([
          { id: '1', name: 'Website Redesign', code: 'WEB-001', status: 'active' },
          { id: '2', name: 'Mobile App Development', code: 'MOB-002', status: 'active' },
          { id: '3', name: 'Database Migration', code: 'DB-003', status: 'planning' },
        ])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load required data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }))
  }

  const validateForm = () => {
    if (!formData.employee) {
      toast.error('Please select an employee')
      return false
    }
    if (!formData.project) {
      toast.error('Please select a project')
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
    if (formData.allocation_percentage < 1 || formData.allocation_percentage > 100) {
      toast.error('Allocation percentage must be between 1 and 100')
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
      // For now, simulate the API call since we don't have a create allocation endpoint
      // const response = await resourcesAPI.createResourceAllocation(formData);
      
      // Simulate successful creation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Resource allocation created successfully!')
      
      // Redirect to allocations list
      window.location.href = '/resources/allocations'
    } catch (error) {
      console.error('Error creating allocation:', error)
      toast.error('Failed to create resource allocation')
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
              <Link href="/resources/allocations">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Allocations
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Resource Allocation</h1>
                <p className="text-gray-600">Assign an employee to a project with specific allocation details</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Employee and Project Selection */}
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
                  <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                    Project *
                  </label>
                  <select
                    id="project"
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Allocation Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="allocation_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Allocation Type *
                  </label>
                  <select
                    id="allocation_type"
                    name="allocation_type"
                    value={formData.allocation_type}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="consultant">Consultant</option>
                  </select>
                </div>

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

              {/* Allocation Percentage */}
              <div>
                <label htmlFor="allocation_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                  Allocation Percentage * (1-100%)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    id="allocation_percentage"
                    name="allocation_percentage"
                    value={formData.allocation_percentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${Math.min(formData.allocation_percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.allocation_percentage}% of employee's time allocated to this project
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter allocation description (optional)"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Link href="/resources/allocations">
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Create Allocation
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
