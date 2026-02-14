'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  project_count?: number;
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
  manager_name?: string;
  end_date?: string;
}

export default function ProjectCategoryDetailPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    fetchCategoryDetails();
  }, [params.id]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getCategories();
      const categories = response.data.results || response.data;
      const categoryData = categories.find((c: ProjectCategory) => c.id === params.id);
      
      if (!categoryData) {
        toast.error('Category not found');
        return;
      }
      
      setCategory(categoryData);
      
      // Fetch projects in this category
      setProjectsLoading(true);
      const projectsResponse = await projectsAPI.getProjects({ category: params.id });
      setProjects(projectsResponse.data.results || projectsResponse.data);
    } catch (error) {
      console.error('Failed to fetch category details:', error);
      toast.error('Failed to load category details');
    } finally {
      setLoading(false);
      setProjectsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await projectsAPI.deleteCategory(params.id);
      toast.success('Category deleted successfully');
      window.location.href = '/projects/categories';
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      planning: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (!category) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Category not found</h3>
            <p className="mt-1 text-sm text-gray-500">The category you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/projects/categories">
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Categories
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
              <Link href="/projects/categories">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-gray-600">Category details and projects</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/projects/categories/${category.id}/edit`}>
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

          {/* Category Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div
                  className="flex-shrink-0 rounded-lg p-3"
                  style={{ backgroundColor: category.color || '#3B82F6' }}
                >
                  <FolderIcon className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {category.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                        {category.project_count || 0} projects
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ChartBarIcon className="h-4 w-4 mr-2" />
                        Color: <span className="ml-1 inline-block w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Timestamps</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Created: {formatDate(category.created_at)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Updated: {formatDate(category.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {(category.created_by_name || category.updated_by_name) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">People</h3>
                    <div className="space-y-2">
                      {category.created_by_name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <UserIcon className="h-4 w-4 mr-2" />
                          Created by: {category.created_by_name}
                        </div>
                      )}
                      {category.updated_by_name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <UserIcon className="h-4 w-4 mr-2" />
                          Updated by: {category.updated_by_name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects in this Category */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Projects in this Category ({projects.length})
                </h2>
                <Link href="/projects/create">
                  <Button size="sm">
                    Add Project
                  </Button>
                </Link>
              </div>

              {projectsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Link href={`/projects/${project.id}`}>
                              <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                                {project.name}
                              </h3>
                            </Link>
                            <span className="ml-3 text-sm text-gray-500">{project.code}</span>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                            {project.manager_name && (
                              <span>Manager: {project.manager_name}</span>
                            )}
                            {project.end_date && (
                              <span>Due: {formatDate(project.end_date)}</span>
                            )}
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No projects have been assigned to this category yet.
                  </p>
                  <div className="mt-6">
                    <Link href="/projects/create">
                      <Button>
                        Create First Project
                      </Button>
                    </Link>
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
