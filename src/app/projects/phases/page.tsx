'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
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
  created_at: string;
  updated_at: string;
}

export default function ProjectPhasesPage() {
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

const fetchingRef = useRef(false);

useEffect(() => {
  if (fetchingRef.current) return;
  fetchingRef.current = true;

  fetchData().finally(() => {
    fetchingRef.current = false;
  });
}, []);

const fetchData = async () => {
  try {
    setLoading(true);

    const projectsResponse = await projectsAPI.getProjects();
    const projectsData = projectsResponse.data?.results ?? projectsResponse.data ?? [];
    const projectsArray = Array.isArray(projectsData) ? projectsData : [];

    setProjects(projectsArray);

    const allPhases: ProjectPhase[] = [];

    for (const project of projectsArray) {
      try {
        const phasesResponse = await projectsAPI.getProjectPhases(project.id);
        const projectPhases = phasesResponse.data?.results ?? phasesResponse.data ?? [];
        const phasesArray = Array.isArray(projectPhases) ? projectPhases : [];

        allPhases.push(
          ...phasesArray.map((phase: any) => ({
            ...phase,
            project_name: project.name,
            project_id: project.id,
          }))
        );
      } catch (error) {
        console.error(`Failed to fetch phases for project ${project.id}:`, error);
      }
    }

    setPhases(allPhases);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    toast.error("Failed to load phases");
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (projectId: string, phaseId: string) => {
    if (!confirm('Are you sure you want to delete this phase?')) return;

    try {
      await projectsAPI.deleteProjectPhase(projectId, phaseId);
      toast.success('Phase deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete phase:', error);
      toast.error('Failed to delete phase');
    }
  };

  const filteredPhases = phases.filter((phase) => {
    const matchesSearch = phase.name.toLowerCase().includes(search.toLowerCase()) ||
                         (phase.description?.toLowerCase().includes(search.toLowerCase()) || '') ||
                         (phase.project_name?.toLowerCase().includes(search.toLowerCase()) || '');
    const matchesProject = projectFilter === 'all' || phase.project_id === projectFilter;
    const matchesStatus = statusFilter === 'all' || phase.status === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  const sortedPhases = [...filteredPhases].sort((a, b) => {
    // Sort by project name, then by sequence
    if (a.project_name !== b.project_name) {
      return (a.project_name || '').localeCompare(b.project_name || '');
    }
    return a.sequence - b.sequence;
  });

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
              <h1 className="text-2xl font-bold text-gray-900">Project Phases</h1>
              <p className="text-gray-600">Manage project phases and milestones</p>
            </div>
            <Link href="/projects/phases/create">
              <Button className="flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Phase
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Phases
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
                    placeholder="Search phases..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
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
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Phases List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {sortedPhases.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {sortedPhases.map((phase) => (
                  <div key={`${phase.project_id}-${phase.id}`} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <ClockIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{phase.name}</h3>
                              <span className="ml-3 text-sm text-gray-500">
                                Phase {phase.sequence}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(phase.status)}`}>
                                {phase.status.replace('_', ' ')}
                              </span>
                              {phase.project_name && (
                                <Link href={`/projects/${phase.project_id}`} className="ml-3 text-sm text-blue-600 hover:text-blue-800">
                                  {phase.project_name}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {phase.description || 'No description available'}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {phase.start_date && phase.end_date
                              ? `${formatDate(phase.start_date)} - ${formatDate(phase.end_date)}`
                              : 'No dates set'
                            }
                          </div>

                          {phase.manager_name && (
                            <div className="flex items-center text-sm text-gray-500">
                              <UserIcon className="h-4 w-4 mr-2" />
                              {phase.manager_name}
                            </div>
                          )}

                          {phase.budget && (
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="font-medium">Budget: ${parseFloat(phase.budget).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{phase.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${phase.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        <Link href={`/projects/phases/${phase.project_id}/${phase.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/projects/phases/${phase.project_id}/${phase.id}/edit`}>
                          <button className="text-gray-400 hover:text-blue-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(phase.project_id!, phase.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No phases found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || projectFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new phase'
                  }
                </p>
                {!search && projectFilter === 'all' && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/projects/phases/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Phase
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
