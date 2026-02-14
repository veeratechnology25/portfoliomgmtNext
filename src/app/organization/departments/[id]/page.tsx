'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  manager_name?: string;
  manager?: string;
  manager_email?: string;
  manager_phone?: string;
  parent_department_name?: string;
  parent_department?: string;
  budget?: string;
  employee_count?: number;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  department_name?: string;
}

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [department, setDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const id = React.use(params).id;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch department details
      const departmentResponse = await organizationAPI.getDepartment(id);
      setDepartment(departmentResponse.data);
      
      // Fetch department employees
      const employeesResponse = await organizationAPI.getEmployees({ department: id });
      setEmployees(employeesResponse.data.results || employeesResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load department details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      await organizationAPI.deleteDepartment(id);
      toast.success('Department deleted successfully');
      window.location.href = '/organization/departments';
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.error('Failed to delete department');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!department) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Department not found</h3>
            <p className="mt-1 text-sm text-gray-500">The department you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/organization/departments">
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Departments
                </Button>
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/organization/departments">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Departments
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
                <p className="text-gray-600">Department Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/organization/departments/${id}/edit`}>
                <Button variant="outline">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Department Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{department.name}</h2>
                  <p className="text-gray-500">{department.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {department.employee_count || 0}
                </p>
                <p className="text-sm text-gray-500">Employees</p>
              </div>
            </div>

            {department.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{department.description}</p>
              </div>
            )}

            {/* Department Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Department Code</h3>
                <p className="text-gray-900">{department.code}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Employee Count</h3>
                <p className="text-gray-900">{department.employee_count || 0} employees</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Budget</h3>
                <p className="text-gray-900 font-medium">
                  {department.budget ? formatCurrency(parseFloat(department.budget)) : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Parent Department</h3>
                <p className="text-gray-900">
                  {department.parent_department_name || 'None'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created Date</h3>
                <p className="text-gray-900">{formatDate(department.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Last Updated</h3>
                <p className="text-gray-900">{formatDate(department.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Department Manager */}
          {department.manager_name && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Manager</h3>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <UserIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{department.manager_name}</h4>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    {department.manager_email && (
                      <span className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {department.manager_email}
                      </span>
                    )}
                    {department.manager_phone && (
                      <span className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {department.manager_phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Department Employees */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Department Employees</h3>
              <Link href="/organization/employees">
                <Button variant="outline" size="sm">View All Employees</Button>
              </Link>
            </div>
            
            {employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </h4>
                        <p className="text-sm text-gray-500">{employee.position || 'No position'}</p>
                        <p className="text-xs text-gray-400">{employee.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees in this department</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Employees assigned to this department will appear here.
                </p>
                <div className="mt-6">
                  <Link href="/organization/employees">
                    <Button variant="outline">Manage Employees</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
