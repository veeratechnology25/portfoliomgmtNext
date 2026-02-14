'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { revenueAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ArrowTrendingUpIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RevenueStream {
  id: string;
  name: string;
  description: string;
  stream_type: string;
  client_id?: string;
  client_name?: string;
  project_id?: string;
  project_name?: string;
  amount: number;
  frequency: string;
  next_payment_date?: string;
  status: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  total_revenue?: number;
  last_payment_date?: string;
  contract_value?: number;
}

export default function RevenueStreamsPage() {
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  useEffect(() => {
    fetchRevenueStreams();
  }, []);

  const fetchRevenueStreams = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue streams...');
      const response = await revenueAPI.getRevenueStreams();
      console.log('API Response:', response);
      setRevenueStreams(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch revenue streams:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load revenue streams - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockRevenueStreams: RevenueStream[] = [
        {
          id: '1',
          name: 'Monthly Retainer - Acme Corp',
          description: 'Ongoing development and support services',
          stream_type: 'retainer',
          client_id: '1',
          client_name: 'Acme Corporation',
          amount: 5000.00,
          frequency: 'monthly',
          next_payment_date: '2025-01-01',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2025-12-31',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-12-20T14:30:00Z',
          total_revenue: 60000.00,
          last_payment_date: '2024-12-01',
          contract_value: 60000.00,
        },
        {
          id: '2',
          name: 'Project Milestone Payments - Global Industries',
          description: 'E-commerce platform development milestones',
          stream_type: 'project',
          client_id: '2',
          client_name: 'Global Industries',
          project_id: '1',
          project_name: 'E-commerce Platform',
          amount: 15000.00,
          frequency: 'milestone',
          next_payment_date: '2024-12-30',
          status: 'active',
          start_date: '2024-06-01',
          end_date: '2025-03-31',
          created_at: '2024-06-01T09:00:00Z',
          updated_at: '2024-12-20T10:15:00Z',
          total_revenue: 75000.00,
          last_payment_date: '2024-11-30',
          contract_value: 75000.00,
        },
        {
          id: '3',
          name: 'SaaS Subscription Revenue',
          description: 'Monthly SaaS platform subscriptions',
          stream_type: 'subscription',
          amount: 8500.00,
          frequency: 'monthly',
          next_payment_date: '2025-01-05',
          status: 'active',
          start_date: '2024-03-01',
          created_at: '2024-03-01T11:00:00Z',
          updated_at: '2024-12-20T16:45:00Z',
          total_revenue: 85000.00,
          last_payment_date: '2024-12-05',
          contract_value: 0,
        },
        {
          id: '4',
          name: 'Consulting Services - StartUp Ventures',
          description: 'Strategic consulting and advisory services',
          stream_type: 'consulting',
          client_id: '3',
          client_name: 'StartUp Ventures',
          amount: 3000.00,
          frequency: 'quarterly',
          next_payment_date: '2025-01-15',
          status: 'pending',
          start_date: '2024-10-01',
          created_at: '2024-10-01T13:00:00Z',
          updated_at: '2024-12-20T13:00:00Z',
          total_revenue: 0,
          contract_value: 12000.00,
        },
        {
          id: '5',
          name: 'License Revenue - Tech Solutions',
          description: 'Software license and maintenance fees',
          stream_type: 'license',
          client_id: '4',
          client_name: 'Tech Solutions Ltd',
          amount: 2000.00,
          frequency: 'annually',
          next_payment_date: '2025-06-01',
          status: 'active',
          start_date: '2024-06-01',
          end_date: '2026-05-31',
          created_at: '2024-06-01T10:30:00Z',
          updated_at: '2024-12-20T09:30:00Z',
          total_revenue: 2000.00,
          last_payment_date: '2024-06-01',
          contract_value: 4000.00,
        },
      ];

      setRevenueStreams(mockRevenueStreams);
    } finally {
      setLoading(false);
    }
  };

  const filteredRevenueStreams = revenueStreams.filter((stream) => {
    const matchesSearch = 
      stream.name.toLowerCase().includes(search.toLowerCase()) ||
      stream.description.toLowerCase().includes(search.toLowerCase()) ||
      (stream.client_name?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (stream.project_name?.toLowerCase().includes(search.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || stream.status === statusFilter;
    const matchesType = typeFilter === 'all' || stream.stream_type === typeFilter;
    const matchesFrequency = frequencyFilter === 'all' || stream.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesType && matchesFrequency;
  });

  const streamTypes = [...new Set(revenueStreams.map(s => s.stream_type))];
  const frequencies = [...new Set(revenueStreams.map(s => s.frequency))];
  const activeCount = revenueStreams.filter(s => s.status === 'active').length;
  const pendingCount = revenueStreams.filter(s => s.status === 'pending').length;
  const totalMonthlyRevenue = revenueStreams
    .filter(s => s.status === 'active' && s.frequency === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);
  const totalContractValue = revenueStreams.reduce((sum, s) => sum + (s.contract_value || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'inactive': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'cancelled': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retainer': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'subscription': return 'bg-green-100 text-green-800';
      case 'consulting': return 'bg-orange-100 text-orange-800';
      case 'license': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annually': return 'bg-green-100 text-green-800';
      case 'milestone': return 'bg-orange-100 text-orange-800';
      case 'weekly': return 'bg-indigo-100 text-indigo-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Revenue Streams</h1>
              <p className="text-gray-600">Manage recurring revenue and income sources</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/revenue/revenue-streams/performance">
                <Button variant="outline" className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Performance
                </Button>
              </Link>
              <Link href="/revenue/revenue-streams/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Stream
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Streams</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueStreams.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthlyRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contract Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalContractValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Revenue Streams
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
                    placeholder="Search by name, description, or client..."
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
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  {streamTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={frequencyFilter}
                  onChange={(e) => setFrequencyFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Frequencies</option>
                  {frequencies.map(frequency => (
                    <option key={frequency} value={frequency}>{frequency}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Revenue Streams List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredRevenueStreams.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredRevenueStreams.map((stream) => (
                  <div key={stream.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{stream.name}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(stream.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(stream.status)}
                                  <span className="ml-1">{stream.status}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(stream.stream_type)}`}>
                                {stream.stream_type}
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getFrequencyColor(stream.frequency)}`}>
                                {stream.frequency}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                {formatCurrency(stream.amount)}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Started: {formatDate(stream.start_date)}
                              </span>
                              {stream.next_payment_date && (
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Next: {formatDate(stream.next_payment_date)}
                                </span>
                              )}
                              {stream.end_date && (
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Ends: {formatDate(stream.end_date)}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{stream.description}</p>
                            </div>
                            {stream.client_name && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                Client: {stream.client_name}
                              </div>
                            )}
                            {stream.project_name && (
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <ChartBarIcon className="h-4 w-4 mr-1" />
                                Project: {stream.project_name}
                              </div>
                            )}
                            {stream.total_revenue && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                Total Revenue: {formatCurrency(stream.total_revenue)}
                              </div>
                            )}
                            {stream.last_payment_date && (
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Last Payment: {formatDate(stream.last_payment_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Link href={`/revenue/revenue-streams/${stream.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Link href={`/revenue/revenue-streams/${stream.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Link href={`/revenue/revenue-streams/${stream.id}/analytics`}>
                          <Button variant="outline" size="sm">Analytics</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No revenue streams found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || typeFilter !== 'all' || frequencyFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new revenue stream'
                  }
                </p>
                {!search && statusFilter === 'all' && typeFilter === 'all' && frequencyFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/revenue/revenue-streams/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Stream
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
