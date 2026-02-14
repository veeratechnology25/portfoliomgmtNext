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
  EllipsisVerticalIcon,
  ReceiptRefundIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils';
import Link from 'next/link';
import { Budget } from '@/types/finance';

export default function FinancePage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const response = await financeAPI.getBudgets();
        setBudgets(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch budgets:', error);
        // Fallback to mock data if API fails
        const mockBudgets: Budget[] = [
          {
            id: '1',
            name: 'Marketing Campaign 2024',
            code: 'MKT-2024-001',
            description: 'Annual marketing and advertising budget for 2024',
            department_name: 'Marketing',
            project_name: 'Brand Awareness Campaign',
            total_amount: '100000.00',
            allocated_amount: '85000.00',
            utilized_amount: '62000.00',
            remaining_amount: '38000.00',
            utilization_rate: 62.0,
            variance: '-38000.00',
            fiscal_year: 2024,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            status: 'approved',
            approved_by_name: 'John Smith',
            approved_date: '2024-01-15',
            created_by_name: 'Sarah Johnson',
            created_at: '2023-12-15T10:00:00Z',
            updated_at: '2024-01-20T14:30:00Z',
          },
          {
            id: '2',
            name: 'Software Development Tools',
            code: 'DEV-2024-001',
            description: 'Software licenses and development tools budget',
            department_name: 'Engineering',
            total_amount: '50000.00',
            allocated_amount: '45000.00',
            utilized_amount: '38500.00',
            remaining_amount: '11500.00',
            utilization_rate: 77.0,
            variance: '-11500.00',
            fiscal_year: 2024,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            status: 'active',
            approved_by_name: 'Jane Wilson',
            approved_date: '2024-01-10',
            created_by_name: 'Mike Brown',
            created_at: '2023-12-20T11:00:00Z',
            updated_at: '2024-01-18T16:20:00Z',
          },
          {
            id: '3',
            name: 'Office Operations',
            code: 'OPS-2024-001',
            description: 'Office supplies and operational expenses',
            department_name: 'Operations',
            total_amount: '30000.00',
            allocated_amount: '28000.00',
            utilized_amount: '21500.00',
            remaining_amount: '8500.00',
            utilization_rate: 71.7,
            variance: '-8500.00',
            fiscal_year: 2024,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            status: 'active',
            approved_by_name: 'Tom Davis',
            approved_date: '2024-01-08',
            created_by_name: 'Lisa Anderson',
            created_at: '2023-12-10T09:00:00Z',
            updated_at: '2024-01-22T10:15:00Z',
          },
          {
            id: '4',
            name: 'Training & Development',
            code: 'HR-2024-001',
            description: 'Employee training and development programs',
            department_name: 'Human Resources',
            total_amount: '25000.00',
            allocated_amount: '20000.00',
            utilized_amount: '12000.00',
            remaining_amount: '13000.00',
            utilization_rate: 48.0,
            variance: '13000.00',
            fiscal_year: 2024,
            start_date: '2024-01-01',
            end_date: '2024-06-30',
            status: 'approved',
            approved_by_name: 'Emma Thompson',
            approved_date: '2024-01-12',
            created_by_name: 'David Lee',
            created_at: '2023-12-18T13:00:00Z',
            updated_at: '2024-01-19T11:45:00Z',
          },
          {
            id: '5',
            name: 'Q1 Research Project',
            code: 'RND-2024-Q1',
            description: 'Research and development for Q1 innovations',
            department_name: 'R&D',
            project_name: 'Innovation Initiative',
            total_amount: '75000.00',
            allocated_amount: '75000.00',
            utilized_amount: '45000.00',
            remaining_amount: '30000.00',
            utilization_rate: 60.0,
            variance: '30000.00',
            fiscal_year: 2024,
            start_date: '2024-01-01',
            end_date: '2024-03-31',
            status: 'under_review',
            approved_by_name: undefined,
            approved_date: undefined,
            created_by_name: 'Dr. Robert Chen',
            created_at: '2024-01-05T08:00:00Z',
            updated_at: '2024-01-21T15:30:00Z',
          },
        ];

        setBudgets(mockBudgets);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch = budget.name.toLowerCase().includes(search.toLowerCase()) ||
                         budget.description?.toLowerCase().includes(search.toLowerCase()) ||
                         budget.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || budget.department_name === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = [...new Set(budgets.map(b => b.department_name).filter(Boolean))];

  const getBudgetUtilization = (budget: Budget) => {
    return budget.utilization_rate || 0;
  };

  const getSpendingStatus = (utilization: number) => {
    if (utilization > 90) return { color: 'red', text: 'Over Budget' };
    if (utilization > 75) return { color: 'yellow', text: 'At Risk' };
    return { color: 'green', text: 'On Track' };
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Management</h1>
              <p className="text-gray-600">Manage budgets and track expenses</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/finance/budgets">
                <Button variant="outline" className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Budgets
                </Button>
              </Link>
              <Link href="/finance/expenses">
                <Button variant="outline" className="flex items-center">
                  <ReceiptRefundIcon className="h-4 w-4 mr-2" />
                  Expenses
                </Button>
              </Link>
              <Link href="/finance/budgets/create">
                <Button className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Budget
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
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(budgets.reduce((sum, b) => sum + parseFloat(b.total_amount), 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Allocated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(budgets.reduce((sum, b) => sum + parseFloat(b.allocated_amount), 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilized</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(budgets.reduce((sum, b) => sum + parseFloat(b.utilized_amount), 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      budgets.reduce((sum, b) => sum + parseFloat(b.remaining_amount || '0'), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Budgets
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
                    placeholder="Search budgets..."
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
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
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
                  {departments.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Budgets List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="min-w-full divide-y divide-gray-200">
              <div className="bg-gray-50 px-6 py-3">
                <h3 className="text-lg font-medium text-gray-900">Budgets</h3>
              </div>
              <div className="bg-white divide-y divide-gray-200">
                {filteredBudgets.map((budget) => {
                  const utilization = getBudgetUtilization(budget);
                  const spendingStatus = getSpendingStatus(utilization);
                  
                  return (
                    <div key={budget.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {budget.name}
                              </h3>
                              <p className="text-sm text-gray-500">{budget.description}</p>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span>{budget.department_name || 'No Department'}</span>
                                <span>•</span>
                                <span>FY {budget.fiscal_year}</span>
                                <span>•</span>
                                <span>Code: {budget.code}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                spendingStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                spendingStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {spendingStatus.text}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatPercentage(utilization / 100)}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              {formatCurrency(parseFloat(budget.utilized_amount))} / {formatCurrency(parseFloat(budget.allocated_amount))}
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              spendingStatus.color === 'red' ? 'bg-red-600' :
                              spendingStatus.color === 'yellow' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {filteredBudgets.length === 0 && (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets found</h3>
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
