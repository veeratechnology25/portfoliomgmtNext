'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  FolderIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  category_name?: string;
  department_name?: string;
  manager_name?: string;
  created_by_name?: string;
  budget?: string;
  actual_cost?: string;
  start_date?: string;
  end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  progress: number;
  status: string;
  priority: string;
  health_score?: number;
  roi?: number;
  created_at: string;
  updated_at: string;
  phases?: Array<{
    id: string;
    name: string;
    description?: string;
    sequence: number;
    start_date?: string;
    end_date?: string;
    budget?: string;
    progress: number;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  documents?: Array<{
    id: string;
    name: string;
    document_type: string;
    file: string;
    uploaded_at: string;
    description?: string;
    uploaded_by_name: string;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  // Validate project ID format (UUID)
  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Redirect to projects list if ID is invalid
  React.useEffect(() => {
    if (projectId && !isValidUUID(projectId)) {
      console.log('Invalid project ID format:', projectId);
      toast.error('Invalid project ID format');
      router.push('/projects');
    } else if (projectId) {
      console.log('Valid project ID format:', projectId);
    }
  }, [projectId, router]);
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [phases, setPhases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log('Fetching project with ID:', projectId);
        setLoading(true);
        const response = await projectsAPI.getProject(projectId);
        console.log('Project fetched successfully:', response.data);
        setProject(response.data);
        
        // Fetch phases and documents
        try {
          const phasesResponse = await projectsAPI.getProjectPhases(projectId);
          setPhases(phasesResponse.data.results || phasesResponse.data);
        } catch (error) {
          console.error('Failed to fetch phases:', error);
        }
        
        try {
          const documentsResponse = await projectsAPI.getProjectDocuments(projectId);
          setDocuments(documentsResponse.data.results || documentsResponse.data);
        } catch (error) {
          console.error('Failed to fetch documents:', error);
        }
      } catch (error: any) {
        console.error('Failed to fetch project:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        // Handle 404 errors specifically
        if (error.response?.status === 404) {
          console.log('Project not found, redirecting...');
          toast.error('Project not found');
          router.push('/projects');
          return;
        }
        
        toast.error('Failed to load project');
        // Fallback to mock data if API fails
        const mockProject: Project = {
          id: projectId,
          name: 'E-commerce Platform',
          code: 'ECOM-001',
          description: 'Full-stack e-commerce solution with modern UI/UX design, payment integration, and inventory management system. This project aims to create a comprehensive online shopping platform with advanced features.',
          category_name: 'Web Development',
          department_name: 'Engineering',
          manager_name: 'John Doe',
          created_by_name: 'Sarah Wilson',
          status: 'in_progress',
          priority: 'high',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          actual_start_date: '2024-01-01',
          progress: 65,
          budget: '150000.00',
          actual_cost: '97500.00',
          health_score: 85,
          roi: 125.5,
          created_at: '2023-12-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z',
          phases: [
            {
              id: '1',
              name: 'Planning & Design',
              description: 'Project planning, requirements gathering, and UI/UX design phase',
              sequence: 1,
              status: 'completed',
              start_date: '2024-01-01',
              end_date: '2024-01-15',
              budget: '15000.00',
              progress: 100,
              created_at: '2023-12-15T10:00:00Z',
              updated_at: '2024-01-15T17:00:00Z',
            },
            {
              id: '2',
              name: 'Backend Development',
              description: 'API development, database design, and server-side logic',
              sequence: 2,
              status: 'in_progress',
              start_date: '2024-01-16',
              end_date: '2024-02-15',
              budget: '60000.00',
              progress: 80,
              created_at: '2024-01-10T11:00:00Z',
              updated_at: '2024-01-25T16:30:00Z',
            },
            {
              id: '3',
              name: 'Frontend Development',
              description: 'React frontend development and user interface implementation',
              sequence: 3,
              status: 'in_progress',
              start_date: '2024-02-01',
              end_date: '2024-03-01',
              budget: '50000.00',
              progress: 45,
              created_at: '2024-01-20T09:00:00Z',
              updated_at: '2024-01-28T15:45:00Z',
            },
            {
              id: '4',
              name: 'Testing & Deployment',
              description: 'Quality assurance, testing, and production deployment',
              sequence: 4,
              status: 'draft',
              start_date: '2024-03-02',
              end_date: '2024-03-31',
              budget: '25000.00',
              progress: 0,
              created_at: '2024-01-25T14:00:00Z',
              updated_at: '2024-01-25T14:00:00Z',
            },
          ],
          documents: [
            {
              id: '1',
              name: 'Project Requirements.pdf',
              document_type: 'proposal',
              file: '/documents/project-requirements.pdf',
              uploaded_at: '2024-01-15T10:30:00Z',
              description: 'Detailed project requirements and specifications',
              uploaded_by_name: 'John Doe',
            },
            {
              id: '2',
              name: 'Contract Agreement.pdf',
              document_type: 'contract',
              file: '/documents/contract-agreement.pdf',
              uploaded_at: '2024-01-10T14:20:00Z',
              description: 'Signed contract agreement with client',
              uploaded_by_name: 'Sarah Wilson',
            },
            {
              id: '3',
              name: 'Progress Report.pdf',
              document_type: 'report',
              file: '/documents/progress-report.pdf',
              uploaded_at: '2024-01-20T09:15:00Z',
              description: 'Monthly progress report',
              uploaded_by_name: 'Mike Johnson',
            },
          ],
        };

        setProject(mockProject);
        setPhases(mockProject.phases || []);
        setDocuments(mockProject.documents || []);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateBudgetVariance = (budget: string, actualCost: string) => {
    const budgetNum = parseFloat(budget) || 0;
    const actualNum = parseFloat(actualCost) || 0;
    if (budgetNum === 0) return 0;
    return ((actualNum - budgetNum) / budgetNum) * 100;
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectsAPI.deleteProject(projectId);
      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
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

  if (!project) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
            <p className="text-gray-600">The project you're looking for doesn't exist.</p>
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
              <Link href="/projects">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600">Project Code: {project.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/projects/${projectId}/edit`}>
                <Button variant="outline" className="flex items-center">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 flex items-center"
                onClick={handleDelete}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Info Card */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Project Information</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{project.description || 'No description available'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Category</h3>
                      <p className="text-gray-600">{project.category_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Department</h3>
                      <p className="text-gray-600">{project.department_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Project Manager</h3>
                      <p className="text-gray-600">{project.manager_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Created By</h3>
                      <p className="text-gray-600">{project.created_by_name || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Timeline</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Planned Start</h3>
                    <p className="text-gray-600">{project.start_date ? formatDate(project.start_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Planned End</h3>
                    <p className="text-gray-600">{project.end_date ? formatDate(project.end_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Actual Start</h3>
                    <p className="text-gray-600">{project.actual_start_date ? formatDate(project.actual_start_date) : 'Not started'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Actual End</h3>
                    <p className="text-gray-600">{project.actual_end_date ? formatDate(project.actual_end_date) : 'Not completed'}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Overall Progress</span>
                      <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {project.health_score !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Health Score</span>
                      <span className={`text-sm font-bold ${getHealthScoreColor(project.health_score)}`}>
                        {project.health_score}%
                      </span>
                    </div>
                  )}

                  {project.roi !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Return on Investment</span>
                      <span className="text-sm font-bold text-green-600">{project.roi}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Budget</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="text-sm font-medium text-gray-900">
                      {project.budget ? formatCurrency(parseFloat(project.budget)) : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Actual Cost</span>
                    <span className="text-sm font-medium text-gray-900">
                      {project.actual_cost ? formatCurrency(parseFloat(project.actual_cost)) : 'Not set'}
                    </span>
                  </div>
                  {project.budget && project.actual_cost && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Variance</span>
                        <span className={`text-sm font-bold ${
                          calculateBudgetVariance(project.budget, project.actual_cost) > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {calculateBudgetVariance(project.budget, project.actual_cost).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href={`/projects/phases/create?project_id=${projectId}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Add Phase
                    </Button>
                  </Link>
                  <Link href={`/projects/documents/create?project_id=${projectId}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Manage Team
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {['overview', 'phases', 'documents', 'team'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Overview</h3>
                  <p className="text-gray-600">Detailed project overview and metrics will be displayed here.</p>
                </div>
              )}

              {activeTab === 'phases' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Project Phases</h3>
                    <Link href={`/projects/phases/create?project_id=${projectId}`}>
                      <Button size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Phase
                      </Button>
                    </Link>
                  </div>
                  {phases && phases.length > 0 ? (
                    <div className="space-y-3">
                      {phases.map((phase) => (
                        <div key={phase.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <Link href={`/projects/phases/${projectId}/${phase.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                              {phase.sequence}. {phase.name}
                            </Link>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(phase.status)}`}>
                                {phase.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <Link href={`/projects/phases/${projectId}/${phase.id}/edit`}>
                                <button className="text-gray-400 hover:text-blue-600">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </Link>
                            </div>
                          </div>
                          {phase.description && (
                            <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              {phase.start_date ? formatDate(phase.start_date) : 'No start date'} - 
                              {phase.end_date ? formatDate(phase.end_date) : 'No end date'}
                            </span>
                            <span className="font-medium text-gray-900">{phase.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${phase.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No phases defined</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new phase for this project.</p>
                      <div className="mt-6">
                        <Link href={`/projects/phases/create?project_id=${projectId}`}>
                          <Button>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create First Phase
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Project Documents</h3>
                    <Link href={`/projects/documents/create?project_id=${projectId}`}>
                      <Button size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </Link>
                  </div>
                  {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <Link href={`/projects/documents/${projectId}/${doc.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                                  {doc.title || doc.name}
                                </Link>
                                <span className="ml-3 text-sm text-gray-500">v{doc.version || 1}</span>
                              </div>
                              <p className="text-sm text-gray-600">{doc.file_name || doc.document_type}</p>
                              {doc.description && (
                                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  by {doc.uploaded_by_name || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(doc.uploaded_at)}
                                </p>
                              </div>
                              <Link href={`/projects/documents/${projectId}/${doc.id}/edit`}>
                                <button className="text-gray-400 hover:text-blue-600">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by uploading your first document.</p>
                      <div className="mt-6">
                        <Link href={`/projects/documents/create?project_id=${projectId}`}>
                          <Button>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Upload First Document
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'team' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
                  <p className="text-gray-600">Team management functionality will be implemented here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
