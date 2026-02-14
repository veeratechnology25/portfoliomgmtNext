'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { revenueAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RevenueClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  industry: string;
  status: string;
  total_revenue: number;
  outstanding_amount: number;
  last_invoice_date: string;
  created_at: string;
  updated_at: string;
  contact_person?: string;
  payment_terms?: string;
  credit_limit?: number;
}

export default function RevenueClientsPage() {
  const [clients, setClients] = useState<RevenueClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue clients...');
      const response = await revenueAPI.getClients();
      console.log('API Response:', response);
      setClients(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load revenue clients - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockClients: RevenueClient[] = [
        {
          id: '1',
          name: 'Acme Corporation',
          email: 'billing@acme.com',
          phone: '+1-555-0101',
          address: '123 Business Ave, New York, NY 10001',
          company: 'Acme Corporation',
          industry: 'Technology',
          status: 'active',
          total_revenue: 125000.00,
          outstanding_amount: 15000.00,
          last_invoice_date: '2024-12-15',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-12-15T09:30:00Z',
          contact_person: 'John Smith',
          payment_terms: 'Net 30',
          credit_limit: 50000.00,
        },
        {
          id: '2',
          name: 'Global Industries',
          email: 'finance@global.com',
          phone: '+1-555-0102',
          address: '456 Corporate Blvd, Los Angeles, CA 90001',
          company: 'Global Industries',
          industry: 'Manufacturing',
          status: 'active',
          total_revenue: 250000.00,
          outstanding_amount: 7500.00,
          last_invoice_date: '2024-12-10',
          created_at: '2024-02-20T11:00:00Z',
          updated_at: '2024-12-10T14:15:00Z',
          contact_person: 'Sarah Johnson',
          payment_terms: 'Net 15',
          credit_limit: 100000.00,
        },
        {
          id: '3',
          name: 'StartUp Ventures',
          email: 'accounts@startup.com',
          phone: '+1-555-0103',
          address: '789 Innovation Dr, San Francisco, CA 94105',
          company: 'StartUp Ventures',
          industry: 'Software',
          status: 'inactive',
          total_revenue: 75000.00,
          outstanding_amount: 0.00,
          last_invoice_date: '2024-11-30',
          created_at: '2024-03-10T09:00:00Z',
          updated_at: '2024-11-30T16:45:00Z',
          contact_person: 'Mike Davis',
          payment_terms: 'Net 45',
          credit_limit: 25000.00,
        },
      ];

      setClients(mockClients);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.company.toLowerCase().includes(search.toLowerCase()) ||
      (client.contact_person?.toLowerCase().includes(search.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const industries = [...new Set(clients.map(c => c.industry))];
  const activeCount = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.total_revenue, 0);
  const totalOutstanding = clients.reduce((sum, c) => sum + c.outstanding_amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Revenue Clients</h1>
              <p className="text-gray-600">Manage client relationships and billing information</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/revenue/clients/top-clients">
                <Button variant="outline" className="flex items-center">
                  <StarIcon className="h-4 w-4 mr-2" />
                  Top Clients
                </Button>
              </Link>
              <Link href="/revenue/clients/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Clients
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
                    placeholder="Search by name, email, or company..."
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
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Clients List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredClients.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <div key={client.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <UserGroupIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                                {client.status}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                {client.email}
                              </span>
                              <span className="flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {client.phone}
                              </span>
                              <span className="flex items-center">
                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                {client.industry}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {client.address}
                              </p>
                              {client.contact_person && (
                                <p className="mt-1">Contact: {client.contact_person}</p>
                              )}
                              {client.payment_terms && (
                                <p className="mt-1">Payment Terms: {client.payment_terms}</p>
                              )}
                            </div>
                            <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                Total Revenue: {formatCurrency(client.total_revenue)}
                              </span>
                              <span className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                Outstanding: {formatCurrency(client.outstanding_amount)}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Last Invoice: {formatDate(client.last_invoice_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Link href={`/revenue/clients/${client.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Link href={`/revenue/clients/${client.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Link href={`/revenue/clients/${client.id}/revenue-summary`}>
                          <Button variant="outline" size="sm">Summary</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || industryFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new client'
                  }
                </p>
                {!search && statusFilter === 'all' && industryFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/revenue/clients/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Client
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
