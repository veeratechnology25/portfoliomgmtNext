'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ApiRiskAssessment {
  id: string;
  risk: any; // could be uuid OR object
  assessment_date: string;
  status: string;
  priority: string;
  approved_by?: string;

  likelihood_score: number;
  likelihood_justification: string;

  financial_impact_score: number;
  schedule_impact_score: number;
  quality_impact_score: number;
  reputation_impact_score: number;
  overall_impact_score: number;

  impact_justification: string;
  treatment_recommendation: string;

  approval_date?: string | null;
  approval_notes?: string | null;
  assessor?: string | null;
};

interface RiskAssessmentVM {
  id: string;
  risk_title: string;
  risk_description: string;
  assessor: string;
  assessment_date: string;
  status: string;
    review_date?: string;
  risk_score: number;
  impact_level: string;
  probability_level: string;
  risk_level: string;
  mitigation_status: string;
  recommended_actions: string[];
  approved_by?: string;
  approved_date?: string;
  next_review_date?: string;
}

export default function RiskAssessmentsPage() {
  // const [assessments, setAssessments] = useState<ApiRiskAssessment[]>([]);
  const [assessments, setAssessments] = useState<RiskAssessmentVM[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [assessorFilter, setAssessorFilter] = useState('all');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const safeName = (val: any) => {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  return val.name || val.full_name || val.username || val.email || '—';
};

const safeRiskTitle = (risk: any) => {
  if (!risk) return '—';
  if (typeof risk === 'string') return risk; // fallback: show uuid
  return risk.title || risk.name || '—';
};

const safeRiskDesc = (risk: any) => {
  if (!risk || typeof risk === 'string') return '';
  return risk.description || '';
};

const scoreToLevel = (n: number) => {
  if (n >= 4) return 'high';
  if (n === 3) return 'medium';
  return 'low';
};

const overallToRiskScore = (a: ApiRiskAssessment) => {
  // you can choose your formula; this is simple + stable
  // normalized to 0..100-ish
  const avg =
    (a.likelihood_score +
      a.financial_impact_score +
      a.schedule_impact_score +
      a.quality_impact_score +
      a.reputation_impact_score +
      a.overall_impact_score) / 6;

  return Math.round((avg / 5) * 100);
};

const mapAssessmentToVM = (a: ApiRiskAssessment): RiskAssessmentVM => {
  const riskScore = overallToRiskScore(a);
  const probability = scoreToLevel(a.likelihood_score);
  const impact = scoreToLevel(a.overall_impact_score);
  const riskLevel = riskScore >= 75 ? 'high' : riskScore >= 45 ? 'medium' : 'low';

  return {
    id: a.id,
    risk_title: safeRiskTitle(a.risk),
    risk_description: safeRiskDesc(a.risk),
    assessor: safeName(a.assessor),
    assessment_date: a.assessment_date,
    status: a.status || 'pending',
    risk_score: riskScore,
    impact_level: impact,
    probability_level: probability,
    risk_level: riskLevel,
    mitigation_status: 'not_started', // unless backend provides it
    recommended_actions: a.treatment_recommendation
      ? [a.treatment_recommendation]
      : [],
    approved_by: safeName(a.approved_by),
    approved_date: a.approval_date || undefined,
    next_review_date: undefined, // unless backend provides
  };
};

const normalizeList = (data: any): ApiRiskAssessment[] => {
  const list = data?.results ?? data;
  if (Array.isArray(list)) return list as ApiRiskAssessment[];
  return [];
};

const fetchAssessments = async () => {
  try {
    setLoading(true);

    const response = await risksAPI.getRiskAssessments();
    const apiItems = normalizeList(response.data);

    setAssessments(apiItems.map(mapAssessmentToVM));
  } catch (error: any) {
      console.error('Failed to fetch risk assessments:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load risk assessments - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      // const mockAssessments: ApiRiskAssessment[] = [
      //   {
      //     id: '1',
      //     risk_title: 'Data Security Breach Risk',
      //     risk_description: 'Potential unauthorized access to sensitive customer data through cyber attacks',
      //     assessor: 'John Smith',
      //     assessment_date: '2024-12-20T10:00:00Z',
      //     review_date: '2024-12-20T14:30:00Z',
      //     status: 'approved',
      //     risk_score: 85,
      //     impact_level: 'high',
      //     probability_level: 'medium',
      //     risk_level: 'high',
      //     mitigation_status: 'in_progress',
      //     recommended_actions: [
      //       'Implement multi-factor authentication',
      //       'Conduct security audit',
      //       'Update firewall configurations'
      //     ],
      //     
      //     
      //     approved_by: 'Sarah Johnson',
      //     approved_date: '2024-12-20T14:30:00Z',
      //     next_review_date: '2025-01-20',
      //   },
      //   {
      //     id: '2',
      //     risk_title: 'Project Timeline Delay',
      //     risk_description: 'Risk of missing critical project deadlines due to resource constraints',
      //     assessor: 'Sarah Johnson',
      //     assessment_date: '2024-12-19T15:30:00Z',
      //     status: 'pending',
      //     risk_score: 65,
      //     impact_level: 'medium',
      //     probability_level: 'medium',
      //     risk_level: 'medium',
      //     mitigation_status: 'not_started',
      //     recommended_actions: [
      //       'Allocate additional resources',
      //       'Reprioritize project tasks',
      //       'Extend project timeline'
      //     ],
      //     
      //     
      //     next_review_date: '2025-01-19',
      //   },
      //   {
      //     id: '3',
      //     risk_title: 'Budget Overrun Risk',
      //     risk_description: 'Potential exceedance of project budget due to unforeseen expenses',
      //     assessor: 'Mike Davis',
      //     assessment_date: '2024-12-18T09:15:00Z',
      //     review_date: '2024-12-18T11:00:00Z',
      //     status: 'approved',
      //     risk_score: 78,
      //     impact_level: 'high',
      //     probability_level: 'medium',
      //     risk_level: 'high',
      //     mitigation_status: 'completed',
      //     recommended_actions: [
      //       'Implement cost control measures',
      //       'Regular budget reviews',
      //       'Contingency fund allocation'
      //     ],
      //     
      //     
      //     approved_by: 'David Wilson',
      //     approved_date: '2024-12-18T11:00:00Z',
      //     next_review_date: '2025-01-18',
      //   },
      //   {
      //     id: '4',
      //     risk_title: 'Resource Shortage',
      //     risk_description: 'Insufficient skilled personnel for critical project phases',
      //     assessor: 'Emily Chen',
      //     assessment_date: '2024-12-17T13:45:00Z',
      //     status: 'pending',
      //     risk_score: 55,
      //     impact_level: 'medium',
      //     probability_level: 'low',
      //     risk_level: 'medium',
      //     mitigation_status: 'in_progress',
      //     recommended_actions: [
      //       'Hire additional staff',
      //       'Cross-train existing team',
      //       'Outsource non-critical tasks'
      //     ],
      //     
      //     
      //     next_review_date: '2025-01-17',
      //   },
      //   {
      //     id: '5',
      //     risk_title: 'Regulatory Compliance',
      //     risk_description: 'Risk of non-compliance with new industry regulations',
      //     assessor: 'David Wilson',
      //     assessment_date: '2024-12-16T11:20:00Z',
      //     review_date: '2024-12-16T14:00:00Z',
      //     status: 'approved',
      //     risk_score: 42,
      //     impact_level: 'low',
      //     probability_level: 'low',
      //     risk_level: 'low',
      //     mitigation_status: 'completed',
      //     recommended_actions: [
      //       'Review compliance requirements',
      //       'Update internal policies',
      //       'Conduct compliance training'
      //     ],
      //     
      //     
      //     approved_by: 'Lisa Anderson',
      //     approved_date: '2024-12-16T14:00:00Z',
      //     next_review_date: '2025-01-16',
      //   },
      // ];

      // setAssessments(mockAssessments);
   
    console.error('Failed to fetch risk assessments:', error);

    // keep your toasts...

    const mockAssessments: RiskAssessmentVM[] = [ 
        {
          id: '1',
          risk_title: 'Data Security Breach Risk',
          risk_description: 'Potential unauthorized access to sensitive customer data through cyber attacks',
          assessor: 'John Smith',
          assessment_date: '2024-12-20T10:00:00Z',
          review_date: '2024-12-20T14:30:00Z',
          status: 'approved',
          risk_score: 85,
          impact_level: 'high',
          probability_level: 'medium',
          risk_level: 'high',
          mitigation_status: 'in_progress',
          recommended_actions: [
            'Implement multi-factor authentication',
            'Conduct security audit',
            'Update firewall configurations'
          ],
          
          
          approved_by: 'Sarah Johnson',
          approved_date: '2024-12-20T14:30:00Z',
          next_review_date: '2025-01-20',
        },
        {
          id: '2',
          risk_title: 'Project Timeline Delay',
          risk_description: 'Risk of missing critical project deadlines due to resource constraints',
          assessor: 'Sarah Johnson',
          assessment_date: '2024-12-19T15:30:00Z',
          status: 'pending',
          risk_score: 65,
          impact_level: 'medium',
          probability_level: 'medium',
          risk_level: 'medium',
          mitigation_status: 'not_started',
          recommended_actions: [
            'Allocate additional resources',
            'Reprioritize project tasks',
            'Extend project timeline'
          ],
          
          
          next_review_date: '2025-01-19',
        },
        {
          id: '3',
          risk_title: 'Budget Overrun Risk',
          risk_description: 'Potential exceedance of project budget due to unforeseen expenses',
          assessor: 'Mike Davis',
          assessment_date: '2024-12-18T09:15:00Z',
          review_date: '2024-12-18T11:00:00Z',
          status: 'approved',
          risk_score: 78,
          impact_level: 'high',
          probability_level: 'medium',
          risk_level: 'high',
          mitigation_status: 'completed',
          recommended_actions: [
            'Implement cost control measures',
            'Regular budget reviews',
            'Contingency fund allocation'
          ],
          
          
          approved_by: 'David Wilson',
          approved_date: '2024-12-18T11:00:00Z',
          next_review_date: '2025-01-18',
        },
        {
          id: '4',
          risk_title: 'Resource Shortage',
          risk_description: 'Insufficient skilled personnel for critical project phases',
          assessor: 'Emily Chen',
          assessment_date: '2024-12-17T13:45:00Z',
          status: 'pending',
          risk_score: 55,
          impact_level: 'medium',
          probability_level: 'low',
          risk_level: 'medium',
          mitigation_status: 'in_progress',
          recommended_actions: [
            'Hire additional staff',
            'Cross-train existing team',
            'Outsource non-critical tasks'
          ],
          
          
          next_review_date: '2025-01-17',
        },
        {
          id: '5',
          risk_title: 'Regulatory Compliance',
          risk_description: 'Risk of non-compliance with new industry regulations',
          assessor: 'David Wilson',
          assessment_date: '2024-12-16T11:20:00Z',
          review_date: '2024-12-16T14:00:00Z',
          status: 'approved',
          risk_score: 42,
          impact_level: 'low',
          probability_level: 'low',
          risk_level: 'low',
          mitigation_status: 'completed',
          recommended_actions: [
            'Review compliance requirements',
            'Update internal policies',
            'Conduct compliance training'
          ],
          
          
          approved_by: 'Lisa Anderson',
          approved_date: '2024-12-16T14:00:00Z',
          next_review_date: '2025-01-16',
        },
      ];

    setAssessments(mockAssessments);
  } finally {
    setLoading(false);
  }
};


const handleApproveAssessment = async (id: string) => {
  try {
    await risksAPI.approveRiskAssessment(id);
    toast.success('Risk assessment approved successfully');

    setAssessments(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'approved' } : a)
    );
  } catch (error: any) {
    console.error('Failed to approve assessment:', error);
    toast.error('Failed to approve assessment');
  }
};


  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = 
      assessment.risk_title.toLowerCase().includes(search.toLowerCase()) ||
      assessment.risk_description.toLowerCase().includes(search.toLowerCase()) ||
      assessment.assessor.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    const matchesRiskLevel = riskLevelFilter === 'all' || assessment.risk_level === riskLevelFilter;
    const matchesAssessor = assessorFilter === 'all' || assessment.assessor === assessorFilter;

    return matchesSearch && matchesStatus && matchesRiskLevel && matchesAssessor;
  });

  const assessors = [...new Set(assessments.map(a => a.assessor))];
  const approvedCount = assessments.filter(a => a.status === 'approved').length;
  const pendingCount = assessments.filter(a => a.status === 'pending').length;
  const highRiskCount = assessments.filter(a => a.risk_level === 'high').length;
  const averageRiskScore = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + a.risk_score, 0) / assessments.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      case 'draft': return <DocumentTextIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return <FireIcon className="h-4 w-4" />;
      case 'medium': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'low': return <ShieldCheckIcon className="h-4 w-4" />;
      default: return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const getMitigationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Risk Assessments</h1>
              <p className="text-gray-600">Manage and track risk assessments and evaluations</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/risks/assessments/bulk">
                <Button variant="outline" className="flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Bulk Assessment
                </Button>
              </Link>
              <Link href="/risks/assessments/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                  <FireIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{highRiskCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Assessments
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
                    placeholder="Search by title, description, or assessor..."
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
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={riskLevelFilter}
                  onChange={(e) => setRiskLevelFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessor
                </label>
                <select
                  value={assessorFilter}
                  onChange={(e) => setAssessorFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Assessors</option>
                  {assessors.map(assessor => (
                    <option key={assessor} value={assessor}>{assessor}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assessments List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredAssessments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredAssessments.map((assessment) => (
                  <div key={assessment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{assessment.risk_title}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assessment.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(assessment.status)}
                                  <span className="ml-1">{assessment.status}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(assessment.risk_level)}`}>
                                <span className="flex items-center">
                                  {getRiskLevelIcon(assessment.risk_level)}
                                  <span className="ml-1">{assessment.risk_level}</span>
                                </span>
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {assessment.assessor}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(assessment.assessment_date)}
                              </span>
                              <span className="flex items-center">
                                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                Score: {assessment.risk_score}
                              </span>
                              <span className="flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                Impact: {assessment.impact_level}
                              </span>
                              <span className="flex items-center">
                                <BeakerIcon className="h-4 w-4 mr-1" />
                                Probability: {assessment.probability_level}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{assessment.risk_description}</p>
                            </div>
                            {assessment.approved_by && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Approved by: {assessment.approved_by} on {formatDate(assessment.approved_date || '')}
                              </div>
                            )}
                            {assessment.next_review_date && (
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Next review: {formatDate(assessment.next_review_date)}
                              </div>
                            )}
                            <div className="mt-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMitigationStatusColor(assessment.mitigation_status)}`}>
                                Mitigation: {assessment.mitigation_status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">Score: {assessment.risk_score}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Link href={`/risks/assessments/${assessment.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/risks/assessments/${assessment.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            {assessment.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleApproveAssessment(assessment.id)}
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
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risk assessments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || riskLevelFilter !== 'all' || assessorFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new risk assessment'
                  }
                </p>
                {!search && statusFilter === 'all' && riskLevelFilter === 'all' && assessorFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/risks/assessments/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Assessment
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
