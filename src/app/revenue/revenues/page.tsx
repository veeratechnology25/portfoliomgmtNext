'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { revenueAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RevenueRecord {
  id: string;
  title: string;
  description: string;
  amount: number;
  revenue_date: string;
  revenue_type: string;
  client_id?: string;
  client_name?: string;
  project_id?: string;
  project_name?: string;
  invoice_id?: string;
  invoice_number?: string;
  status: string;
  verified: boolean;
  verified_by?: string;
  verified_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  category?: string;
  payment_method?: string;
}

export default function RevenueRecordsPage() {
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  useEffect(() => {
    fetchRevenueRecords();
  }, []);

  const fetchRevenueRecords = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue records...');
      const response = await revenueAPI.getRevenues();
      console.log('API Response:', response);
      setRevenueRecords(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch revenue records:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load revenue records - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockRevenueRecords: RevenueRecord[] = [
        {
          id: '1',
          title: 'Monthly Retainer Payment',
          description: 'December retainer for ongoing development services',
          amount: 5000.00,
          revenue_date: '2024-12-01',
          revenue_type: 'retainer',
          client_id: '1',
          client_name: 'Acme Corporation',
          status: 'verified',
          verified: true,
          verified_by: 'John Smith',
          verified_date: '2024-12-02T10:00:00Z',
          created_at: '2024-12-01T09:00:00Z',
          updated_at: '2024-12-02T10:00:00Z',
          created_by: 'Sarah Johnson',
          category: 'Recurring Revenue',
          payment_method: 'bank_transfer',
        },
        {
          id: '2',
          title: 'Project Milestone Payment',
          description: 'E-commerce platform milestone 3 completion',
          amount: 15000.00,
          revenue_date: '2024-11-30',
          revenue_type: 'project',
          client_id: '2',
          client_name: 'Global Industries',
          project_id: '1',
          project_name: 'E-commerce Platform',
          invoice_id: '2',
          invoice_number: 'INV-2024-002',
          status: 'verified',
          verified: true,
          verified_by: 'Mike Davis',
          verified_date: '2024-12-01T14:30:00Z',
          created_at: '2024-11-30T16:00:00Z',
          updated_at: '2024-12-01T14:30:00Z',
          created_by: 'Emily Chen',
          category: 'Project Revenue',
          payment_method: 'wire_transfer',
        },
        {
          id: '3',
          title: 'Consulting Services',
          description: 'Strategic consulting session for Q4 planning',
          amount: 3000.00,
          revenue_date: '2024-12-15',
          revenue_type: 'consulting',
          client_id: '3',
          client_name: 'StartUp Ventures',
          status: 'pending',
          verified: false,
          created_at: '2024-12-15T11:00:00Z',
          updated_at: '2024-12-15T11:00:00Z',
          created_by: 'David Wilson',
          category: 'Service Revenue',
          payment_method: 'check',
        },
        {
          id: '4',
          title: 'SaaS Subscription Revenue',
          description: 'Monthly SaaS platform subscriptions',
          amount: 8500.00,
          revenue_date: '2024-12-05',
          revenue_type: 'subscription',
          status: 'verified',
          verified: true,
          verified_by: 'Sarah Johnson',
          verified_date: '2024-12-06T09:15:00Z',
          created_at: '2024-12-05T10:00:00Z',
          updated_at: '2024-12-06T09:15:00Z',
          created_by: 'System',
          category: 'Recurring Revenue',
          payment_method: 'credit_card',
        },
        {
          id: '5',
          title: 'License Fee Payment',
          description: 'Annual software license renewal',
          amount: 2000.00,
          revenue_date: '2024-12-10',
          revenue_type: 'license',
          client_id: '4',
          client_name: 'Tech Solutions Ltd',
          invoice_id: '5',
          invoice_number: 'INV-2024-005',
          status: 'pending',
          verified: false,
          created_at: '2024-12-10T13:30:00Z',
          updated_at: '2024-12-10T13:30:00Z',
          created_by: 'Lisa Anderson',
          category: 'License Revenue',
          payment_method: 'bank_transfer',
        },
      ];

      setRevenueRecords(mockRevenueRecords);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRevenue = async (id: string) => {
    try {
      console.log('Verifying revenue record:', id);
      await revenueAPI.verifyRevenue(id);
      toast.success('Revenue record verified successfully');
      fetchRevenueRecords();
    } catch (error: any) {
      console.error('Failed to verify revenue record:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      toast.error('Failed to verify revenue record');
    }
  };

  const filteredRevenueRecords = revenueRecords.filter((record) => {
    const matchesSearch = 
      record.title.toLowerCase().includes(search.toLowerCase()) ||
      record.description.toLowerCase().includes(search.toLowerCase()) ||
      (record.client_name?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (record.project_name?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (record.invoice_number?.toLowerCase().includes(search.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.revenue_type === typeFilter;
    const matchesVerified = verifiedFilter === 'all' || 
      (verifiedFilter === 'verified' && record.verified) ||
      (verifiedFilter === 'unverified' && !record.verified);

    return matchesSearch && matchesStatus && matchesType && matchesVerified;
  });

  const revenueTypes = [...new Set(revenueRecords.map(r => r.revenue_type))];
  const verifiedCount = revenueRecords.filter(r => r.verified).length;
  const pendingCount = revenueRecords.filter(r => !r.verified).length;
  const totalRevenue = revenueRecords.reduce((sum, r) => sum + r.amount, 0);
  const verifiedRevenue = revenueRecords.filter(r => r.verified).reduce((sum, r) => sum + r.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'rejected': return <ExclamationTriangleIcon className="h-4 w-4" />;
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
              <h1 className="text-2xl font-bold text-gray-900">Revenue Records</h1>
              <p className="text-gray-600">Track and verify all revenue transactions</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/revenue/revenues/analytics">
                <Button variant="outline" className="flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/revenue/revenues/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Record
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueRecords.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
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
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Revenue Records
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
                    placeholder="Search by title, description, or client..."
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
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
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
                  {revenueTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Revenue Records List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredRevenueRecords.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredRevenueRecords.map((record) => (
                  <div key={record.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{record.title}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(record.status)}
                                  <span className="ml-1">{record.status}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(record.revenue_type)}`}>
                                {record.revenue_type}
                              </span>
                              {record.verified && (
                                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  <CheckCircleIcon className="h-3 w-3 inline mr-1" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                {formatCurrency(record.amount)}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Date: {formatDate(record.revenue_date)}
                              </span>
                              {record.client_name && (
                                <span className="flex items-center">
                                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                  Client: {record.client_name}
                                </span>
                              )}
                              {record.invoice_number && (
                                <span className="flex items-center">
                                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                                  Invoice: {record.invoice_number}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{record.description}</p>
                            </div>
                            {record.project_name && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                Project: {record.project_name}
                              </div>
                            )}
                            {record.category && (
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <FunnelIcon className="h-4 w-4 mr-1" />
                                Category: {record.category}
                              </div>
                            )}
                            {record.payment_method && (
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                Payment Method: {record.payment_method.replace('_', ' ')}
                              </div>
                            )}
                            {record.verified && record.verified_by && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <UserIcon className="h-4 w-4 mr-1" />
                                Verified by: {record.verified_by} on {formatDate(record.verified_date || '')}
                              </div>
                            )}
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <UserIcon className="h-4 w-4 mr-1" />
                              Created by: {record.created_by} on {formatDate(record.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(record.amount)}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Link href={`/revenue/revenues/${record.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/revenue/revenues/${record.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            {!record.verified && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleVerifyRevenue(record.id)}
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
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No revenue records found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || typeFilter !== 'all' || verifiedFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new revenue record'
                  }
                </p>
                {!search && statusFilter === 'all' && typeFilter === 'all' && verifiedFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/revenue/revenues/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Record
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
