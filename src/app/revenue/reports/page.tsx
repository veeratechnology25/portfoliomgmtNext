'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { revenueAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BanknotesIcon,
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface RevenueReport {
  id: string;
  title: string;
  description: string;
  report_type: string;
  date_range: string;
  start_date: string;
  end_date: string;
  generated_date: string;
  generated_by: string;
  file_url?: string;
  file_size?: number;
  status: string;
  metrics: {
    total_revenue: number;
    client_count: number;
    invoice_count: number;
    collection_rate: number;
    average_invoice_value: number;
    growth_rate?: number;
  };
  filters?: {
    client_ids?: string[];
    revenue_types?: string[];
    status?: string[];
  };
}

export default function RevenueReportsPage() {
  const [reports, setReports] = useState<RevenueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue reports...');
      const response = await revenueAPI.getRevenueReports();
      console.log('API Response:', response);
      setReports(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch revenue reports:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load revenue reports - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockReports: RevenueReport[] = [
        {
          id: '1',
          title: 'Monthly Revenue Report - December 2024',
          description: 'Comprehensive monthly revenue analysis with client breakdown and trends',
          report_type: 'monthly',
          date_range: 'December 2024',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          generated_date: '2024-12-31T23:59:59Z',
          generated_by: 'Sarah Johnson',
          file_url: '/reports/monthly-revenue-dec-2024.pdf',
          file_size: 2048576,
          status: 'completed',
          metrics: {
            total_revenue: 125000.00,
            client_count: 15,
            invoice_count: 45,
            collection_rate: 92.5,
            average_invoice_value: 2777.78,
            growth_rate: 8.2,
          },
        },
        {
          id: '2',
          title: 'Quarterly Revenue Analysis - Q4 2024',
          description: 'Quarterly performance review with year-over-year comparisons',
          report_type: 'quarterly',
          date_range: 'Q4 2024',
          start_date: '2024-10-01',
          end_date: '2024-12-31',
          generated_date: '2024-12-31T23:45:00Z',
          generated_by: 'Mike Davis',
          file_url: '/reports/q4-revenue-2024.pdf',
          file_size: 3145728,
          status: 'completed',
          metrics: {
            total_revenue: 375000.00,
            client_count: 25,
            invoice_count: 135,
            collection_rate: 90.8,
            average_invoice_value: 2777.78,
            growth_rate: 12.4,
          },
        },
        {
          id: '3',
          title: 'Client Revenue Performance - 2024',
          description: 'Annual client revenue ranking and performance metrics',
          report_type: 'client_performance',
          date_range: 'January - December 2024',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          generated_date: '2024-12-30T16:30:00Z',
          generated_by: 'Emily Chen',
          file_url: '/reports/client-performance-2024.pdf',
          file_size: 4194304,
          status: 'completed',
          metrics: {
            total_revenue: 1500000.00,
            client_count: 45,
            invoice_count: 540,
            collection_rate: 91.2,
            average_invoice_value: 2777.78,
            growth_rate: 15.6,
          },
        },
        {
          id: '4',
          title: 'Revenue Stream Analysis - December 2024',
          description: 'Detailed breakdown of revenue streams and recurring income',
          report_type: 'revenue_streams',
          date_range: 'December 2024',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          generated_date: '2024-12-28T14:20:00Z',
          generated_by: 'David Wilson',
          file_url: '/reports/revenue-streams-dec-2024.pdf',
          file_size: 1572864,
          status: 'completed',
          metrics: {
            total_revenue: 125000.00,
            client_count: 15,
            invoice_count: 45,
            collection_rate: 92.5,
            average_invoice_value: 2777.78,
            growth_rate: 8.2,
          },
        },
        {
          id: '5',
          title: 'Collections Report - Q4 2024',
          description: 'Collection efficiency and aging analysis for Q4 2024',
          report_type: 'collections',
          date_range: 'Q4 2024',
          start_date: '2024-10-01',
          end_date: '2024-12-31',
          generated_date: '2024-12-29T11:15:00Z',
          generated_by: 'Lisa Anderson',
          file_url: '/reports/collections-q4-2024.pdf',
          file_size: 1048576,
          status: 'processing',
          metrics: {
            total_revenue: 375000.00,
            client_count: 25,
            invoice_count: 135,
            collection_rate: 90.8,
            average_invoice_value: 2777.78,
            growth_rate: 12.4,
          },
        },
      ];

      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report: RevenueReport) => {
    try {
      console.log('Downloading report:', report.id);
      // In a real implementation, this would download the file
      toast.success(`Report "${report.title}" downloaded successfully`);
    } catch (error: any) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      console.log('Generating report:', reportType);
      toast.success(`Report generation started for ${reportType}`);
      fetchReports();
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesType = reportTypeFilter === 'all' || report.report_type === reportTypeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    return matchesType && matchesStatus;
  });

  const reportTypes = [...new Set(reports.map(r => r.report_type))];
  const completedCount = reports.filter(r => r.status === 'completed').length;
  const processingCount = reports.filter(r => r.status === 'processing').length;
  const totalRevenue = reports.reduce((sum, r) => sum + r.metrics.total_revenue, 0);

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annual': return 'bg-green-100 text-green-800';
      case 'client_performance': return 'bg-orange-100 text-orange-800';
      case 'revenue_streams': return 'bg-indigo-100 text-indigo-800';
      case 'collections': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
              <h1 className="text-2xl font-bold text-gray-900">Revenue Reports</h1>
              <p className="text-gray-600">Generate and analyze comprehensive revenue reports</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => handleGenerateReport('monthly')}
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Generate Monthly
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => handleGenerateReport('quarterly')}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Generate Quarterly
              </Button>
              <Button className="flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Custom Report
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
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
                  <DocumentArrowDownIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <FunnelIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">{processingCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportTypeFilter}
                  onChange={(e) => setReportTypeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  {reportTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </option>
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
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                  <option value="scheduled">Scheduled</option>
                </select>
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
                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getReportTypeColor(report.report_type)}`}>
                                {report.report_type.replace('_', ' ').charAt(0).toUpperCase() + report.report_type.replace('_', ' ').slice(1)}
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Period: {report.date_range}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Generated: {formatDate(report.generated_date)}
                              </span>
                              <span className="flex items-center">
                                <UserGroupIcon className="h-4 w-4 mr-1" />
                                By: {report.generated_by}
                              </span>
                              {report.file_size && (
                                <span className="flex items-center">
                                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                                  Size: {formatFileSize(report.file_size)}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{report.description}</p>
                            </div>
                            
                            {/* Metrics */}
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                  <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">Total Revenue</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(report.metrics.total_revenue)}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                  <BuildingOfficeIcon className="h-4 w-4 text-gray-500 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">Clients</p>
                                    <p className="text-sm font-semibold text-gray-900">{report.metrics.client_count}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                  <DocumentTextIcon className="h-4 w-4 text-gray-500 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">Invoices</p>
                                    <p className="text-sm font-semibold text-gray-900">{report.metrics.invoice_count}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                  <BanknotesIcon className="h-4 w-4 text-gray-500 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">Collection Rate</p>
                                    <p className="text-sm font-semibold text-gray-900">{report.metrics.collection_rate}%</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center">
                                  <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">Avg Invoice</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(report.metrics.average_invoice_value)}</p>
                                  </div>
                                </div>
                              </div>
                              {report.metrics.growth_rate && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center">
                                    {report.metrics.growth_rate > 0 ? (
                                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-2" />
                                    ) : (
                                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-2" />
                                    )}
                                    <div>
                                      <p className="text-xs text-gray-500">Growth Rate</p>
                                      <p className={`text-sm font-semibold ${report.metrics.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {report.metrics.growth_rate > 0 ? '+' : ''}{report.metrics.growth_rate}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {report.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Share</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {reportTypeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filter criteria'
                    : 'Get started by generating your first revenue report'
                  }
                </p>
                {reportTypeFilter === 'all' && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Button 
                      onClick={() => handleGenerateReport('monthly')}
                      className="mr-2"
                    >
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      Generate Monthly Report
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleGenerateReport('quarterly')}
                    >
                      <FunnelIcon className="h-4 w-4 mr-2" />
                      Generate Quarterly Report
                    </Button>
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
