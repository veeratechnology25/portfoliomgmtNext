'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  BeakerIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RiskMitigation {
  id: string;
  title: string;
  description: string;
  risk_id: string;
  risk_title: string;
  status: string;
  priority: string;
  assignee?: string;
  created_by: string;
  created_date: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  progress: number;
  effectiveness_score?: number;
  category: string;
  mitigation_type: string;
  cost_estimate?: number;
  actual_cost?: number;
  resources_required: string[];
  success_criteria: string[];
  implementation_steps: string[];
  monitoring_frequency: string;
  updated_at: string;
}

export default function RiskMitigationsPage() {
  const [mitigations, setMitigations] = useState<RiskMitigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  useEffect(() => {
    fetchMitigations();
  }, []);

  const fetchMitigations = async () => {
    try {
      setLoading(true);
      console.log('Fetching risk mitigations...');
      const response = await risksAPI.getRiskMitigations();
      console.log('API Response:', response);
      setMitigations(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch risk mitigations:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load risk mitigations - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockMitigations: RiskMitigation[] = [
        {
          id: '1',
          title: 'Implement Multi-Factor Authentication',
          description: 'Deploy MFA across all systems to enhance security and prevent unauthorized access',
          risk_id: '1',
          risk_title: 'Data Security Breach Risk',
          status: 'in_progress',
          priority: 'high',
          assignee: 'IT Security Team',
          created_by: 'John Smith',
          created_date: '2024-12-15T10:00:00Z',
          target_completion_date: '2024-12-30',
          progress: 75,
          effectiveness_score: 85,
          category: 'Technical',
          mitigation_type: 'Preventive',
          cost_estimate: 50000,
          actual_cost: 35000,
          resources_required: ['Security Team', 'IT Infrastructure', 'Budget'],
          success_criteria: ['100% user adoption', 'Zero security breaches', 'Compliance met'],
          implementation_steps: [
            'Assess current authentication systems',
            'Select MFA solution',
            'Pilot testing',
            'Full deployment',
            'User training'
          ],
          monitoring_frequency: 'Weekly',
          updated_at: '2024-12-20T14:30:00Z',
        },
        {
          id: '2',
          title: 'Additional Resource Allocation',
          description: 'Allocate additional developers to prevent project timeline delays',
          risk_id: '2',
          risk_title: 'Project Timeline Delay',
          status: 'in_progress',
          priority: 'medium',
          assignee: 'Project Manager',
          created_by: 'Sarah Johnson',
          created_date: '2024-12-18T14:30:00Z',
          target_completion_date: '2025-01-15',
          progress: 45,
          category: 'Resource Management',
          mitigation_type: 'Corrective',
          cost_estimate: 75000,
          actual_cost: 40000,
          resources_required: ['Development Team', 'Training Budget'],
          success_criteria: ['Project on schedule', 'Quality maintained'],
          implementation_steps: [
            'Identify resource gaps',
            'Hire contractors',
            'Onboarding process',
            'Team integration'
          ],
          monitoring_frequency: 'Daily',
          updated_at: '2024-12-20T10:15:00Z',
        },
        {
          id: '3',
          title: 'Cost Control Measures',
          description: 'Implement strict budget controls and monitoring to prevent overspending',
          risk_id: '3',
          risk_title: 'Budget Overrun Risk',
          status: 'completed',
          priority: 'high',
          assignee: 'Finance Department',
          created_by: 'Mike Davis',
          created_date: '2024-12-10T09:15:00Z',
          target_completion_date: '2024-12-15',
          actual_completion_date: '2024-12-14T16:45:00Z',
          progress: 100,
          effectiveness_score: 92,
          category: 'Financial',
          mitigation_type: 'Preventive',
          cost_estimate: 10000,
          actual_cost: 8000,
          resources_required: ['Finance Team', 'Audit Software'],
          success_criteria: ['Budget adherence', 'Cost reduction'],
          implementation_steps: [
            'Implement expense tracking',
            'Set up approval workflows',
            'Regular budget reviews'
          ],
          monitoring_frequency: 'Monthly',
          updated_at: '2024-12-14T16:45:00Z',
        },
        {
          id: '4',
          title: 'Staff Training Program',
          description: 'Cross-train existing staff to address resource shortages',
          risk_id: '4',
          risk_title: 'Resource Shortage',
          status: 'in_progress',
          priority: 'medium',
          assignee: 'HR Department',
          created_by: 'Emily Chen',
          created_date: '2024-12-12T11:45:00Z',
          target_completion_date: '2025-02-01',
          progress: 30,
          category: 'Human Resources',
          mitigation_type: 'Corrective',
          cost_estimate: 25000,
          resources_required: ['Training Budget', 'External Trainers'],
          success_criteria: ['Skill coverage improved', 'Team flexibility'],
          implementation_steps: [
            'Skills assessment',
            'Training program design',
            'Implementation',
            'Evaluation'
          ],
          monitoring_frequency: 'Bi-weekly',
          updated_at: '2024-12-19T13:20:00Z',
        },
        {
          id: '5',
          title: 'Compliance Documentation Update',
          description: 'Update all compliance documentation to meet new regulatory requirements',
          risk_id: '5',
          risk_title: 'Regulatory Compliance',
          status: 'completed',
          priority: 'low',
          assignee: 'Legal Department',
          created_by: 'David Wilson',
          created_date: '2024-12-08T16:20:00Z',
          target_completion_date: '2024-12-12',
          actual_completion_date: '2024-12-11T10:30:00Z',
          progress: 100,
          effectiveness_score: 100,
          category: 'Compliance',
          mitigation_type: 'Preventive',
          cost_estimate: 5000,
          actual_cost: 4500,
          resources_required: ['Legal Team', 'Documentation Tools'],
          success_criteria: ['Full compliance achieved', 'Audit passed'],
          implementation_steps: [
            'Requirements analysis',
            'Documentation update',
            'Review process',
            'Submission'
          ],
          monitoring_frequency: 'Quarterly',
          updated_at: '2024-12-11T10:30:00Z',
        },
      ];

      setMitigations(mockMitigations);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      console.log('Marking mitigation as completed:', id);
      await risksAPI.markMitigationCompleted(id);
      toast.success('Risk mitigation marked as completed');
      fetchMitigations();
    } catch (error: any) {
      console.error('Failed to mark mitigation as completed:', error);
      toast.error('Failed to mark mitigation as completed');
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    try {
      console.log('Updating mitigation progress:', id, progress);
      await risksAPI.updateMitigationProgress(id, { progress });
      toast.success('Mitigation progress updated successfully');
      fetchMitigations();
    } catch (error: any) {
      console.error('Failed to update mitigation progress:', error);
      toast.error('Failed to update mitigation progress');
    }
  };

  const filteredMitigations = mitigations.filter((mitigation) => {
    const matchesSearch = 
      mitigation.title.toLowerCase().includes(search.toLowerCase()) ||
      mitigation.description.toLowerCase().includes(search.toLowerCase()) ||
      mitigation.risk_title.toLowerCase().includes(search.toLowerCase()) ||
      mitigation.assignee?.toLowerCase().includes(search.toLowerCase()) ||
      mitigation.created_by.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || mitigation.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || mitigation.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || mitigation.assignee === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const assignees = [...new Set(mitigations.filter(m => m.assignee).map(m => m.assignee!))];
  const completedCount = mitigations.filter(m => m.status === 'completed').length;
  const inProgressCount = mitigations.filter(m => m.status === 'in_progress').length;
  const highPriorityCount = mitigations.filter(m => m.priority === 'high').length;
  const averageProgress = mitigations.length > 0 
    ? Math.round(mitigations.reduce((sum, m) => sum + m.progress, 0) / mitigations.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'in_progress': return <ArrowPathIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'cancelled': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
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
              <h1 className="text-2xl font-bold text-gray-900">Risk Mitigations</h1>
              <p className="text-gray-600">Manage and track risk mitigation strategies and implementations</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/risks/mitigations/bulk">
                <Button variant="outline" className="flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </Link>
              <Link href="/risks/mitigations/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Mitigation
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <BeakerIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Mitigations</p>
                  <p className="text-2xl font-bold text-gray-900">{mitigations.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <ArrowPathIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Mitigations
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
                    placeholder="Search by title, description, or assignee..."
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
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Assignees</option>
                  {assignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mitigations List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredMitigations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredMitigations.map((mitigation) => (
                  <div key={mitigation.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <BeakerIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{mitigation.title}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(mitigation.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(mitigation.status)}
                                  <span className="ml-1">{mitigation.status.replace('_', ' ')}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(mitigation.priority)}`}>
                                {mitigation.priority}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {mitigation.risk_title}
                              </span>
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {mitigation.assignee || 'Unassigned'}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Created: {formatDate(mitigation.created_date)}
                              </span>
                              {mitigation.target_completion_date && (
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  Target: {formatDate(mitigation.target_completion_date)}
                                </span>
                              )}
                              <span className="flex items-center">
                                <BeakerIcon className="h-4 w-4 mr-1" />
                                {mitigation.category}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{mitigation.description}</p>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Type: {mitigation.mitigation_type}</span>
                              {mitigation.effectiveness_score && (
                                <span>Effectiveness: {mitigation.effectiveness_score}%</span>
                              )}
                              {mitigation.cost_estimate && (
                                <span>Cost: ${mitigation.cost_estimate.toLocaleString()}</span>
                              )}
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-500">{mitigation.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColor(mitigation.progress)}`}
                                  style={{ width: `${mitigation.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            {mitigation.monitoring_frequency} monitoring
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/risks/mitigations/${mitigation.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/risks/mitigations/${mitigation.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            {mitigation.status === 'in_progress' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleMarkCompleted(mitigation.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risk mitigations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new risk mitigation'
                  }
                </p>
                {!search && statusFilter === 'all' && priorityFilter === 'all' && assigneeFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/risks/mitigations/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Mitigation
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
