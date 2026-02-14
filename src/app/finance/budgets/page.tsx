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
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Budget {
  id: string;
  name: string;
  code: string;
  description?: string;
  department_name?: string;
  project_name?: string;
  total_amount: string;
  allocated_amount: string;
  utilized_amount: string;
  remaining_amount: string;
  utilization_rate: number;
  variance: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  line_items_count?: number;
  approvals_count?: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getBudgets();
      setBudgets(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      await financeAPI.deleteBudget(id);
      toast.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await financeAPI.approveBudget(id);
      toast.success('Budget approved successfully');
      fetchBudgets();
    } catch (error) {
      console.error('Failed to approve budget:', error);
      toast.error('Failed to approve budget');
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      await financeAPI.submitBudgetForApproval(id);
      toast.success('Budget submitted for approval');
      fetchBudgets();
    } catch (error) {
      console.error('Failed to submit budget:', error);
      toast.error('Failed to submit budget');
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <ClockIcon className="h-4 w-4" />;
      case 'submitted': return <ClockIcon className="h-4 w-4" />;
      case 'under_review': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'closed': return <ClockIcon className="h-4 w-4" />;
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
              <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
              <p className="text-gray-600">Manage and track budget allocations and utilization</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/finance/expenses">
                <Button variant="outline">View Expenses</Button>
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
                    {formatCurrency(budgets.reduce((sum, b) => sum + parseFloat(b.remaining_amount), 0))}
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
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Budgets List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredBudgets.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredBudgets.map((budget) => {
                  const utilization = getBudgetUtilization(budget);
                  const spendingStatus = getSpendingStatus(utilization);
                  
                  return (
                    <div key={budget.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-900">{budget.name}</h3>
                                <span className="ml-3 text-sm text-gray-500">{budget.code}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBudgetStatusColor(budget.status)}`}>
                                  {budget.status.replace('_', ' ').toUpperCase()}
                                </span>
                                {budget.department_name && (
                                  <span className="ml-3 text-sm text-gray-500">{budget.department_name}</span>
                                )}
                                {budget.project_name && (
                                  <>
                                    <span className="mx-2 text-gray-300">•</span>
                                    <span className="text-sm text-gray-500">{budget.project_name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {budget.description && (
                            <div className="mt-3">
                              <p className="text-gray-600 text-sm line-clamp-2">{budget.description}</p>
                            </div>
                          )}

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Total Budget</p>
                              <p className="text-lg font-medium text-gray-900">
                                {formatCurrency(parseFloat(budget.total_amount))}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Allocated</p>
                              <p className="text-lg font-medium text-gray-900">
                                {formatCurrency(parseFloat(budget.allocated_amount))}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Utilized</p>
                              <p className="text-lg font-medium text-gray-900">
                                {formatCurrency(parseFloat(budget.utilized_amount))}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Remaining</p>
                              <p className="text-lg font-medium text-gray-900">
                                {formatCurrency(parseFloat(budget.remaining_amount))}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Budget Utilization</span>
                              <span className={`text-sm font-medium ${
                                spendingStatus.color === 'red' ? 'text-red-600' :
                                spendingStatus.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {formatPercentage(utilization / 100)} • {spendingStatus.text}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  spendingStatus.color === 'red' ? 'bg-red-600' :
                                  spendingStatus.color === 'yellow' ? 'bg-yellow-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${utilization}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>Created by {budget.created_by_name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDate(budget.created_at)}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              {budget.line_items_count !== undefined && (
                                <span>{budget.line_items_count} line items</span>
                              )}
                              {budget.approvals_count !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>{budget.approvals_count} approvals</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 flex items-center space-x-2">
                          <Link href={`/finance/budgets/${budget.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Link href={`/finance/budgets/${budget.id}/edit`}>
                            <button className="text-gray-400 hover:text-blue-600">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(budget.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          {budget.status === 'draft' && (
                            <button
                              onClick={() => handleSubmitForApproval(budget.id)}
                              className="text-gray-400 hover:text-blue-600"
                              title="Submit for Approval"
                            >
                              <ClockIcon className="h-4 w-4" />
                            </button>
                          )}
                          {budget.status === 'under_review' && (
                            <button
                              onClick={() => handleApprove(budget.id)}
                              className="text-gray-400 hover:text-green-600"
                              title="Approve Budget"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter !== 'all' || departmentFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating a new budget'
                  }
                </p>
                {!search && statusFilter === 'all' && departmentFilter === 'all' && (
                  <div className="mt-6">
                    <Link href="/finance/budgets/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Budget
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
