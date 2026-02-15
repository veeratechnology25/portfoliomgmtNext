'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { formatDate, getRoleDisplayName } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  department?: {
    id: string;
    name: string;
  };
  position?: string;
  hire_date?: string;
  status: string;
  skills?: Array<{ id: string; name: string; level: string }>;
  projects_count?: number;
  created_at?: string;
  updated_at?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // ✅ Real backend call (replace params if your API supports pagination/filter)
      // Supports common shapes:
      // - { data: { results: [] } }
      // - { data: [] }
      const res = await organizationAPI.getEmployees?.({});
      const raw = res?.data?.results ?? res?.data ?? [];

      const normalized: Employee[] = raw.map((e: any) => ({
        id: e.employee_id, // IMPORTANT: use employee_id for routes/delete
        first_name: e?.first_name ?? '',
        last_name: e?.last_name ?? '',
        email: e?.email ?? '',
        phone: e.user?.phone ?? '',
        role: e.user?.role ?? '',
        department: e.department
          ? { id: e.department.id, name: e.department.name }
          : (e.user?.department
            ? { id: e.user.department.id, name: e.user.department.name }
            : undefined),
        position: e.job_title ?? '',
        hire_date: e.hire_date ?? '',
        status: e.is_active ? 'active' : 'inactive',
        skills: e.skills ?? [],
        projects_count: e.projects_count ?? 0,
        created_at: e.created_at,
        updated_at: e.updated_at,
      }));

      setEmployees(normalized);

    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm('Are you sure you want to delete this employee? This action cannot be undone.');
    if (!ok) return;

    try {
      await organizationAPI.deleteEmployee(id);
      toast.success('Employee deleted');
      // refresh list
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        employee.first_name?.toLowerCase().includes(q) ||
        employee.last_name?.toLowerCase().includes(q) ||
        employee.email?.toLowerCase().includes(q) ||
        (employee.position ?? '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      const matchesDepartment =
        departmentFilter === 'all' || (employee.department?.name ?? '') === departmentFilter;
      const matchesRole = roleFilter === 'all' || employee.role === roleFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesRole;
    });
  }, [employees, search, statusFilter, departmentFilter, roleFilter]);

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department?.name).filter(Boolean) as string[])],
    [employees]
  );

  const roles = useMemo(
    () => [...new Set(employees.map((e) => e.role).filter(Boolean))],
    [employees]
  );

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === 'active').length,
    [employees]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
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

              {/* ✅ Use a route that exists. If your create page is /new, use /new */}
              <Link href="/organization/employees/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </Link>
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
                    {employees.filter((e) => {
                      if (!e.hire_date) return false;
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Employees</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search employees..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <Button variant="outline" onClick={fetchEmployees}>Refresh</Button>
              </div>

              <div className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-700">
                              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
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

                          <p className="text-sm text-gray-500">{employee.position || 'No position'}</p>

                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{employee.department?.name || 'No department'}</span>
                            <span>•</span>
                            <span>{getRoleDisplayName(employee.role)}</span>
                            <span>•</span>
                            <span>Hired {employee.hire_date ? formatDate(employee.hire_date) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col space-y-1 text-right">
                          <div className="flex items-center text-sm text-gray-500 justify-end">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-[180px]">{employee.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 justify-end">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            <span>{employee.phone || 'N/A'}</span>
                          </div>
                        </div>

                        {/* ✅ ACTIONS */}
                        <div className="flex items-center gap-2">
                          <Link href={`/organization/employees/${employee.id}`}>
                            <Button variant="outline" size="sm">
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>

                          <Link href={`/organization/employees/${employee.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </Button>

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
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
