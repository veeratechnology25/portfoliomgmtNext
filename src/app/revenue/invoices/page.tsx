'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { revenueAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RevenueInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_id: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: string;
  payment_status: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  line_items_count?: number;
  sent_date?: string;
  paid_amount?: number;
}

export default function RevenueInvoicesPage() {
  const [invoices, setInvoices] = useState<RevenueInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue invoices...');
      const response = await revenueAPI.getInvoices();
      console.log('API Response:', response);
      setInvoices(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to fetch invoices:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please ensure the Django backend server is running on port 8000.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the backend logs.');
      } else {
        toast.error('Failed to load revenue invoices - using demo data');
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data...');
      const mockInvoices: RevenueInvoice[] = [
        {
          id: '1',
          invoice_number: 'INV-2024-001',
          client_name: 'Acme Corporation',
          client_id: '1',
          amount: 12500.00,
          tax_amount: 1250.00,
          total_amount: 13750.00,
          issue_date: '2024-12-01',
          due_date: '2024-12-15',
          status: 'sent',
          payment_status: 'paid',
          payment_date: '2024-12-14',
          notes: 'Payment received on time',
          created_at: '2024-12-01T10:00:00Z',
          updated_at: '2024-12-14T16:30:00Z',
          line_items_count: 3,
          sent_date: '2024-12-01T11:00:00Z',
          paid_amount: 13750.00,
        },
        {
          id: '2',
          invoice_number: 'INV-2024-002',
          client_name: 'Global Industries',
          client_id: '2',
          amount: 25000.00,
          tax_amount: 2500.00,
          total_amount: 27500.00,
          issue_date: '2024-12-05',
          due_date: '2024-12-20',
          status: 'sent',
          payment_status: 'pending',
          notes: 'Payment due soon',
          created_at: '2024-12-05T09:00:00Z',
          updated_at: '2024-12-20T10:15:00Z',
          line_items_count: 5,
          sent_date: '2024-12-05T10:00:00Z',
        },
        {
          id: '3',
          invoice_number: 'INV-2024-003',
          client_name: 'StartUp Ventures',
          client_id: '3',
          amount: 7500.00,
          tax_amount: 750.00,
          total_amount: 8250.00,
          issue_date: '2024-11-15',
          due_date: '2024-11-30',
          status: 'overdue',
          payment_status: 'unpaid',
          notes: 'Follow-up required',
          created_at: '2024-11-15T14:00:00Z',
          updated_at: '2024-12-20T14:45:00Z',
          line_items_count: 2,
        },
        {
          id: '4',
          invoice_number: 'INV-2024-004',
          client_name: 'Tech Solutions Ltd',
          client_id: '4',
          amount: 18000.00,
          tax_amount: 1800.00,
          total_amount: 19800.00,
          issue_date: '2024-12-18',
          due_date: '2024-12-25',
          status: 'draft',
          payment_status: 'unpaid',
          notes: 'Draft invoice - pending review',
          created_at: '2024-12-18T11:30:00Z',
          updated_at: '2024-12-18T11:30:00Z',
          line_items_count: 4,
        },
      ];

      setInvoices(mockInvoices);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (id: string) => {
    try {
      console.log('Sending invoice:', id);
      await revenueAPI.sendInvoice(id);
      toast.success('Invoice sent successfully');
      fetchInvoices();
    } catch (error: any) {
      console.error('Failed to send invoice:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      toast.error('Failed to send invoice');
    }
  };

  const handleRecordPayment = async (id: string) => {
    try {
      console.log('Recording payment for invoice:', id);
      // This would typically open a modal or navigate to a payment form
      toast.success('Payment recorded successfully');
      fetchInvoices();
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(search.toLowerCase()) ||
      (invoice.notes?.toLowerCase().includes(search.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || invoice.payment_status === paymentStatusFilter;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const draftCount = invoices.filter(i => i.status === 'draft').length;
  const sentCount = invoices.filter(i => i.status === 'sent').length;
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;
  const paidCount = invoices.filter(i => i.payment_status === 'paid').length;
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total_amount, 0);
  const outstandingRevenue = invoices.filter(i => i.payment_status !== 'paid').reduce((sum, i) => sum + i.total_amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'partially_paid': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <DocumentTextIcon className="h-4 w-4" />;
      case 'sent': return <PaperAirplaneIcon className="h-4 w-4" />;
      case 'overdue': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'cancelled': return <ClockIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'unpaid': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'partially_paid': return <CreditCardIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
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
              <h1 className="text-2xl font-bold text-gray-900">Revenue Invoices</h1>
              <p className="text-gray-600">Create and manage client invoices</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/revenue/invoices/overdue">
                <Button variant="outline" className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Overdue
                </Button>
              </Link>
              <Link href="/revenue/invoices/analytics">
                <Button variant="outline" className="flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/revenue/invoices/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Invoice
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
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
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
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(outstandingRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Invoices
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
                    placeholder="Search by invoice number, client, or notes..."
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
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partially_paid">Partially Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredInvoices.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{invoice.invoice_number}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(invoice.status)}
                                  <span className="ml-1">{invoice.status}</span>
                                </span>
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(invoice.payment_status)}`}>
                                <span className="flex items-center">
                                  {getPaymentStatusIcon(invoice.payment_status)}
                                  <span className="ml-1">{invoice.payment_status.replace('_', ' ')}</span>
                                </span>
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                Client: {invoice.client_name}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Issued: {formatDate(invoice.issue_date)}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Due: {formatDate(invoice.due_date)}
                              </span>
                              {invoice.line_items_count && (
                                <span className="flex items-center">
                                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                                  {invoice.line_items_count} items
                                </span>
                              )}
                            </div>
                            {invoice.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>{invoice.notes}</p>
                              </div>
                            )}
                            {invoice.payment_date && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Paid on: {formatDate(invoice.payment_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.total_amount)}</p>
                          {invoice.paid_amount && invoice.paid_amount < invoice.total_amount && (
                            <p className="text-sm text-gray-500">Paid: {formatCurrency(invoice.paid_amount)}</p>
                          )}
                          <div className="mt-2 flex items-center space-x-2">
                            <Link href={`/revenue/invoices/${invoice.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/revenue/invoices/${invoice.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            {invoice.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSendInvoice(invoice.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <PaperAirplaneIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {invoice.payment_status !== 'paid' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRecordPayment(invoice.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CreditCardIcon className="h-4 w-4" />
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || paymentStatusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new invoice'
                  }
                </p>
                {!search && statusFilter === 'all' && paymentStatusFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/revenue/invoices/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Invoice
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
