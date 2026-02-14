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
  DocumentTextIcon,
  FireIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BeakerIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Risk {
  id: string;
  title: string;
  description: string;
  risk_level: string;
  impact_level: string;
  probability_level: string;
  risk_score: number;
  status: string;
  category: string;
  department: string;
  risk_owner?: string;
  identified_date: string;
  review_date?: string;
  closure_date?: string;
  next_review_date?: string;
  affected_areas: string[];
  potential_impact: string;
  existing_controls: string[];
  risk_treatment: string;
  escalation_level: number;
  created_at: string;
  updated_at: string;
  assessments_count: number;
  mitigations_count: number;
  issues_count: number;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      console.log('Fetching risks...');
      const response = await risksAPI.getRisks();
      console.log('API Response:', response);
      setRisks(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch risks:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load risks - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockRisks: Risk[] = [
        {
          id: '1',
          title: 'Data Security Breach Risk',
          description: 'Potential unauthorized access to sensitive customer data through cyber attacks or internal breaches',
          risk_level: 'high',
          impact_level: 'high',
          probability_level: 'medium',
          risk_score: 85,
          status: 'open',
          category: 'Security',
          department: 'IT',
          risk_owner: 'John Smith',
          identified_date: '2024-11-15T10:30:00Z',
          review_date: '2024-12-20T14:30:00Z',
          next_review_date: '2025-01-20',
          affected_areas: ['Customer Data', 'Financial Systems', 'Reputation'],
          potential_impact: 'Data breach could result in financial loss, regulatory penalties, and reputation damage',
          existing_controls: ['Firewall', 'Access Controls', 'Encryption'],
          risk_treatment: 'Mitigate',
          escalation_level: 2,
          created_at: '2024-11-15T10:30:00Z',
          updated_at: '2024-12-20T14:30:00Z',
          assessments_count: 3,
          mitigations_count: 2,
          issues_count: 1,
        },
        {
          id: '2',
          title: 'Project Timeline Delay',
          description: 'Risk of missing critical project deadlines due to resource constraints, technical challenges, or scope changes',
          risk_level: 'medium',
          impact_level: 'medium',
          probability_level: 'medium',
          risk_score: 65,
          status: 'open',
          category: 'Project Management',
          department: 'Project Management',
          risk_owner: 'Sarah Johnson',
          identified_date: '2024-11-20T14:15:00Z',
          review_date: '2024-12-19T15:30:00Z',
          next_review_date: '2025-01-19',
          affected_areas: ['Project Delivery', 'Client Relations', 'Budget'],
          potential_impact: 'Delay could result in client dissatisfaction and potential contract penalties',
          existing_controls: ['Project Management Software', 'Regular Status Meetings'],
          risk_treatment: 'Mitigate',
          escalation_level: 1,
          created_at: '2024-11-20T14:15:00Z',
          updated_at: '2024-12-19T15:30:00Z',
          assessments_count: 2,
          mitigations_count: 1,
          issues_count: 1,
        },
        {
          id: '3',
          title: 'Budget Overrun Risk',
          description: 'Potential exceedance of project budget due to unforeseen expenses, scope creep, or resource cost increases',
          risk_level: 'high',
          impact_level: 'high',
          probability_level: 'medium',
          risk_score: 78,
          status: 'mitigated',
          category: 'Financial',
          department: 'Finance',
          risk_owner: 'Mike Davis',
          identified_date: '2024-10-25T09:00:00Z',
          review_date: '2024-12-18T11:00:00Z',
          next_review_date: '2025-01-18',
          affected_areas: ['Budget', 'Project Completion', 'Stakeholder Relations'],
          potential_impact: 'Budget overrun could affect project viability and stakeholder confidence',
          existing_controls: ['Budget Monitoring', 'Approval Processes', 'Contingency Fund'],
          risk_treatment: 'Mitigate',
          escalation_level: 1,
          created_at: '2024-10-25T09:00:00Z',
          updated_at: '2024-12-18T11:00:00Z',
          assessments_count: 4,
          mitigations_count: 3,
          issues_count: 2,
        },
        {
          id: '4',
          title: 'Resource Shortage',
          description: 'Insufficient skilled personnel or resources available for critical project phases and operations',
          risk_level: 'medium',
          impact_level: 'medium',
          probability_level: 'low',
          risk_score: 55,
          status: 'open',
          category: 'Human Resources',
          department: 'HR',
          risk_owner: 'Emily Chen',
          identified_date: '2024-12-01T11:45:00Z',
          review_date: '2024-12-17T13:45:00Z',
          next_review_date: '2025-01-17',
          affected_areas: ['Project Delivery', 'Quality', 'Team Morale'],
          potential_impact: 'Resource shortage could delay project milestones and affect quality',
          existing_controls: ['Staffing Plans', 'Cross-training Programs'],
          risk_treatment: 'Accept',
          escalation_level: 0,
          created_at: '2024-12-01T11:45:00Z',
          updated_at: '2024-12-17T13:45:00Z',
          assessments_count: 1,
          mitigations_count: 1,
          issues_count: 1,
        },
        {
          id: '5',
          title: 'Regulatory Compliance',
          description: 'Risk of non-compliance with new industry regulations and changing legal requirements',
          risk_level: 'low',
          impact_level: 'low',
          probability_level: 'low',
          risk_score: 42,
          status: 'closed',
          category: 'Compliance',
          department: 'Legal',
          risk_owner: 'David Wilson',
          identified_date: '2024-11-10T16:20:00Z',
          review_date: '2024-12-16T14:00:00Z',
          closure_date: '2024-12-17T15:45:00Z',
          affected_areas: ['Legal Compliance', 'Operations', 'Reputation'],
          potential_impact: 'Non-compliance could result in fines and legal action',
          existing_controls: ['Compliance Team', 'Regular Audits', 'Legal Review'],
          risk_treatment: 'Mitigate',
          escalation_level: 0,
          created_at: '2024-11-10T16:20:00Z',
          updated_at: '2024-12-17T15:45:00Z',
          assessments_count: 2,
          mitigations_count: 2,
          issues_count: 0,
        },
        {
          id: '6',
          title: 'Technology Obsolescence',
          description: 'Risk of current technology infrastructure becoming outdated and unable to support business needs',
          risk_level: 'medium',
          impact_level: 'medium',
          probability_level: 'medium',
          risk_score: 60,
          status: 'open',
          category: 'Technology',
          department: 'IT',
          risk_owner: 'Tom Brown',
          identified_date: '2024-11-28T09:30:00Z',
          review_date: '2024-12-15T10:15:00Z',
          next_review_date: '2025-01-15',
          affected_areas: ['System Performance', 'Business Operations', 'Competitiveness'],
          potential_impact: 'Outdated technology could hinder business operations and competitive advantage',
          existing_controls: ['Technology Roadmap', 'Regular Reviews'],
          risk_treatment: 'Mitigate',
          escalation_level: 1,
          created_at: '2024-11-28T09:30:00Z',
          updated_at: '2024-12-15T10:15:00Z',
          assessments_count: 1,
          mitigations_count: 1,
          issues_count: 0,
        },
      ];

      setRisks(mockRisks);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRisk = async (id: string) => {
    try {
      console.log('Closing risk:', id);
      await risksAPI.closeRisk(id);
      toast.success('Risk closed successfully');
      fetchRisks();
    } catch (error: any) {
      console.error('Failed to close risk:', error);
      toast.error('Failed to close risk');
    }
  };

  const handleEscalateRisk = async (id: string) => {
    try {
      console.log('Escalating risk:', id);
      await risksAPI.escalateRisk(id);
      toast.success('Risk escalated successfully');
      fetchRisks();
    } catch (error: any) {
      console.error('Failed to escalate risk:', error);
      toast.error('Failed to escalate risk');
    }
  };

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch = 
      risk.title.toLowerCase().includes(search.toLowerCase()) ||
      risk.description.toLowerCase().includes(search.toLowerCase()) ||
      risk.risk_owner?.toLowerCase().includes(search.toLowerCase()) ||
      risk.department.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;
    const matchesRiskLevel = riskLevelFilter === 'all' || risk.risk_level === riskLevelFilter;
    const matchesCategory = categoryFilter === 'all' || risk.category === categoryFilter;
    const matchesDepartment = departmentFilter === 'all' || risk.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesRiskLevel && matchesCategory && matchesDepartment;
  });

  const categories = [...new Set(risks.map(r => r.category))];
  const departments = [...new Set(risks.map(r => r.department))];
  const openCount = risks.filter(r => r.status === 'open').length;
  const mitigatedCount = risks.filter(r => r.status === 'mitigated').length;
  const closedCount = risks.filter(r => r.status === 'closed').length;
  const highRiskCount = risks.filter(r => r.risk_level === 'high').length;
  const averageRiskScore = risks.length > 0 
    ? Math.round(risks.reduce((sum, r) => sum + r.risk_score, 0) / risks.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'mitigated': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'mitigated': return <ShieldCheckIcon className="h-4 w-4" />;
      case 'escalated': return <ArrowTrendingUpIcon className="h-4 w-4" />;
      case 'closed': return <CheckCircleIcon className="h-4 w-4" />;
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
              <h1 className="text-2xl font-bold text-gray-900">Risk Register</h1>
              <p className="text-gray-600">Comprehensive risk register with assessments and mitigations</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/risks/heatmap">
                <Button variant="outline" className="flex items-center">
                  <FireIcon className="h-4 w-4 mr-2" />
                  Risk Heatmap
                </Button>
              </Link>
              <Link href="/risks/risks/bulk">
                <Button variant="outline" className="flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Bulk Actions
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Risks</p>
                  <p className="text-2xl font-bold text-gray-900">{risks.length}</p>
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

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">{openCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mitigated</p>
                  <p className="text-2xl font-bold text-gray-900">{mitigatedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageRiskScore}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Risks
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
                    placeholder="Search by title, description, or owner..."
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
                  <option value="mitigated">Mitigated</option>
                  <option value="escalated">Escalated</option>
                  <option value="closed">Closed</option>
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
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Risks List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredRisks.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredRisks.map((risk) => (
                  <div key={risk.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-red-100 rounded-lg p-2">
                            {getRiskLevelIcon(risk.risk_level)}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{risk.title}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(risk.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(risk.status)}
                                  <span className="ml-1">{risk.status}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(risk.risk_level)}`}>
                                <span className="flex items-center">
                                  {getRiskLevelIcon(risk.risk_level)}
                                  <span className="ml-1">{risk.risk_level}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getEscalationColor(risk.escalation_level)}`}>
                                L{risk.escalation_level}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {risk.risk_owner || 'Unassigned'}
                              </span>
                              <span className="flex items-center">
                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                {risk.department}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(risk.identified_date)}
                              </span>
                              <span className="flex items-center">
                                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                Score: {risk.risk_score}
                              </span>
                              <span className="flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                Impact: {risk.impact_level}
                              </span>
                              <span className="flex items-center">
                                <BeakerIcon className="h-4 w-4 mr-1" />
                                Probability: {risk.probability_level}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{risk.description}</p>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p><strong>Potential Impact:</strong> {risk.potential_impact}</p>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Category: {risk.category}</span>
                              <span>Treatment: {risk.risk_treatment}</span>
                              {risk.next_review_date && (
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Next review: {formatDate(risk.next_review_date)}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {risk.assessments_count} assessments
                              </span>
                              <span className="flex items-center">
                                <BeakerIcon className="h-4 w-4 mr-1" />
                                {risk.mitigations_count} mitigations
                              </span>
                              <span className="flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                {risk.issues_count} issues
                              </span>
                            </div>
                            {risk.affected_areas.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {risk.affected_areas.map((area, index) => (
                                  <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 mb-2">Score: {risk.risk_score}</div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/risks/risks/${risk.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/risks/risks/${risk.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            {risk.status === 'open' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEscalateRisk(risk.id)}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <ArrowTrendingUpIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {(risk.status === 'open' || risk.status === 'escalated') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCloseRisk(risk.id)}
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risks found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || riskLevelFilter !== 'all' || categoryFilter !== 'all' || departmentFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new risk'
                  }
                </p>
                {!search && statusFilter === 'all' && riskLevelFilter === 'all' && categoryFilter === 'all' && departmentFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/risks/risks/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Risk
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
