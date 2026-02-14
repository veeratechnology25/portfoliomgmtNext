'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  updated_by_name?: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  progress: number;
}

export default function ProjectPhaseDetailPage({ params }: { params: { projectId: string, phaseId: string } }) {
  const [phase, setPhase] = useState<ProjectPhase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhaseDetails();
    fetchProjectDetails();
  }, [params.projectId, params.phaseId]);

  const fetchPhaseDetails = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getProjectPhase(params.projectId, params.phaseId);
      setPhase(response.data);
    } catch (error) {
      console.error('Failed to fetch phase details:', error);
      toast.error('Failed to load phase details');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await projectsAPI.getProject(params.projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this phase? This action cannot be undone.')) {
      return;
    }

    try {
      await projectsAPI.deleteProjectPhase(params.projectId, params.phaseId);
      toast.success('Phase deleted successfully');
      window.location.href = `/projects/${params.projectId}`;
    } catch (error) {
      console.error('Failed to delete phase:', error);
      toast.error('Failed to delete phase');
    }
  };

  const handleProgressUpdate = async () => {
    const newProgress = prompt('Enter new progress percentage (0-100):', phase?.progress.toString());
    if (newProgress === null) return;

    const progress = parseInt(newProgress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      toast.error('Please enter a valid progress percentage (0-100)');
      return;
    }

    try {
      await projectsAPI.updateProjectProgress(params.projectId, { progress });
      toast.success('Progress updated successfully');
      fetchPhaseDetails();
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
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

  if (!phase) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Phase not found</h3>
            <p className="mt-1 text-sm text-gray-500">The phase you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href={`/projects/${params.projectId}`}>
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Project
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
              <Link href={`/projects/${params.projectId}`}>
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Project
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{phase.name}</h1>
                <p className="text-gray-600">
                  Phase {phase.sequence} {project && `of ${project.name}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleProgressUpdate}>
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Update Progress
              </Button>
              <Link href={`/projects/phases/${params.projectId}/${params.phaseId}/edit`}>
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

          {/* Phase Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{phase.name}</h2>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(phase.status)}`}>
                      {phase.status.replace('_', ' ')}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">Phase {phase.sequence}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {phase.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{phase.description}</p>
                  </div>
                )}

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Progress</h3>
                    <span className="text-sm font-medium text-gray-900">{phase.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Planned Dates</h3>
                    <div className="space-y-2">
                      {phase.start_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Start: {formatDate(phase.start_date)}
                        </div>
                      )}
                      {phase.end_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          End: {formatDate(phase.end_date)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Actual Dates</h3>
                    <div className="space-y-2">
                      {phase.actual_start_date ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Started: {formatDate(phase.actual_start_date)}
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-400">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Not started yet
                        </div>
                      )}
                      {phase.actual_end_date ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Completed: {formatDate(phase.actual_end_date)}
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-400">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Not completed yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Budget */}
                {(phase.budget || phase.actual_cost) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Budget</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phase.budget && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                          Budget: ${parseFloat(phase.budget).toLocaleString()}
                        </div>
                      )}
                      {phase.actual_cost && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                          Actual Cost: ${parseFloat(phase.actual_cost).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {phase.budget && phase.actual_cost && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Budget Utilization</span>
                          <span className="font-medium">
                            {((parseFloat(phase.actual_cost) / parseFloat(phase.budget)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              parseFloat(phase.actual_cost) > parseFloat(phase.budget) 
                                ? 'bg-red-600' 
                                : 'bg-green-600'
                            }`}
                            style={{ 
                              width: `${Math.min((parseFloat(phase.actual_cost) / parseFloat(phase.budget)) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* People */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">People</h3>
                  <div className="space-y-2">
                    {phase.manager_name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Phase Manager: {phase.manager_name}
                      </div>
                    )}
                    {phase.created_by_name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Created by: {phase.created_by_name}
                      </div>
                    )}
                    {phase.updated_by_name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Updated by: {phase.updated_by_name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Created: {formatDate(phase.created_at)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Updated: {formatDate(phase.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Context */}
          {project && (
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Context</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">{project.code}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Project Progress: {project.progress}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
