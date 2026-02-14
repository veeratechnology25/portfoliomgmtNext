'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { revenueAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  BanknotesIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RevenueCollection {
  id: string;
  client_name: string;
  client_id: string;
  invoice_number: string;
  invoice_id: string;
  amount: number;
  due_date: string;
  collection_date?: string;
  status: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  collected_by?: string;
  reference_number?: string;
}

export default function RevenueCollectionsPage() {
  const [collections, setCollections] = useState<RevenueCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue collections...');
      const response = await revenueAPI.getCollections();
      console.log('API Response:', response);
      setCollections(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch collections:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load revenue collections - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockCollections: RevenueCollection[] = [
        {
          id: '1',
          client_name: 'Acme Corporation',
          client_id: '1',
          invoice_number: 'INV-2024-001',
          invoice_id: '1',
          amount: 15000.00,
          due_date: '2024-12-20',
          collection_date: '2024-12-18',
          status: 'collected',
          payment_method: 'bank_transfer',
          notes: 'Payment received via wire transfer',
          created_at: '2024-12-15T10:00:00Z',
          updated_at: '2024-12-18T14:30:00Z',
          collected_by: 'John Smith',
          reference_number: 'TRX123456',
        },
        {
          id: '2',
          client_name: 'Global Industries',
          client_id: '2',
          invoice_number: 'INV-2024-002',
          invoice_id: '2',
          amount: 7500.00,
          due_date: '2024-12-25',
          status: 'pending',
          payment_method: undefined,
          notes: 'Payment reminder sent',
          created_at: '2024-12-10T11:00:00Z',
          updated_at: '2024-12-20T09:15:00Z',
        },
        {
          id: '3',
          client_name: 'StartUp Ventures',
          client_id: '3',
          invoice_number: 'INV-2024-003',
          invoice_id: '3',
          amount: 25000.00,
          due_date: '2024-12-15',
          collection_date: '2024-12-22',
          status: 'overdue',
          payment_method: undefined,
          notes: 'Follow-up required - payment overdue',
          created_at: '2024-11-30T09:00:00Z',
          updated_at: '2024-12-22T16:45:00Z',
        },
        {
          id: '4',
          client_name: 'Tech Solutions Ltd',
          client_id: '4',
          invoice_number: 'INV-2024-004',
          invoice_id: '4',
          amount: 12000.00,
          due_date: '2024-12-28',
          status: 'scheduled',
          payment_method: 'credit_card',
          notes: 'Auto-payment scheduled',
          created_at: '2024-12-20T13:00:00Z',
          updated_at: '2024-12-20T13:00:00Z',
        },
      ];

      setCollections(mockCollections);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCleared = async (id: string) => {
    try {
      console.log('Marking collection as cleared:', id);
      await revenueAPI.markCollectionCleared(id);
      toast.success('Collection marked as cleared successfully');
      fetchCollections();
    } catch (error: any) {
      console.error('Failed to mark collection as cleared:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      toast.error('Failed to mark collection as cleared');
    }
  };

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = 
      collection.client_name.toLowerCase().includes(search.toLowerCase()) ||
      collection.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (collection.reference_number?.toLowerCase().includes(search.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || collection.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || collection.payment_method === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const paymentMethods = [...new Set(collections.map(c => c.payment_method).filter(Boolean))];
  const collectedCount = collections.filter(c => c.status === 'collected').length;
  const pendingCount = collections.filter(c => c.status === 'pending').length;
  const overdueCount = collections.filter(c => c.status === 'overdue').length;
  const totalCollected = collections.filter(c => c.status === 'collected').reduce((sum, c) => sum + c.amount, 0);
  const totalPending = collections.filter(c => c.status !== 'collected').reduce((sum, c) => sum + c.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collected': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'overdue': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'scheduled': return <CalendarIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getPaymentMethodColor = (method: string | null) => {
    switch (method) {
      case 'bank_transfer': return 'bg-blue-100 text-blue-800';
      case 'credit_card': return 'bg-purple-100 text-purple-800';
      case 'debit_card': return 'bg-indigo-100 text-indigo-800';
      case 'cash': return 'bg-green-100 text-green-800';
      case 'check': return 'bg-yellow-100 text-yellow-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Revenue Collections</h1>
              <p className="text-gray-600">Manage payment collections and track receivables</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/revenue/collections/overdue">
                <Button variant="outline" className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Overdue
                </Button>
              </Link>
              <Link href="/revenue/collections/report">
                <Button variant="outline" className="flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>
              <Link href="/revenue/collections/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Collection
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <BanknotesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Collections</p>
                  <p className="text-2xl font-bold text-gray-900">{collections.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Collected</p>
                  <p className="text-2xl font-bold text-gray-900">{collectedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Collected Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCollected)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Collections
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
                    placeholder="Search by client, invoice, or reference..."
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
                  <option value="collected">Collected</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Collections List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredCollections.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredCollections.map((collection) => (
                  <div key={collection.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <BanknotesIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{collection.client_name}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(collection.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(collection.status)}
                                  <span className="ml-1">{collection.status}</span>
                                </span>
                              </span>
                              {collection.payment_method && (
                                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(collection.payment_method)}`}>
                                  {collection.payment_method}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                Invoice: {collection.invoice_number}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Due: {formatDate(collection.due_date)}
                              </span>
                              {collection.collection_date && (
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Collected: {formatDate(collection.collection_date)}
                                </span>
                              )}
                              {collection.reference_number && (
                                <span className="flex items-center">
                                  <BanknotesIcon className="h-4 w-4 mr-1" />
                                  Ref: {collection.reference_number}
                                </span>
                              )}
                            </div>
                            {collection.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>{collection.notes}</p>
                              </div>
                            )}
                            {collection.collected_by && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <UserIcon className="h-4 w-4 mr-1" />
                                Collected by: {collection.collected_by}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(collection.amount)}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Link href={`/revenue/collections/${collection.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/revenue/collections/${collection.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            {collection.status !== 'collected' && collection.status !== 'cancelled' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleMarkCleared(collection.id)}
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
                <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No collections found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || paymentMethodFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new collection record'
                  }
                </p>
                {!search && statusFilter === 'all' && paymentMethodFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/revenue/collections/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Collection
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
