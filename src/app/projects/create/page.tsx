'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { projectsAPI, organizationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  code: z.string().min(1, 'Project code is required'),
  description: z.string().optional(),
  budget: z.string().min(1, 'Budget is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['draft', 'pending', 'approved', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  category: z.string().optional(),
  department: z.string().optional(),
  manager: z.string().optional(),
  team_members: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at?: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      priority: 'medium',
      status: 'planning',
      team_members: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories from API
        const categoriesResponse = await projectsAPI.getCategories();
        setCategories(categoriesResponse.data.results || categoriesResponse.data);

        // Fetch employees from organization API
        const employeesResponse = await organizationAPI.getEmployees();
        setEmployees(employeesResponse.data.results || employeesResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to mock data if API fails
        const mockCategories: Category[] = [
          { id: '1', name: 'Web Development', description: 'Web application development projects', color: '#3B82F6' },
          { id: '2', name: 'Mobile Development', description: 'Mobile app development projects', color: '#10B981' },
          { id: '3', name: 'Backend Development', description: 'Backend API and services', color: '#F59E0B' },
          { id: '4', name: 'Data Science', description: 'Data analysis and ML projects', color: '#8B5CF6' },
          { id: '5', name: 'UI/UX Design', description: 'User interface and experience design', color: '#EC4899' },
          { id: '6', name: 'DevOps', description: 'Infrastructure and deployment projects', color: '#6B7280' },
        ];

        const mockEmployees: Employee[] = [
          { id: '1', first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com', role: 'Project Manager' },
          { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@company.com', role: 'Lead Developer' },
          { id: '3', first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@company.com', role: 'Backend Developer' },
          { id: '4', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@company.com', role: 'Frontend Developer' },
          { id: '5', first_name: 'Tom', last_name: 'Brown', email: 'tom.brown@company.com', role: 'UI/UX Designer' },
          { id: '6', first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@company.com', role: 'QA Engineer' },
        ];

        setCategories(mockCategories);
        setEmployees(mockEmployees);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const projectData = {
        ...data,
        budget: parseFloat(data.budget),
        team_members: selectedTeamMembers,
      };

      // Create project using actual API
      await projectsAPI.createProject(projectData);

      router.push('/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamMemberToggle = (employeeId: string) => {
    setSelectedTeamMembers(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/projects">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                <p className="text-gray-600">Fill in the details to create a new project</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Project Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter project name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Project Code */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Project Code *
                  </label>
                  <input
                    {...register('code')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter project code (e.g., PROJ-001)"
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe the project goals and objectives"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority *
                  </label>
                  <select
                    {...register('priority')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {errors.priority && (
                    <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                    Budget ($) *
                  </label>
                  <input
                    {...register('budget')}
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    {...register('start_date')}
                    type="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date *
                  </label>
                  <input
                    {...register('end_date')}
                    type="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                  )}
                </div>

                {/* Project Manager */}
                <div>
                  <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                    Project Manager
                  </label>
                  <select
                    {...register('manager')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a project manager</option>
                    {employees
                      .filter(emp => emp.role.includes('Manager') || emp.role.includes('Lead'))
                      .map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name} - {employee.role}
                        </option>
                      ))}
                  </select>
                  {errors.manager && (
                    <p className="mt-1 text-sm text-red-600">{errors.manager.message}</p>
                  )}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Team Members
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {employees.map((employee) => (
                    <label
                      key={employee.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeamMembers.includes(employee.id)}
                        onChange={() => handleTeamMemberToggle(employee.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{employee.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link href="/projects">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
