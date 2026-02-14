'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  description: string;
  project_id: string;
  start_date: string;
  end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  budget: string;
  actual_cost: string;
  manager_id?: string;
  sequence: number;
  status: string;
  progress: number;
}

interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  project_name?: string;
  project_id?: string;
  start_date?: string;
  end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  progress: number;
  status: string;
  sequence: number;
  budget?: string;
  actual_cost?: string;
  manager_name?: string;
  manager_id?: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function EditProjectPhasePage({ params }: { params: { projectId: string, phaseId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    project_id: '',
    start_date: '',
    end_date: '',
    actual_start_date: '',
    actual_end_date: '',
    budget: '',
    actual_cost: '',
    manager_id: '',
    sequence: 1,
    status: 'not_started',
    progress: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
    fetchPhaseDetails();
  }, [params.projectId, params.phaseId]);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getProjects();
      setProjects(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const fetchEmployees = async () => {
    try {
      // Using projectsAPI as placeholder - should use organizationAPI
      setEmployees([]);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchPhaseDetails = async () => {
    try {
      setFetchLoading(true);
      const response = await projectsAPI.getProjectPhase(params.projectId, params.phaseId);
      const phaseData = response.data;
      
      setFormData({
        name: phaseData.name,
        description: phaseData.description || '',
        project_id: phaseData.project_id || params.projectId,
        start_date: phaseData.start_date || '',
        end_date: phaseData.end_date || '',
        actual_start_date: phaseData.actual_start_date || '',
        actual_end_date: phaseData.actual_end_date || '',
        budget: phaseData.budget || '',
        actual_cost: phaseData.actual_cost || '',
        manager_id: phaseData.manager_id || '',
        sequence: phaseData.sequence,
        status: phaseData.status,
        progress: phaseData.progress,
      });
    } catch (error) {
      console.error('Failed to fetch phase details:', error);
      toast.error('Failed to load phase details');
      router.push(`/projects/${params.projectId}`);
    } finally {
      setFetchLoading(false);
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

    if (!formData.name.trim()) {
      newErrors.name = 'Phase name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Phase name must be at least 2 characters';
    }

    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (formData.actual_start_date && formData.actual_end_date && formData.actual_start_date > formData.actual_end_date) {
      newErrors.actual_end_date = 'Actual end date must be after actual start date';
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }

    if (formData.actual_cost && isNaN(parseFloat(formData.actual_cost))) {
      newErrors.actual_cost = 'Actual cost must be a valid number';
    }

    if (formData.sequence && formData.sequence < 1) {
      newErrors.sequence = 'Sequence must be at least 1';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
        manager_id: formData.manager_id || null,
        sequence: parseInt(formData.sequence.toString()),
        progress: parseInt(formData.progress.toString()),
      };

      await projectsAPI.updateProjectPhase(params.projectId, params.phaseId, submitData);
      toast.success('Phase updated successfully');
      router.push(`/projects/phases/${params.projectId}/${params.phaseId}`);
    } catch (error: any) {
      console.error('Failed to update phase:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update phase';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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

  const selectedProject = projects.find(p => p.id === formData.project_id);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center">
            <Link href={`/projects/phases/${params.projectId}/${params.phaseId}`}>
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Phase
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Phase</h1>
              <p className="text-gray-600">Update phase information</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Project Selection */}
              <div>
                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                <select
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.project_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </option>
                  ))}
                </select>
                {errors.project_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_id}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Phase Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Design Phase, Development Sprint 1"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
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
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Detailed description of this phase..."
                />
              </div>

              {/* Planned Dates */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Planned Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.end_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.end_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actual Dates */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Actual Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="actual_start_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Start Date
                    </label>
                    <input
                      type="date"
                      id="actual_start_date"
                      name="actual_start_date"
                      value={formData.actual_start_date}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="actual_end_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Actual End Date
                    </label>
                    <input
                      type="date"
                      id="actual_end_date"
                      name="actual_end_date"
                      value={formData.actual_end_date}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.actual_end_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.actual_end_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.actual_end_date}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget and Costs */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Budget & Costs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                      Budget
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className={`block w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          errors.budget ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.budget && (
                      <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="actual_cost" className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Cost
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        id="actual_cost"
                        name="actual_cost"
                        value={formData.actual_cost}
                        onChange={handleInputChange}
                        className={`block w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          errors.actual_cost ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.actual_cost && (
                      <p className="mt-1 text-sm text-red-600">{errors.actual_cost}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sequence, Status, and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="sequence" className="block text-sm font-medium text-gray-700 mb-2">
                    Sequence
                  </label>
                  <input
                    type="number"
                    id="sequence"
                    name="sequence"
                    value={formData.sequence}
                    onChange={handleInputChange}
                    min="1"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.sequence ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.sequence && (
                    <p className="mt-1 text-sm text-red-600">{errors.sequence}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-2">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    id="progress"
                    name="progress"
                    value={formData.progress}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.progress ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.progress && (
                    <p className="mt-1 text-sm text-red-600">{errors.progress}</p>
                  )}
                </div>
              </div>

              {/* Manager */}
              <div>
                <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Phase Manager
                </label>
                <select
                  id="manager_id"
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a manager (optional)</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link href={`/projects/phases/${params.projectId}/${params.phaseId}`}>
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Update Phase
                    </>
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
