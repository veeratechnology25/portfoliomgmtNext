'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  CurrencyDollarIcon,
  UserIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Department } from '@/types/organization';

export default function OrganizationPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('departments');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await organizationAPI.getDepartments();
        setDepartments(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        // Fallback to mock data if API fails
        const mockDepartments: Department[] = [
          {
            id: '1',
            name: 'Engineering',
            code: 'ENG',
            description: 'Software development and technical operations',
            manager_name: 'John Doe',
            manager: '1',
            parent_department_name: undefined,
            parent_department: undefined,
            budget: '500000.00',
            created_at: '2023-01-15T10:00:00Z',
            updated_at: '2024-01-20T14:30:00Z',
          },
          {
            id: '2',
            name: 'Marketing',
            code: 'MKT',
            description: 'Marketing campaigns and brand management',
            manager_name: 'Jane Smith',
            manager: '2',
            parent_department_name: undefined,
            parent_department: undefined,
            budget: '200000.00',
            created_at: '2023-01-20T11:00:00Z',
            updated_at: '2024-01-18T16:20:00Z',
          },
          {
            id: '3',
            name: 'Human Resources',
            code: 'HR',
            description: 'Employee relations and talent management',
            manager_name: 'Mike Johnson',
            manager: '3',
            parent_department_name: undefined,
            parent_department: undefined,
            budget: '150000.00',
            created_at: '2023-02-01T09:00:00Z',
            updated_at: '2024-01-15T10:15:00Z',
          },
          {
            id: '4',
            name: 'Finance',
            code: 'FIN',
            description: 'Financial planning and accounting',
            manager_name: 'Sarah Wilson',
            manager: '4',
            parent_department_name: undefined,
            parent_department: undefined,
            budget: '180000.00',
            created_at: '2023-01-10T13:00:00Z',
            updated_at: '2024-01-22T11:45:00Z',
          },
          {
            id: '5',
            name: 'Frontend Development',
            code: 'ENG-FE',
            description: 'Frontend and UI development team',
            manager_name: 'Alice Brown',
            manager: '5',
            parent_department_name: 'Engineering',
            parent_department: '1',
            budget: '200000.00',
            created_at: '2023-03-01T08:00:00Z',
            updated_at: '2024-01-19T15:30:00Z',
          },
          {
            id: '6',
            name: 'Backend Development',
            code: 'ENG-BE',
            description: 'Backend and API development team',
            manager_name: 'Bob Davis',
            manager: '6',
            parent_department_name: 'Engineering',
            parent_department: '1',
            budget: '300000.00',
            created_at: '2023-03-01T08:30:00Z',
            updated_at: '2024-01-21T12:00:00Z',
          },
        ];

        setDepartments(mockDepartments);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter((department) => {
    return department.name.toLowerCase().includes(search.toLowerCase()) ||
           department.description?.toLowerCase().includes(search.toLowerCase()) ||
           department.code.toLowerCase().includes(search.toLowerCase());
  });

  const totalBudget = departments.reduce((sum, dept) => sum + parseFloat(dept.budget || '0'), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization</h1>
              <p className="text-gray-600">Manage departments and employees</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/organization/departments">
                <Button variant="outline" className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  Departments
                </Button>
              </Link>
              <Link href="/organization/employees">
                <Button variant="outline" className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Employees
                </Button>
              </Link>
              <Link href="/organization/skills">
                <Button variant="outline" className="flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  Skills
                </Button>
              </Link>
              <Link href="/organization/employee-skills">
                <Button variant="outline" className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Employee Skills
                </Button>
              </Link>
              <Link href="/organization/departments/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Department
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sub Departments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.filter(d => d.parent_department_name).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Managers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.filter(d => d.manager_name).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('departments')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'departments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Departments
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'departments' && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search departments..."
                      />
                    </div>
                  </div>

                  {/* Departments Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepartments.map((department) => (
                      <div key={department.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                              <p className="text-sm text-gray-500">Code: {department.code}</p>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {department.description}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Manager</span>
                            <span className="font-medium text-gray-900">
                              {department.manager_name || 'Unassigned'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Budget</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(parseFloat(department.budget || '0'))}
                            </span>
                          </div>
                          
                          {department.parent_department_name && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Parent Dept</span>
                              <span className="font-medium text-gray-900">
                                {department.parent_department_name}
                              </span>
                            </div>
                          )}
                        </div>


                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex space-x-2">
                            <Link href={`/organization/departments/${department.id}`}>
                              <Button variant="outline" size="sm" className="flex-1">
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/organization/employees?department=${department.id}`}>
                              <Button variant="outline" size="sm" className="flex-1">
                                View Team
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredDepartments.length === 0 && (
                    <div className="text-center py-12">
                      <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Department Distribution</h4>
                        <div className="space-y-2">
                          {departments.map((dept) => (
                            <div key={dept.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{dept.name}</span>
                              <span className="text-sm font-medium text-gray-900">{dept.code}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Budget Allocation</h4>
                        <div className="space-y-2">
                          {departments.map((dept) => (
                            <div key={dept.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{dept.name}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(parseFloat(dept.budget || '0'))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">Total Departments</h4>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {departments.length}
                        </p>
                        <p className="text-sm text-gray-600">active departments</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">Average Department Budget</h4>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {departments.length > 0 ? formatCurrency(totalBudget / departments.length) : formatCurrency(0)}
                        </p>
                        <p className="text-sm text-gray-600">per department</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">Managed Departments</h4>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {departments.filter(d => d.manager_name).length}
                        </p>
                        <p className="text-sm text-gray-600">with assigned managers</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
