'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  AcademicCapIcon,
  StarIcon,
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
  role?: string;
  department?: { id: string; name?: string; code?: string };
  department_name?: string;
  position?: string;
  hire_date?: string;
  salary?: string;
  status: string;
  created_at: string;
  updated_at: string;
}


interface Skill {
  id: string;
  name: string;
  description?: string;
  proficiency_level?: string;
}

interface EmployeeSkill {
  id: string;
  employee: string;
  skill: string;
  skill_name: string;
  proficiency_level: string;
  years_of_experience?: number;
  certification_details?: string;
  created_at: string;
}

// ...your imports

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;            // ✅ prevents calling API with undefined
    fetchData(id);
  }, [id]);

  const fetchData = async (employeeId: string) => {
    try {
      setLoading(true);

      const employeeResponse = await organizationAPI.getEmployee(employeeId);
     const e = employeeResponse.data;

      // if your getEmployee endpoint returns {results:[...]} sometimes:
      const item = e?.results?.[0] ?? e;

      const normalized: Employee = {
        id: item.employee_id ?? item.id ?? params.id,
        first_name: item.first_name ?? item.user?.first_name ?? '',
        last_name: item.last_name ?? item.user?.last_name ?? '',
        email: item.email ?? item.user?.email ?? '',
        phone: item.phone ?? item.user?.phone ?? '',
        role: item.role ?? item.user?.role ?? '',
        position: item.position ?? item.job_title ?? '',
        hire_date: item.hire_date ?? '',
        salary: item.salary ?? '',
        status: item.status ?? (item.is_active ? 'active' : 'inactive'),
        created_at: item.created_at,
        updated_at: item.updated_at,

        // API gives department as UUID string; keep it as {id} so your links work
        department: item.department ? { id: item.department } : undefined,
        department_name: item.department_name ?? '',
      };

      setEmployee(normalized);


      // Fetch employee skills
      const skillsResponse = await organizationAPI.getEmployeeSkills({ employee: params.id });
      setEmployeeSkills(skillsResponse.data.results || skillsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await organizationAPI.deleteEmployee(params.id);
      toast.success('Employee deleted successfully');
      window.location.href = '/organization/employees';
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-green-100 text-green-800';
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

  if (!employee) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Employee not found</h3>
            <p className="mt-1 text-sm text-gray-500">The employee you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/organization/employees">
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Employees
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
              <Link href="/organization/employees">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Employees
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employee.first_name} {employee.last_name}
                </h1>
                <p className="text-gray-600">Employee Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/organization/employees/${params.id}/edit`}>
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

          {/* Employee Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </h2>
                  <p className="text-gray-500">{employee.position || 'No position'}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                      {employee.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getRoleDisplayName(employee.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Email</h3>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <a href={`mailto:${employee.email}`} className="text-blue-600 hover:text-blue-800">
                    {employee.email}
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Phone</h3>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{employee.phone || 'Not provided'}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Department</h3>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  {employee.department ? (
                    <Link
                      href={`/organization/departments/${employee.department.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {employee.department_name || 'View Department'}
                    </Link>
                  ) : (
                    <span className="text-gray-900">{employee.department_name || 'Not assigned'}</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Position</h3>
                <p className="text-gray-900">{employee.position || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hire Date</h3>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {employee.hire_date ? formatDate(employee.hire_date) : 'Not specified'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Salary</h3>
                <p className="text-gray-900 font-medium">
                  {employee.salary ? `$${parseFloat(employee.salary).toLocaleString()}` : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created Date</h3>
                <p className="text-gray-900">{formatDate(employee.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Last Updated</h3>
                <p className="text-gray-900">{formatDate(employee.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Employee Skills */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Skills & Expertise</h3>
              <Link href={`/organization/employees/${params.id}/skills`}>
                <Button variant="outline" size="sm">Manage Skills</Button>
              </Link>
            </div>

            {employeeSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employeeSkills.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{skill.skill_name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProficiencyColor(skill.proficiency_level)}`}>
                        {skill.proficiency_level}
                      </span>
                    </div>
                    {skill.years_of_experience && (
                      <p className="text-sm text-gray-600 mb-1">
                        {skill.years_of_experience} years experience
                      </p>
                    )}
                    {skill.certification_details && (
                      <p className="text-xs text-gray-500 italic">
                        {skill.certification_details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No skills recorded</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Skills and certifications for this employee will appear here.
                </p>
                <div className="mt-6">
                  <Link href={`/organization/employees/${params.id}/skills`}>
                    <Button variant="outline">Add Skills</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/organization/employees/${params.id}/edit`}>
                <Button variant="outline" className="w-full justify-center">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Employee
                </Button>
              </Link>
              <Link href={`/organization/employees/${params.id}/skills`}>
                <Button variant="outline" className="w-full justify-center">
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  Manage Skills
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-center text-red-600 hover:text-red-700">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Employee
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
