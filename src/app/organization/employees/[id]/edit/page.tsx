'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// Form validation schema
const employeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().optional(),
  position: z.string().optional(),
  hire_date: z.string().optional(),
  salary: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

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


interface Department {
  id: string;
  name: string;
  code: string;
}

export default function EditEmployeePage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);


  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    position: '',
    hire_date: '',
    salary: '',
    status: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Finance' },
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'terminated', label: 'Terminated' },
  ];

  useEffect(() => {
    if (!id) return;
    fetchData(id);
  }, [id]);

  const fetchData = async (employeeId: string) => {
    try {
      setInitialLoading(true);

      const employeeResponse = await organizationAPI.getEmployee(employeeId);
      const raw = employeeResponse.data;
      const empData = raw?.results?.[0] ?? raw;

      // ✅ normalize to your form shape
      const normalized = {
        id: empData.employee_id ?? empData.id ?? employeeId,
        first_name: empData.first_name ?? empData.user?.first_name ?? '',
        last_name: empData.last_name ?? empData.user?.last_name ?? '',
        email: empData.email ?? empData.user?.email ?? '',
        phone: empData.phone ?? empData.user?.phone ?? '',
        role: empData.role ?? empData.user?.role ?? '',
        department: empData.department
          ? typeof empData.department === 'string'
            ? { id: empData.department }
            : empData.department
          : undefined,
        department_name: empData.department_name ?? '',
        
        position: empData.position ?? empData.job_title ?? '',
        hire_date: empData.hire_date ?? '',
        salary: empData.salary ?? '',
        status: empData.status ?? (empData.is_active ? 'active' : 'inactive'),
        created_at: empData.created_at,
        updated_at: empData.updated_at,
      };

      setEmployee(normalized);

      setFormData({
        first_name: normalized.first_name,
        last_name: normalized.last_name,
        email: normalized.email,
        phone: normalized.phone || '',
        role: normalized.role || '',
        department: normalized.department?.id || '',
        position: normalized.position || '',
        hire_date: normalized.hire_date || '',
        salary: normalized.salary || '',
        status: normalized.status || 'active',
      });

      const departmentsResponse = await organizationAPI.getDepartments();
      setDepartments(departmentsResponse.data.results || departmentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load employee data');
    } finally {
      setInitialLoading(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (formData.salary && parseFloat(formData.salary) < 0) newErrors.salary = 'Salary must be a positive number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!id) return;

    setLoading(true);
    try {
      const payload: any = {
        // ✅ employee fields (these exist on Employee now)
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),

        hire_date: formData.hire_date || null,
        job_title: formData.position || null,   // ✅ map position -> job_title
        salary: formData.salary ? parseFloat(formData.salary) : null,
        department: formData.department || null,

        // ✅ map status -> is_active (since your model uses is_active)
        is_active: formData.status === 'active',
      };

      // ⚠️ Only include these if Employee model actually has these fields.
      // If phone/role are only on User, sending them will error or be ignored.
      // payload.phone = formData.phone || null;
      // payload.role = formData.role;

      await organizationAPI.updateEmployee(id, payload);

      toast.success('Employee updated successfully');
      router.push(`/organization/employees/${id}`);
    } catch (error) {
      console.error('Failed to update employee:', error);
      toast.error('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };


  if (initialLoading) {
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
            <div className="flex items-center space-x-4">
              <Link href={`/organization/employees/${params.id}`}>
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Employee
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
                <p className="text-gray-600">Update employee information</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.first_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.last_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.role ? 'border-red-300' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.status ? 'border-red-300' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select Status</option>
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">None</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter position"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.salary ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter salary"
                  />
                  {errors.salary && <p className="mt-1 text-sm text-red-600">{errors.salary}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href={`/organization/employees/${params.id}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Employee'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
