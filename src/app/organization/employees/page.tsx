'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { formatDate, getRoleDisplayName } from '@/lib/utils';
import Link from 'next/link';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: {
    id: string;
    name: string;
  };
  position: string;
  hire_date: string;
  status: string;
  avatar?: string;
  skills: Array<{
    id: string;
    name: string;
    level: string;
  }>;
  projects_count: number;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Mock data - replace with actual API call
        const mockEmployees: Employee[] = [
          {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@company.com',
            phone: '+1 (555) 123-4567',
            role: 'project_manager',
            department: {
              id: '1',
              name: 'Engineering',
            },
            position: 'Senior Project Manager',
            hire_date: '2020-03-15',
            status: 'active',
            skills: [
              { id: '1', name: 'Project Management', level: 'Expert' },
              { id: '2', name: 'Agile', level: 'Advanced' },
              { id: '3', name: 'Team Leadership', level: 'Expert' },
            ],
            projects_count: 5,
            manager: {
              id: '2',
              first_name: 'Jane',
              last_name: 'Smith',
            },
            created_at: '2020-03-15',
            updated_at: '2024-01-20',
          },
          {
            id: '2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@company.com',
            phone: '+1 (555) 123-4568',
            role: 'manager',
            department: {
              id: '1',
              name: 'Engineering',
            },
            position: 'Engineering Manager',
            hire_date: '2019-06-01',
            status: 'active',
            skills: [
              { id: '4', name: 'Software Architecture', level: 'Expert' },
              { id: '5', name: 'Team Management', level: 'Expert' },
              { id: '6', name: 'Cloud Computing', level: 'Advanced' },
            ],
            projects_count: 8,
            created_at: '2019-06-01',
            updated_at: '2024-01-18',
          },
          {
            id: '3',
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@company.com',
            phone: '+1 (555) 123-4569',
            role: 'employee',
            department: {
              id: '1',
              name: 'Engineering',
            },
            position: 'Senior Developer',
            hire_date: '2021-01-15',
            status: 'active',
            skills: [
              { id: '7', name: 'JavaScript', level: 'Expert' },
              { id: '8', name: 'React', level: 'Advanced' },
              { id: '9', name: 'Node.js', level: 'Advanced' },
            ],
            projects_count: 3,
            manager: {
              id: '2',
              first_name: 'Jane',
              last_name: 'Smith',
            },
            created_at: '2021-01-15',
            updated_at: '2024-01-15',
          },
          {
            id: '4',
            first_name: 'Sarah',
            last_name: 'Wilson',
            email: 'sarah.wilson@company.com',
            phone: '+1 (555) 123-4570',
            role: 'employee',
            department: {
              id: '2',
              name: 'Marketing',
            },
            position: 'Marketing Specialist',
            hire_date: '2021-09-01',
            status: 'active',
            skills: [
              { id: '10', name: 'Digital Marketing', level: 'Advanced' },
              { id: '11', name: 'Content Strategy', level: 'Advanced' },
              { id: '12', name: 'SEO', level: 'Intermediate' },
            ],
            projects_count: 4,
            manager: {
              id: '5',
              first_name: 'Tom',
              last_name: 'Brown',
            },
            created_at: '2021-09-01',
            updated_at: '2024-01-12',
          },
          {
            id: '5',
            first_name: 'Tom',
            last_name: 'Brown',
            email: 'tom.brown@company.com',
            phone: '+1 (555) 123-4571',
            role: 'manager',
            department: {
              id: '2',
              name: 'Marketing',
            },
            position: 'Marketing Manager',
            hire_date: '2018-11-15',
            status: 'active',
            skills: [
              { id: '13', name: 'Marketing Strategy', level: 'Expert' },
              { id: '14', name: 'Brand Management', level: 'Expert' },
              { id: '15', name: 'Team Leadership', level: 'Advanced' },
            ],
            projects_count: 6,
            created_at: '2018-11-15',
            updated_at: '2024-01-10',
          },
          {
            id: '6',
            first_name: 'Emily',
            last_name: 'Davis',
            email: 'emily.davis@company.com',
            phone: '+1 (555) 123-4572',
            role: 'hr',
            department: {
              id: '3',
              name: 'Human Resources',
            },
            position: 'HR Specialist',
            hire_date: '2022-02-01',
            status: 'active',
            skills: [
              { id: '16', name: 'Recruitment', level: 'Advanced' },
              { id: '17', name: 'Employee Relations', level: 'Advanced' },
              { id: '18', name: 'HR Policies', level: 'Intermediate' },
            ],
            projects_count: 2,
            manager: {
              id: '7',
              first_name: 'Lisa',
              last_name: 'Anderson',
            },
            created_at: '2022-02-01',
            updated_at: '2024-01-08',
          },
        ];

        setEmployees(mockEmployees);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(search.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.position.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department.name === departmentFilter;
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;

    return matchesSearch && matchesStatus && matchesDepartment && matchesRole;
  });

  const departments = [...new Set(employees.map(e => e.department.name))];
  const roles = [...new Set(employees.map(e => e.role))];
  const activeEmployees = employees.filter(e => e.status === 'active').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
              <p className="text-gray-600">Manage team members and their information</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/organization">
                <Button variant="outline">Back to Organization</Button>
              </Link>
              <Button className="flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <UserIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <UserIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {employees.filter(e => {
                      const hireDate = new Date(e.hire_date);
                      const now = new Date();
                      return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Employees
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search employees..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Roles</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employees List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="min-w-full divide-y divide-gray-200">
              <div className="bg-gray-50 px-6 py-3">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
              </div>
              <div className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-700">
                              {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {employee.first_name} {employee.last_name}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                              {employee.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{employee.department.name}</span>
                            <span>•</span>
                            <span>{getRoleDisplayName(employee.role)}</span>
                            <span>•</span>
                            <span>Hired {formatDate(employee.hire_date)}</span>
                          </div>
                          
                          {/* Skills */}
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {employee.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {skill.name}
                                </span>
                              ))}
                              {employee.skills.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{employee.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{employee.projects_count} projects</p>
                          <p className="text-sm text-gray-500">Active</p>
                        </div>
                        
                        <div className="flex flex-col space-y-1 text-right">
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-[150px]">{employee.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {employee.phone}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link href={`/organization/employees/${employee.id}`}>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </Link>
                          <button className="text-gray-400 hover:text-gray-600">
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
