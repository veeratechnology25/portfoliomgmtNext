'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { financeAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  ReceiptRefundIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  status: string;
  date: string;
  submitted_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  approved_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  budget?: {
    id: string;
    name: string;
  };
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getExpenses();
      setExpenses(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
      // Fallback to mock data if API fails
      const mockExpenses: Expense[] = [
        {
          id: '1',
          title: 'Office Supplies',
          description: 'Stationery and office materials for Q1',
          amount: 450.00,
          category: 'Office Supplies',
          status: 'approved',
          date: '2024-01-15',
          submitted_by: {
            id: '2',
            first_name: 'John',
            last_name: 'Doe',
          },
          budget: {
            id: '1',
            name: 'Q1 Marketing Budget',
          },
          receipt_url: '/receipts/office-supplies.pdf',
          created_at: '2024-01-15',
          updated_at: '2024-01-16',
        },
        {
          id: '2',
          title: 'Software License',
          description: 'Annual license for development tools',
          amount: 1200.00,
          category: 'Software',
          status: 'pending',
          date: '2024-01-18',
          submitted_by: {
            id: '3',
            first_name: 'Mike',
            last_name: 'Johnson',
          },
          budget: {
            id: '2',
            name: 'Development Tools',
          },
          receipt_url: '/receipts/software-license.pdf',
          created_at: '2024-01-18',
          updated_at: '2024-01-18',
        },
        {
          id: '3',
          title: 'Team Lunch',
          description: 'Team building lunch meeting',
          amount: 185.50,
          category: 'Meals & Entertainment',
          status: 'approved',
          date: '2024-01-12',
          submitted_by: {
            id: '4',
            first_name: 'Sarah',
            last_name: 'Wilson',
          },
          budget: {
            id: '3',
            name: 'Team Building',
          },
          receipt_url: '/receipts/team-lunch.pdf',
          created_at: '2024-01-12',
          updated_at: '2024-01-13',
        },
        {
          id: '4',
          title: 'Travel Expense',
          description: 'Flight and hotel for client meeting',
          amount: 850.00,
          category: 'Travel',
          status: 'rejected',
          date: '2024-01-10',
          submitted_by: {
            id: '5',
            first_name: 'Tom',
            last_name: 'Brown',
          },
          budget: {
            id: '1',
            name: 'Q1 Marketing Budget',
          },
          receipt_url: '/receipts/travel.pdf',
          created_at: '2024-01-10',
          updated_at: '2024-01-11',
        },
        {
          id: '5',
          title: 'Training Course',
          description: 'Professional development training',
          amount: 350.00,
          category: 'Training',
          status: 'approved',
          date: '2024-01-20',
          submitted_by: {
            id: '6',
            first_name: 'Lisa',
            last_name: 'Davis',
          },
          budget: {
            id: '4',
            name: 'Training & Development',
          },
          receipt_url: '/receipts/training-course.pdf',
          created_at: '2024-01-20',
          updated_at: '2024-01-20',
        },
      ];

      setExpenses(mockExpenses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await financeAPI.deleteExpense(id);
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await financeAPI.approveExpense(id);
      toast.success('Expense approved successfully');
      fetchExpenses();
    } catch (error) {
      console.error('Failed to approve expense:', error);
      toast.error('Failed to approve expense');
    }
  };

  const handleReject = async (id: string) => {
    const comments = prompt('Please provide rejection comments:');
    if (!comments) return;

    try {
      await financeAPI.rejectExpense(id, { comments });
      toast.success('Expense rejected successfully');
      fetchExpenses();
    } catch (error) {
      console.error('Failed to reject expense:', error);
      toast.error('Failed to reject expense');
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = (expense.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (expense.description?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(expenses.map(e => e.category))];
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
              <p className="text-gray-600">Track and manage expense reports</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/finance">
                <Button variant="outline">Back to Finance</Button>
              </Link>
              <Link href="/finance/expenses/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Expense
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ReceiptRefundIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{filteredExpenses.length} expenses</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {expenses.filter(e => e.status === 'approved').length} Approved
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {expenses.filter(e => e.status === 'pending').length} Pending
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {expenses.filter(e => e.status === 'rejected').length} Rejected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Expenses
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
                    placeholder="Search expenses..."
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
                  <option key="all" value="all">All Status</option>
                  <option key="pending" value="pending">Pending</option>
                  <option key="approved" value="approved">Approved</option>
                  <option key="rejected" value="rejected">Rejected</option>
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
                  <option key="all" value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="min-w-full divide-y divide-gray-200">
              <div className="bg-gray-50 px-6 py-3">
                <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
              </div>
              <div className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <ReceiptRefundIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {expense.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                                {expense.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{expense.description}</p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{expense.category}</span>
                              <span>•</span>
                              <span>{formatDate(expense.date)}</span>
                              <span>•</span>
                              <span>Submitted by {expense.submitted_by?.first_name || 'Unknown'} {expense.submitted_by?.last_name || ''}</span>
                              {expense.approved_by && (
                                <>
                                  <span>•</span>
                                  <span>Approved by {expense.approved_by?.first_name || 'Unknown'} {expense.approved_by?.last_name || ''}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-medium text-gray-900">{formatCurrency(expense.amount)}</p>
                          <p className="text-sm text-gray-500">{expense.budget?.name || 'Unknown Budget'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/finance/expenses/${expense.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Link href={`/finance/expenses/${expense.id}/edit`}>
                            <button className="text-gray-400 hover:text-blue-600">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(expense.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          {expense.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(expense.id)}
                                className="text-gray-400 hover:text-green-600"
                                title="Approve Expense"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(expense.id)}
                                className="text-gray-400 hover:text-red-600"
                                title="Reject Expense"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {expense.receipt_url && (
                            <Button variant="outline" size="sm">
                              View Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredExpenses.length === 0 && (
              <div className="text-center py-12">
                <ReceiptRefundIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
