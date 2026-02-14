'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  UserGroupIcon,
  DocumentTextIcon,
  FireIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RiskIssue {
  id: string;
  title: string;
  description: string;
  risk_id: string;
  risk_title: string;
  severity: string;
  status: string;
  priority: string;
  assignee?: string;
  reported_by: string;
  reported_date: string;
  due_date?: string;
  resolved_date?: string;
  resolution_notes?: string;
  category: string;
  impact_assessment: string;
  affected_departments: string[];
  mitigation_actions: string[];
  created_at: string;
  updated_at: string;
  escalation_level: number;
}

export default function RiskIssuesPage() {
  const [issues, setIssues] = useState<RiskIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      console.log('Fetching risk issues...');
      const response = await risksAPI.getRiskIssues();
      console.log('API Response:', response);
      setIssues(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch risk issues:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load risk issues - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockIssues: RiskIssue[] = [
        {
          id: '1',
          title: 'Critical Security Vulnerability',
          description: 'Identified critical security vulnerability in customer database that could lead to data breach',
          risk_id: '1',
          risk_title: 'Data Security Breach Risk',
          severity: 'critical',
          status: 'open',
          priority: 'high',
          assignee: 'John Smith',
          reported_by: 'Sarah Johnson',
          reported_date: '2024-12-20T09:15:00Z',
          due_date: '2024-12-25',
          category: 'Security',
          impact_assessment: 'High - Potential data breach affecting all customer records',
          affected_departments: ['IT', 'Security', 'Legal'],
          mitigation_actions: [
            'Immediate patch deployment',
            'Security audit implementation',
            'Customer notification protocol'
          ],
          created_at: '2024-12-20T09:15:00Z',
          updated_at: '2024-12-20T09:15:00Z',
          escalation_level: 2,
        },
        {
          id: '2',
          title: 'Project Timeline Delay',
          description: 'Key project milestone delayed by 2 weeks due to resource constraints',
          risk_id: '2',
          risk_title: 'Project Timeline Delay',
          severity: 'medium',
          status: 'in_progress',
          priority: 'medium',
          assignee: 'Mike Davis',
          reported_by: 'Emily Chen',
          reported_date: '2024-12-19T14:30:00Z',
          due_date: '2024-12-30',
          category: 'Project Management',
          impact_assessment: 'Medium - May affect client delivery schedule',
          affected_departments: ['Project Management', 'Client Relations'],
          mitigation_actions: [
            'Resource reallocation',
            'Timeline re-negotiation',
            'Stakeholder communication'
          ],
          created_at: '2024-12-19T14:30:00Z',
          updated_at: '2024-12-20T10:00:00Z',
          escalation_level: 1,
        },
        {
          id: '3',
          title: 'Budget Overspend Warning',
          description: 'Project expenses exceeding allocated budget by 15%',
          risk_id: '3',
          risk_title: 'Budget Overrun Risk',
          severity: 'high',
          status: 'resolved',
          priority: 'high',
          assignee: 'David Wilson',
          reported_by: 'Lisa Anderson',
          reported_date: '2024-12-18T11:45:00Z',
          resolved_date: '2024-12-19T16:30:00Z',
          resolution_notes: 'Implemented cost control measures and reallocated funds from contingency',
          category: 'Financial',
          impact_assessment: 'High - May affect project completion',
          affected_departments: ['Finance', 'Project Management'],
          mitigation_actions: [
            'Cost control implementation',
            'Budget re-allocation',
            'Expense review process'
          ],
          created_at: '2024-12-18T11:45:00Z',
          updated_at: '2024-12-19T16:30:00Z',
          escalation_level: 1,
        },
        {
          id: '4',
          title: 'Staff Shortage in Critical Role',
          description: 'Key team member on extended leave causing resource shortage',
          risk_id: '4',
          risk_title: 'Resource Shortage',
          severity: 'medium',
          status: 'open',
          priority: 'medium',
          assignee: 'HR Department',
          reported_by: 'Tom Brown',
          reported_date: '2024-12-17T13:20:00Z',
          due_date: '2025-01-15',
          category: 'Human Resources',
          impact_assessment: 'Medium - May delay project deliverables',
          affected_departments: ['HR', 'Project Management'],
          mitigation_actions: [
            'Temporary staff recruitment',
            'Cross-training team members',
            'Workload redistribution'
          ],
          created_at: '2024-12-17T13:20:00Z',
          updated_at: '2024-12-17T13:20:00Z',
          escalation_level: 0,
        },
        {
          id: '5',
          title: 'Compliance Documentation Gap',
          description: 'Missing compliance documentation for new regulatory requirements',
          risk_id: '5',
          risk_title: 'Regulatory Compliance',
          severity: 'low',
          status: 'resolved',
          priority: 'low',
          assignee: 'Legal Department',
          reported_by: 'Rachel Green',
          reported_date: '2024-12-16T10:30:00Z',
          resolved_date: '2024-12-17T15:45:00Z',
          resolution_notes: 'All required documentation completed and submitted',
          category: 'Compliance',
          impact_assessment: 'Low - Minor regulatory impact',
          affected_departments: ['Legal', 'Operations'],
          mitigation_actions: [
            'Documentation completion',
            'Regulatory submission',
            'Staff training update'
          ],
          created_at: '2024-12-16T10:30:00Z',
          updated_at: '2024-12-17T15:45:00Z',
          escalation_level: 0,
        },
      ];

      setIssues(mockIssues);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIssue = async (id: string, assignee: string) => {
    try {
      console.log('Assigning issue:', id, 'to:', assignee);
      await risksAPI.assignRiskIssue(id, { assignee });
      toast.success('Risk issue assigned successfully');
      fetchIssues();
    } catch (error: any) {
      console.error('Failed to assign issue:', error);
      toast.error('Failed to assign issue');
    }
  };

  const handleResolveIssue = async (id: string, resolutionNotes: string) => {
    try {
      console.log('Resolving issue:', id);
      await risksAPI.resolveRiskIssue(id, { resolution_notes: resolutionNotes });
      toast.success('Risk issue resolved successfully');
      fetchIssues();
    } catch (error: any) {
      console.error('Failed to resolve issue:', error);
      toast.error('Failed to resolve issue');
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase()) ||
      issue.risk_title.toLowerCase().includes(search.toLowerCase()) ||
      issue.assignee?.toLowerCase().includes(search.toLowerCase()) ||
      issue.reported_by.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || issue.assignee === assigneeFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesPriority && matchesAssignee;
  });

  const assignees = [...new Set(issues.filter(i => i.assignee).map(i => i.assignee!))];
  const openCount = issues.filter(i => i.status === 'open').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const criticalCount = issues.filter(i => i.severity === 'critical').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'in_progress': return <ArrowPathIcon className="h-4 w-4" />;
      case 'resolved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'closed': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getEscalationColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-green-100 text-green-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-red-100 text-red-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Risk Issues</h1>
              <p className="text-gray-600">Track and manage identified risk issues and incidents</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/risks/issues/bulk">
                <Button variant="outline" className="flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </Link>
              <Link href="/risks/issues/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Issue
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{issues.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                  <FireIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-gray-900">{criticalCount}</p>
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
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Issues
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
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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

          {/* Issues List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredIssues.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-red-100 rounded-lg p-2">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(issue.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(issue.status)}
                                  <span className="ml-1">{issue.status.replace('_', ' ')}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                                {issue.severity}
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(issue.priority)}`}>
                                {issue.priority}
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getEscalationColor(issue.escalation_level)}`}>
                                L{issue.escalation_level}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {issue.risk_title}
                              </span>
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {issue.assignee || 'Unassigned'}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Reported: {formatDate(issue.reported_date)}
                              </span>
                              {issue.due_date && (
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  Due: {formatDate(issue.due_date)}
                                </span>
                              )}
                              <span className="flex items-center">
                                <UserGroupIcon className="h-4 w-4 mr-1" />
                                {issue.affected_departments.length} departments
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{issue.description}</p>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p><strong>Impact:</strong> {issue.impact_assessment}</p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span className="font-medium">Reported by:</span> {issue.reported_by}
                              {issue.resolution_notes && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="font-medium">Resolution:</span> {issue.resolution_notes}
                                </>
                              )}
                            </div>
                            {issue.affected_departments.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {issue.affected_departments.map((dept, index) => (
                                  <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                    {dept}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            Category: {issue.category}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/risks/issues/${issue.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/risks/issues/${issue.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            {issue.status === 'open' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAssignIssue(issue.id, 'Current User')}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <UserIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {(issue.status === 'open' || issue.status === 'in_progress') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleResolveIssue(issue.id, 'Issue resolved')}
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
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risk issues found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || severityFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new risk issue'
                  }
                </p>
                {!search && statusFilter === 'all' && severityFilter === 'all' && priorityFilter === 'all' && assigneeFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/risks/issues/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Issue
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
