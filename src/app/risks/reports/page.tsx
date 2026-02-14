'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { risksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  DocumentChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RiskReport {
  id: string;
  title: string;
  description: string;
  report_type: string;
  report_period: string;
  status: string;
  generated_by: string;
  generated_at: string;
  last_updated: string;
  file_url?: string;
  file_size?: number;
  file_format: string;
  department?: string;
  organization: string;
  report_data: {
    total_risks: number;
    high_risks: number;
    medium_risks: number;
    low_risks: number;
    mitigated_risks: number;
    open_issues: number;
    completed_mitigations: number;
    risk_trend: string;
    key_findings: string[];
    recommendations: string[];
  };
  parameters: {
    date_range: string;
    categories: string[];
    departments: string[];
    risk_levels: string[];
    include_charts: boolean;
    include_details: boolean;
  };
  schedule?: {
    frequency: string;
    next_run: string;
    recipients: string[];
  };
  access_level: string;
  is_template: boolean;
}

export default function RiskReportsPage() {
  const [reports, setReports] = useState<RiskReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching risk reports...');
      const response = await risksAPI.getRiskReports();
      console.log('API Response:', response);
      setReports(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch risk reports:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load risk reports - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockReports: RiskReport[] = [
        {
          id: '1',
          title: 'Monthly Risk Summary Report',
          description: 'Comprehensive monthly overview of all risks, assessments, and mitigation activities',
          report_type: 'Summary',
          report_period: 'December 2024',
          status: 'completed',
          generated_by: 'John Smith',
          generated_at: '2024-12-20T14:30:00Z',
          last_updated: '2024-12-20T14:30:00Z',
          file_url: '/reports/monthly-summary-dec-2024.pdf',
          file_size: 2456789,
          file_format: 'PDF',
          organization: 'Jaffer Business Systems',
          report_data: {
            total_risks: 156,
            high_risks: 23,
            medium_risks: 67,
            low_risks: 66,
            mitigated_risks: 89,
            open_issues: 12,
            completed_mitigations: 45,
            risk_trend: 'decreasing',
            key_findings: [
              'Security risks decreased by 15%',
              'Financial risks remain stable',
              'New operational risks identified in supply chain',
              'Mitigation effectiveness improved to 87%'
            ],
            recommendations: [
              'Focus on supply chain risk assessment',
              'Enhance cybersecurity training',
              'Review financial controls quarterly'
            ]
          },
          parameters: {
            date_range: '2024-12-01 to 2024-12-31',
            categories: ['Security', 'Financial', 'Operational', 'Strategic', 'Compliance'],
            departments: ['All'],
            risk_levels: ['High', 'Medium', 'Low'],
            include_charts: true,
            include_details: true
          },
          schedule: {
            frequency: 'Monthly',
            next_run: '2025-01-20',
            recipients: ['board@company.com', 'management@company.com']
          },
          access_level: 'executive',
          is_template: false,
        },
        {
          id: '2',
          title: 'Executive Risk Dashboard',
          description: 'High-level risk overview for executive leadership and board members',
          report_type: 'Executive',
          report_period: 'Q4 2024',
          status: 'completed',
          generated_by: 'Sarah Johnson',
          generated_at: '2024-12-18T10:15:00Z',
          last_updated: '2024-12-18T10:15:00Z',
          file_url: '/reports/executive-dashboard-q4-2024.pdf',
          file_size: 1234567,
          file_format: 'PDF',
          organization: 'Jaffer Business Systems',
          report_data: {
            total_risks: 156,
            high_risks: 23,
            medium_risks: 67,
            low_risks: 66,
            mitigated_risks: 89,
            open_issues: 12,
            completed_mitigations: 45,
            risk_trend: 'stable',
            key_findings: [
              'Overall risk posture improved',
              'Key risk indicators within acceptable ranges',
              'Strategic initiatives on track',
              'Compliance requirements met'
            ],
            recommendations: [
              'Continue current risk management practices',
              'Monitor emerging cyber threats',
              'Maintain mitigation efforts'
            ]
          },
          parameters: {
            date_range: '2024-10-01 to 2024-12-31',
            categories: ['Strategic', 'Financial'],
            departments: ['Executive'],
            risk_levels: ['High', 'Medium'],
            include_charts: true,
            include_details: false
          },
          schedule: {
            frequency: 'Quarterly',
            next_run: '2025-03-31',
            recipients: ['board@company.com']
          },
          access_level: 'board',
          is_template: false,
        },
        {
          id: '3',
          title: 'IT Security Risk Assessment',
          description: 'Detailed analysis of IT security risks and cybersecurity posture',
          report_type: 'Technical',
          report_period: 'December 2024',
          status: 'completed',
          generated_by: 'Mike Davis',
          generated_at: '2024-12-19T16:45:00Z',
          last_updated: '2024-12-19T16:45:00Z',
          file_url: '/reports/it-security-dec-2024.pdf',
          file_size: 3456789,
          file_format: 'PDF',
          department: 'IT',
          organization: 'Jaffer Business Systems',
          report_data: {
            total_risks: 45,
            high_risks: 12,
            medium_risks: 18,
            low_risks: 15,
            mitigated_risks: 28,
            open_issues: 8,
            completed_mitigations: 17,
            risk_trend: 'improving',
            key_findings: [
              'Vulnerability patching improved to 95%',
              'Security awareness training effective',
              'New threats identified in cloud infrastructure',
              'Incident response time reduced by 30%'
            ],
            recommendations: [
              'Implement zero-trust architecture',
              'Enhance cloud security monitoring',
              'Regular penetration testing'
            ]
          },
          parameters: {
            date_range: '2024-12-01 to 2024-12-31',
            categories: ['Security', 'Technology'],
            departments: ['IT'],
            risk_levels: ['High', 'Medium', 'Low'],
            include_charts: true,
            include_details: true
          },
          schedule: {
            frequency: 'Monthly',
            next_run: '2025-01-19',
            recipients: ['cio@company.com', 'security-team@company.com']
          },
          access_level: 'department',
          is_template: false,
        },
        {
          id: '4',
          title: 'Compliance Status Report',
          description: 'Regulatory compliance and legal risk assessment report',
          report_type: 'Compliance',
          report_period: 'December 2024',
          status: 'in_progress',
          generated_by: 'David Wilson',
          generated_at: '2024-12-20T09:30:00Z',
          last_updated: '2024-12-20T09:30:00Z',
          file_format: 'PDF',
          department: 'Legal',
          organization: 'Jaffer Business Systems',
          report_data: {
            total_risks: 22,
            high_risks: 5,
            medium_risks: 9,
            low_risks: 8,
            mitigated_risks: 15,
            open_issues: 3,
            completed_mitigations: 12,
            risk_trend: 'stable',
            key_findings: [
              'GDPR compliance maintained',
              'SOX requirements met',
              'New privacy regulations reviewed',
              'Training programs updated'
            ],
            recommendations: [
              'Monitor upcoming regulatory changes',
              'Update privacy policies',
              'Enhance compliance monitoring'
            ]
          },
          parameters: {
            date_range: '2024-12-01 to 2024-12-31',
            categories: ['Compliance', 'Legal'],
            departments: ['Legal', 'Compliance'],
            risk_levels: ['High', 'Medium'],
            include_charts: true,
            include_details: true
          },
          schedule: {
            frequency: 'Monthly',
            next_run: '2025-01-20',
            recipients: ['legal@company.com', 'compliance@company.com']
          },
          access_level: 'department',
          is_template: false,
        },
        {
          id: '5',
          title: 'Risk Trend Analysis',
          description: 'Historical analysis of risk trends and patterns over the past 12 months',
          report_type: 'Analytics',
          report_period: '2024 Annual',
          status: 'completed',
          generated_by: 'Emily Chen',
          generated_at: '2024-12-15T11:20:00Z',
          last_updated: '2024-12-15T11:20:00Z',
          file_url: '/reports/risk-trends-2024.pdf',
          file_size: 4567890,
          file_format: 'PDF',
          organization: 'Jaffer Business Systems',
          report_data: {
            total_risks: 156,
            high_risks: 23,
            medium_risks: 67,
            low_risks: 66,
            mitigated_risks: 89,
            open_issues: 12,
            completed_mitigations: 45,
            risk_trend: 'improving',
            key_findings: [
              'Risk levels decreased by 18% YoY',
              'Mitigation effectiveness increased',
              'New risk categories identified',
              'Risk culture improved significantly'
            ],
            recommendations: [
              'Continue current risk management strategy',
              'Invest in preventive measures',
              'Enhance risk awareness programs'
            ]
          },
          parameters: {
            date_range: '2024-01-01 to 2024-12-31',
            categories: ['All'],
            departments: ['All'],
            risk_levels: ['High', 'Medium', 'Low'],
            include_charts: true,
            include_details: true
          },
          access_level: 'management',
          is_template: false,
        },
        {
          id: '6',
          title: 'Project Risk Portfolio',
          description: 'Comprehensive analysis of all project risks and mitigation status',
          report_type: 'Project',
          report_period: 'Q4 2024',
          status: 'scheduled',
          generated_by: 'System',
          generated_at: '2024-12-20T00:00:00Z',
          last_updated: '2024-12-20T00:00:00Z',
          file_format: 'PDF',
          organization: 'Jaffer Business Systems',
          report_data: {
            total_risks: 78,
            high_risks: 15,
            medium_risks: 33,
            low_risks: 30,
            mitigated_risks: 45,
            open_issues: 18,
            completed_mitigations: 28,
            risk_trend: 'stable',
            key_findings: [],
            recommendations: []
          },
          parameters: {
            date_range: '2024-10-01 to 2024-12-31',
            categories: ['Project Management', 'Financial', 'Operational'],
            departments: ['PMO'],
            risk_levels: ['High', 'Medium', 'Low'],
            include_charts: true,
            include_details: true
          },
          schedule: {
            frequency: 'Quarterly',
            next_run: '2024-12-22',
            recipients: ['pmo@company.com', 'project-managers@company.com']
          },
          access_level: 'project',
          is_template: false,
        },
      ];

      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      console.log('Deleting report:', id);
      await risksAPI.deleteRiskReport(id);
      toast.success('Risk report deleted successfully');
      fetchReports();
    } catch (error: any) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleDownloadReport = async (id: string) => {
    try {
      console.log('Downloading report:', id);
      await risksAPI.downloadRiskReport(id);
      toast.success('Risk report downloaded successfully');
    } catch (error: any) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleShareReport = async (id: string) => {
    try {
      console.log('Sharing report:', id);
      await risksAPI.shareRiskReport(id);
      toast.success('Risk report shared successfully');
    } catch (error: any) {
      console.error('Failed to share report:', error);
      toast.error('Failed to share report');
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase()) ||
      report.report_type.toLowerCase().includes(search.toLowerCase()) ||
      report.generated_by.toLowerCase().includes(search.toLowerCase()) ||
      report.department?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
    const matchesDepartment = departmentFilter === 'all' || report.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDepartment;
  });

  const completedCount = reports.filter(r => r.status === 'completed').length;
  const inProgressCount = reports.filter(r => r.status === 'in_progress').length;
  const scheduledCount = reports.filter(r => r.status === 'scheduled').length;
  const totalSize = reports.reduce((sum, r) => sum + (r.file_size || 0), 0);
  const departments = [...new Set(reports.filter(r => r.department).map(r => r.department!))];
  const reportTypes = [...new Set(reports.map(r => r.report_type))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'in_progress': return <ClockIcon className="h-4 w-4" />;
      case 'scheduled': return <CalendarIcon className="h-4 w-4" />;
      case 'failed': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Summary': return 'bg-blue-100 text-blue-800';
      case 'Executive': return 'bg-purple-100 text-purple-800';
      case 'Technical': return 'bg-indigo-100 text-indigo-800';
      case 'Compliance': return 'bg-green-100 text-green-800';
      case 'Analytics': return 'bg-orange-100 text-orange-800';
      case 'Project': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Summary': return <DocumentChartBarIcon className="h-4 w-4" />;
      case 'Executive': return <ArrowTrendingUpIcon className="h-4 w-4" />;
      case 'Technical': return <ChartBarIcon className="h-4 w-4" />;
      case 'Compliance': return <DocumentIcon className="h-4 w-4" />;
      case 'Analytics': return <ChartBarIcon className="h-4 w-4" />;
      case 'Project': return <CalendarDaysIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <h1 className="text-2xl font-bold text-gray-900">Risk Reports</h1>
              <p className="text-gray-600">Generate, manage, and distribute risk management reports</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/risks/reports/schedule">
                <Button variant="outline" className="flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </Link>
              <Link href="/risks/reports/templates">
                <Button variant="outline" className="flex items-center">
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </Link>
              <Link href="/risks/reports/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <DocumentChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
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
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
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
                  <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Size</p>
                  <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Reports
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
                    placeholder="Search by title, description, or type..."
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
                  <option value="scheduled">Scheduled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  {reportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Actions
                </label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={fetchReports}>
                    <ClockIcon className="h-4 w-4" />
                  </Button>
                  <Link href="/risks/reports/bulk-download">
                    <Button variant="outline" size="sm">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredReports.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            {getTypeIcon(report.report_type)}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(report.status)}
                                  <span className="ml-1">{report.status.replace('_', ' ')}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(report.report_type)}`}>
                                <span className="flex items-center">
                                  {getTypeIcon(report.report_type)}
                                  <span className="ml-1">{report.report_type}</span>
                                </span>
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {report.generated_by}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(report.generated_at)}
                              </span>
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                {report.report_data.total_risks} risks
                              </span>
                              {report.department && (
                                <span className="flex items-center">
                                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                  {report.department}
                                </span>
                              )}
                              {report.file_size && (
                                <span className="flex items-center">
                                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                  {formatFileSize(report.file_size)}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{report.description}</p>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>Period: {report.report_period}</span>
                              <span>Format: {report.file_format}</span>
                              <span>Trend: {report.report_data.risk_trend}</span>
                            </div>
                            {report.schedule && (
                              <div className="mt-2 text-sm text-gray-500">
                                <span>Schedule: {report.schedule.frequency}</span>
                                <span className="ml-4">Next: {formatDate(report.schedule.next_run)}</span>
                              </div>
                            )}
                            {report.report_data.key_findings.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Key Findings:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {report.report_data.key_findings.slice(0, 2).map((finding, index) => (
                                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                      {finding}
                                    </span>
                                  ))}
                                  {report.report_data.key_findings.length > 2 && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                      +{report.report_data.key_findings.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            {report.report_data.high_risks} high, {report.report_data.medium_risks} medium, {report.report_data.low_risks} low
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/risks/reports/${report.id}`}>
                              <Button variant="outline" size="sm">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            {report.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadReport(report.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleShareReport(report.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ShareIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No risk reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new risk report'
                  }
                </p>
                {!search && statusFilter === 'all' && typeFilter === 'all' && departmentFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/risks/reports/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Report
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
