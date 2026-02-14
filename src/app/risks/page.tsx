'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  BeakerIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

/** ---------------- Types ---------------- */
interface RiskDashboard {
  total_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;

  open_risks: number;
  mitigated_risks: number;
  escalated_risks: number;

  risk_assessments_count: number;
  pending_assessments: number;

  risk_issues_count: number;
  active_issues: number;
  resolved_issues: number;

  risk_mitigations_count: number;
  completed_mitigations: number;
  in_progress_mitigations: number;

  risk_registers_count: number;
  active_registers: number;

  risk_categories_count: number;

  risk_trend: number;
  mitigation_effectiveness: number;

  top_risks: Array<{
    id: string;
    title: string;
    risk_level: string;
    category: string;
    status: string;
    created_date: string;
  }>;

  recent_assessments: Array<{
    id: string;
    risk_title: string;
    assessor: string;
    assessment_date: string;
    status: string;
    risk_score: number;
  }>;

  active_mitigations: Array<{
    id: string;
    risk_title: string;
    mitigation_title: string;
    progress: number;
    due_date: string;
    assignee: string;
  }>;

  upcoming_deadlines: Array<{
    id: string;
    title: string;
    type: string;
    due_date: string;
    assignee: string;
  }>;
}

/** ---------------- Mock (fallback) ---------------- */
const mockDashboard: RiskDashboard = {
  total_risks: 45,
  high_risks: 8,
  medium_risks: 22,
  low_risks: 15,
  open_risks: 35,
  mitigated_risks: 8,
  escalated_risks: 2,
  risk_assessments_count: 38,
  pending_assessments: 5,
  risk_issues_count: 12,
  active_issues: 8,
  resolved_issues: 4,
  risk_mitigations_count: 28,
  completed_mitigations: 12,
  in_progress_mitigations: 16,
  risk_registers_count: 4,
  active_registers: 4,
  risk_categories_count: 8,
  risk_trend: -12.5,
  mitigation_effectiveness: 78.3,
  top_risks: [
    {
      id: '1',
      title: 'Data Security Breach Risk',
      risk_level: 'high',
      category: 'Security',
      status: 'open',
      created_date: '2024-11-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Project Timeline Delay',
      risk_level: 'medium',
      category: 'Project',
      status: 'open',
      created_date: '2024-11-20T14:15:00Z',
    },
    {
      id: '3',
      title: 'Budget Overrun Risk',
      risk_level: 'high',
      category: 'Financial',
      status: 'mitigated',
      created_date: '2024-10-25T09:00:00Z',
    },
    {
      id: '4',
      title: 'Resource Shortage',
      risk_level: 'medium',
      category: 'Operational',
      status: 'open',
      created_date: '2024-12-01T11:45:00Z',
    },
    {
      id: '5',
      title: 'Regulatory Compliance',
      risk_level: 'low',
      category: 'Compliance',
      status: 'closed',
      created_date: '2024-11-10T16:20:00Z',
    },
  ],
  recent_assessments: [
    {
      id: '1',
      risk_title: 'Data Security Breach Risk',
      assessor: 'John Smith',
      assessment_date: '2024-12-20T10:00:00Z',
      status: 'approved',
      risk_score: 85,
    },
    {
      id: '2',
      risk_title: 'Project Timeline Delay',
      assessor: 'Sarah Johnson',
      assessment_date: '2024-12-19T15:30:00Z',
      status: 'pending',
      risk_score: 65,
    },
    {
      id: '3',
      risk_title: 'Budget Overrun Risk',
      assessor: 'Mike Davis',
      assessment_date: '2024-12-18T09:15:00Z',
      status: 'approved',
      risk_score: 78,
    },
  ],
  active_mitigations: [
    {
      id: '1',
      risk_title: 'Data Security Breach Risk',
      mitigation_title: 'Implement Multi-Factor Authentication',
      progress: 75,
      due_date: '2024-12-30',
      assignee: 'IT Security Team',
    },
    {
      id: '2',
      risk_title: 'Project Timeline Delay',
      mitigation_title: 'Additional Resource Allocation',
      progress: 45,
      due_date: '2025-01-15',
      assignee: 'Project Manager',
    },
    {
      id: '3',
      risk_title: 'Resource Shortage',
      mitigation_title: 'Staff Training Program',
      progress: 30,
      due_date: '2025-02-01',
      assignee: 'HR Department',
    },
  ],
  upcoming_deadlines: [
    {
      id: '1',
      title: 'Security Audit Completion',
      type: 'assessment',
      due_date: '2024-12-25',
      assignee: 'John Smith',
    },
    {
      id: '2',
      title: 'MFA Implementation',
      type: 'mitigation',
      due_date: '2024-12-30',
      assignee: 'IT Security Team',
    },
    {
      id: '3',
      title: 'Quarterly Risk Review',
      type: 'assessment',
      due_date: '2025-01-05',
      assignee: 'Risk Manager',
    },
  ],
};

/** ---------------- Runtime validation (type guard) ---------------- */
function isDashboard(x: any): x is RiskDashboard {
  if (!x || typeof x !== 'object') return false;

  const numFields = [
    'total_risks',
    'high_risks',
    'medium_risks',
    'low_risks',
    'open_risks',
    'mitigated_risks',
    'escalated_risks',
    'risk_assessments_count',
    'pending_assessments',
    'risk_issues_count',
    'active_issues',
    'resolved_issues',
    'risk_mitigations_count',
    'completed_mitigations',
    'in_progress_mitigations',
    'risk_registers_count',
    'active_registers',
    'risk_categories_count',
    'risk_trend',
    'mitigation_effectiveness',
  ];

  for (const f of numFields) {
    if (typeof x[f] !== 'number') return false;
  }

  if (!Array.isArray(x.top_risks)) return false;
  if (!Array.isArray(x.recent_assessments)) return false;
  if (!Array.isArray(x.active_mitigations)) return false;
  if (!Array.isArray(x.upcoming_deadlines)) return false;

  return true;
}

/** ---------------- Page ---------------- */
export default function RisksPage() {
  const [dashboard, setDashboard] = useState<RiskDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const extractApiMessage = (data: any): string | null => {
    if (!data || typeof data !== 'object') return null;

    // DRF common patterns
    if (typeof data.detail === 'string') return data.detail;

    // your nested error
    const msg = data?.recent_risks?.[0]?.reference_code?.[0];
    if (typeof msg === 'string') return msg;

    // fallback: first string in first field
    for (const key of Object.keys(data)) {
      const v = data[key];
      if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
    }

    return null;
  };

  const fetchDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const response = await risksAPI.getRiskDashboard();
      const data = response?.data;

      if (!isDashboard(data)) {
        const msg = extractApiMessage(data) ?? 'Dashboard response is not in expected format';
        toast.error(msg);

        // fallback WITHOUT throwing -> avoids double toast
        setDashboard(mockDashboard);
        return;
      }

      setDashboard(data);
    } catch (error: any) {
      const status = error?.response?.status;
      const respData = error?.response?.data;

      console.error('Failed to fetch risks dashboard:', error);
      console.error('Error details:', status, respData);

      // if backend returned validation error as exception (axios does this for 4xx)
      const msgFromApi = extractApiMessage(respData);

      if (status === 400 && msgFromApi) {
        toast.error(msgFromApi);
      } else if (status === 404) {
        toast.error('API endpoint not found. Ensure Django backend is running and the URL is correct.');
      } else if (status === 500) {
        toast.error('Server error. Check backend logs.');
      } else {
        toast.error('Failed to load risks dashboard - using demo data');
      }

      setDashboard(mockDashboard);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    let mounted = true;

    // run fetch and avoid setState after unmount
    (async () => {
      try {
        await fetchDashboard();
      } finally {
        // fetchDashboard already sets loading; this guard is just to be safe for future edits
        if (!mounted) return;
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchDashboard]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <FireIcon className="h-4 w-4" />;
      case 'medium':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'low':
        return <ShieldCheckIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'mitigated':
        return 'bg-green-100 text-green-800';
      case 'escalated':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!dashboard) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No risk data available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Unable to load risk dashboard information.
            </p>
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
              <h1 className="text-2xl font-bold text-gray-900">
                Risk Management Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive overview of organizational risks and mitigation
                efforts
              </p>
            </div>

            <div className="flex space-x-2">
              <Link href="/risks/reports">
                <Button variant="outline" className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>

              <Link href="/risks/risks/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Risk
                </Button>
              </Link>
            </div>
          </div>

          {/* Risk Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Risks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard.total_risks}
                  </p>
                  <div className="flex items-center mt-2">
                    {dashboard.risk_trend > 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />
                    )}
                    <span
                      className={`ml-1 text-sm ${dashboard.risk_trend > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                    >
                      {dashboard.risk_trend > 0 ? '+' : ''}
                      {dashboard.risk_trend}% this month
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    High Priority Risks
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard.high_risks}
                  </p>
                  <p className="text-sm text-gray-500">
                    Require immediate attention
                  </p>
                </div>
                <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                  <FireIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Risks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard.open_risks}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dashboard.mitigated_risks} mitigated
                  </p>
                </div>
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Mitigation Effectiveness
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard.mitigation_effectiveness}%
                  </p>
                  <p className="text-sm text-gray-500">Success rate</p>
                </div>
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <BeakerIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Risk Assessments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard.risk_assessments_count}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dashboard.pending_assessments} pending
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Issues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard.active_issues}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dashboard.resolved_issues} resolved
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mitigations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard.risk_mitigations_count}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dashboard.completed_mitigations} completed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Risk Registers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard.active_registers}
                  </p>
                  <p className="text-sm text-gray-500">Active registers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Risks */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Top Risks</h3>
                <Link href="/risks/risks">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {dashboard.top_risks.map((risk) => (
                  <div key={risk.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                        {getRiskLevelIcon(risk.risk_level)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {risk.title}
                        </p>
                        <p className="text-xs text-gray-500">{risk.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(
                          risk.risk_level
                        )}`}
                      >
                        {risk.risk_level}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{risk.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Assessments */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Assessments
                </h3>
                <Link href="/risks/assessments">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {dashboard.recent_assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                        <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {assessment.risk_title}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {assessment.assessor}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        Score: {assessment.risk_score}
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          assessment.status
                        )}`}
                      >
                        {assessment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Mitigations */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Mitigations
                </h3>
                <Link href="/risks/mitigations">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {dashboard.active_mitigations.map((mitigation) => (
                  <div
                    key={mitigation.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                        <BeakerIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {mitigation.mitigation_title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {mitigation.assignee}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(
                            mitigation.progress
                          )}`}
                          style={{ width: `${mitigation.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {mitigation.progress}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Upcoming Deadlines
              </h3>
              <Link href="/risks/calendar">
                <Button variant="outline" size="sm">
                  View Calendar
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {dashboard.upcoming_deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                      <CalendarIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-gray-500">{deadline.assignee}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDate(deadline.due_date)}
                    </p>
                    <span
                      className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${deadline.type === 'assessment'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {deadline.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/risks/risks/create">
                <Button className="w-full flex items-center justify-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Risk
                </Button>
              </Link>

              <Link href="/risks/assessments/create">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
              </Link>

              <Link href="/risks/mitigations/create">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <BeakerIcon className="h-4 w-4 mr-2" />
                  Add Mitigation
                </Button>
              </Link>

              <Link href="/risks/reports">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
